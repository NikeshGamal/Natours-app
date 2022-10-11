const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id=>{
     return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.EXPIRES_IN});
}

//function to create and send token
const createSendToken = (user,statuscode,res)=>{

    const token = signToken(user._id)
    res.status(statuscode).json({
        status:"success",
        token,
        data:{
            user:user,
        }
    });
}

exports.signup = catchAsync(async (req,res)=>{
    //creating documents using the model
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    });

    //creating a web token 
    createSendToken(newUser,201,res);


    // const token = signToken(newUser._id)
    // res.status(201).json({
    //     status:"success",
    //     token,
    //     data:{
    //         user:newUser,
    //     }
    // });
})

exports.login = catchAsync(async (req,res,next)=>{
    //need to read the email and password from the req.body and we use destructuring of the object
    const {email,password} = req.body;

    //if the email and password is exist
     if(!email || !password){
        return next(new AppError('Please provide email & password',400));
     }
    //if the user exists && password is correct
    //need to compare the user given password and database password
    //checking whether the user existst by checking for the email and password
    const user = await User.findOne({email}).select('+password');

    
    //here correctPassword method is a instance method that is a method which is available to all the instance of the document collection
    //For the instance method it is more related to the document (model) so we put the method in userModel
    if(!user || !(await user.correctPassword(password,user.password))){
      return next(new AppError('Incorrect Email or Incorrect password',400));
    }
    //if the everthing is okay then send token to the client

    createSendToken(user,200,res);

    // token = signToken(user._id);
    // res.status(200).json({
    //     status:"success",
    //     token,
    // })
});


exports.protect  = catchAsync(async(req,res,next)=>{
   // read the token and check if it exists
   let token;
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token  = req.headers.authorization.split(' ')[1];
   }
   console.log(token);

   //if token is not present then triger error
   if(!token){
    return next(new AppError('You are not logged In!!! Please log in again',401));
   }

   //verifying the token
   //here the callback function is converted to the promise using the promisifying method that we have the util section as it is more easy to handle the promise rather than callback function which may lead to the callback hell condition so 
   const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
   console.log(decoded);

   //check whether the user exists 
   const freshUser = await User.findById(decoded.id);
   console.log(freshUser);

   if(!freshUser){
    return next(new AppError('The user belonging to this token does no longer exists',401));
   }

   //chech if user change password after the token was issued
   //for the password change action we create an instance method as it id more relatable to the data modelling so the instance method is define at model
   const bool =await freshUser.changePasswordAfter(decoded.iat);
   if(bool){
    return next(new AppError('User recently changed password!!! Please login again',401));
   }


   //GRANT ACCESS  TO PROTECTED DATA
   req.user = freshUser;
   next();
});

//in the middleware we cant pass the argument so for the solution we create a wrapper function that returns the middleware so 

exports.restrictTo = (...roles) =>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action!!!',403));
        }
        next();
    }
}


//we send a post request forgetPassword route only with email address that we need to access from the request body and search whether the user with the email exists on the database or not which is a asynchronous process
exports.forgetPassword = catchAsync(async(req,res,next)=>{
  //email requested from the user
  const user = await User.findOne({email:req.body.email});
  if(!user){
    return next(new AppError('There is no user with email address',404));
  }
  //2.generate the random reset token
     //in order to reset the token we create a random token not jsonwebtoken in the schema section and save it there in the document
     const resetToken = user.createPasswordResetToken();
     await user.save({validateBeforeSave:false});

  //3.send it  user's email
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

   console.log(resetURL);
   const message = `Forget your Password! Submit your new password and passwordConfirm to: ${resetURL} \n If you did not forget your paassword, plwase ignore this email`;

   try{
    console.log('Entered in try block');
    console.log(user);
    
    await sendEmail({
        email:user.email,
        subject:'Your password reset token (valid for 10min)',
        message,
    });

    console.log('Status section');
    res.status(200).json({
        status:"success",
        message:"Token sent to email!"
    });

    console.log('Status section end');
   }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error sending the email. Try again later!!!',500));
   }
});

exports.resetPassword = async (req,res,next) =>{
//get the user based on the token 
  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.find({
    passwordResetToken:hashToken,
    passwordResetExpires: {$gt:Date.now()}
  });

  //2.if the token has not expired and there is , then set the new password
  if(!user){
    return next(new AppError('Token is invalid or has expired!',400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

   await User.save();
   //3.update the changed password
   //4.log the user in and send JWT
  createSendToken(user,200,res);

//    const token = signToken(user._id);
//    res.status(200).json({
//        status:"success",
//        token,
//    })
}


exports.updatePassword = async (req,res,next)=>{
    //1.to get the user from the collevtion
    const user = await User.findById(req.user.id).select('+password');

    //2.posted old password is correct
    if(!(await user.correctPassword(req.user.password,user.password))){
        return next(new AppError('Your current password is incorrect',401));
    }

    //3.if the password is correct then update
    user.password = req.user.password;
    user.passwordConfirm = req.user.passwordConfirm;
    User.save();//so validator will run as  it set to true so we need three fiels i.e.current password, new password and confirm new password
    
    //4.login and send the token
    createSendToken(user,200,res);
}

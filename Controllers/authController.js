const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../Models/userModel');
const AppError = require('../utils/appError');

const signToken = id=>{
     return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.EXPIRES_IN});
}

exports.signup = catchAsync(async (req,res)=>{
    //creating documents using the model
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
    });

    //creating a web token 
    const token = signToken(newUser._id)
    res.status(201).json({
        status:"success",
        token,
        data:{
            user:newUser,
        }
    });
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
    token = signToken(user._id);
    res.status(200).json({
        status:"success",
        token,
    })
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
//    console.log(decoded);

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
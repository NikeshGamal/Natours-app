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
        passwordConfirm:req.body.passwordConfirm
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
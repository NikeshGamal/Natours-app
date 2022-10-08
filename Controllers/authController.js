const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../Models/userModel');

exports.signup = catchAsync(async (req,res)=>{
    //creating documents using the model
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    //creating a web token 
    const token = jwt.sign({id:newUser.id},process.env.JWT_SECRET,{expiresIn:process.env.EXPIRES_IN});


    res.status(201).json({
        status:"success",
        token,
        data:{
            user:newUser,
        }
    });
})
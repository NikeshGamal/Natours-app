const catchAsync = require('../utils/catchAsync');
const User = require('../Models/userModel');

exports.signup = catchAsync(async (req,res)=>{
    //creating documents using the model
    const newUser = await User.create(req.body);

    res.status(201).json({
        status:"success",
        data:{
            user:newUser,
        }
    });
})
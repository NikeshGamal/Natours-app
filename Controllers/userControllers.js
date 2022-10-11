const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//----------Functions used in the routes-----------------
const filterObj = (obj, ...allowedFields) =>{
     const newObj = {}; //this object is to be updated and is return to update the database
     //looping through the fields and only updating if the field is allowed fields

     Object.keys(obj).forEach(el=>{
          if(allowedFields.includes(el)) newObj[el]= obj[el];
     });
     return newObj;
}


//******For Users*****
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'This route is not in used',
    },
  });
};

exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'This route is not in used',
    },
  });
};

exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'This route is not in used',
    },
  });
};

exports.deleteUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'This route is not in used',
    },
  });
};


exports.updateMe = catchAsync(async(req,res,next)=>{

  //1 create error if user posts the password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password update!...Please use updateMyPassword route',400));
  }

  //2.filtered out the unwanted field name 
  //For the password update we have a separate route so here we avoid the password object but side by side we need to take care that all fields should not be allowrd to be updated by the user since it may compromise the security of the data 

  //So in this route only the name and the email can be updated of the user currently signed in and other field update will get ignored instead of updating them 

  //for that we have a function -----fulterObj()-------- that returns the newObj with the updated value and is uuse -----------findByIdAndUpdate() where we need to pass the id, data to be updated and set the validators to true i.e. new:true and runValidator:true
   const filteredBody = filterObj(req.body,"name","email");

  //3.update user documnet 
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});

  res.status(200).json({
    status:'success', 
    data:{
      user:updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req,res,next)=>{
  const deleteMe = await User.findByIdAndUpdate(req.user.id,{active:false});
  
  res.status(204).json({
      status:"success",
      data:{
          user:null
      }
  });
});
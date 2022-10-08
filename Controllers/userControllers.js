const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');

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

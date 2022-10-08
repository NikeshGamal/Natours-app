const express = require('express');
const userController = require('./../Controllers/userControllers');
const authController = require('./../Controllers/authController');

//Analogy can be : think as chaining method
const router = express.Router();

router.post('/signup',authController.signup);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

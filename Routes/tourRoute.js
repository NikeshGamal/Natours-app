const express = require('express');
const tourController = require('../Controllers/tourControllers');
const authController = require('../Controllers/authController');
//this can also be done by using destructuring the object tourControllers
// const reviewController = require('../Controllers/reviewController');
const revierouter = require('../Routes/reviewRoute');

//Analogy can be : think as chaining method
const router = express.Router();

//nested route to create new review on tour
router.use('/:tourId/review',revierouter);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(authController.protect,tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);


module.exports = router;

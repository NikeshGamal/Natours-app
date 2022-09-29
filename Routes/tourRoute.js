const express = require('express');
const tourController = require('../Controllers/tourControllers');
//this can also be done by using destructuring the object tourControllers

//Analogy can be : think as chaining method
const router = express.Router();

router
  .route('/')
  .get(tourController.getALlTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;

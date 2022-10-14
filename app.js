const express = require('express');

const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
const tourRoute = require('./Routes/tourRoute');
const userRoute = require('./Routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const authController = require('./Controllers/authController');
const reviewRoute  = require('./Routes/reviewRoute');

//middleware
app.use(cookieParser());

app.use(morgan('dev'));

app.use(express.json());

//defining the routes
//get method
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// //put method
// app.post('/', (req, res) => {
//   res.send('You can post to the endpoints...');
// });

//Creating own middleware  for that we have to use app.use()
app.use((req, res, next) => {
  console.log('Hello from the middleware!....');
  next();
});

//middleware to get the time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(authController);
  next();
});

/*
//api
//to get all the tours
app.get('/api/v1/tours',getALlTours);

//to get tour on the basis of id
app.get('/api/v1/tours/:id', getTour);

//create a new tour
app.post('/api/v1/tours', createTour);

//to update the tour
// after the update in the tour return the updated tour as a response
//check whether the tour is valid or not using req.params.id
//using patch that only expect the properties that should be updated on the object
app.patch('/api/v1/tours/:id',updateTour);

app.delete('/api/v1/tours/:id', deleteTour);
*/

//***************************************
app.use('/api/v1/users', userRoute);
//---------------ROUTES----------------
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/reviews', reviewRoute);

//--------Handler for routes thare are not handled
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // console.log(err.status, err.statusCode);
  // next(err);
  //----------need to call AppError's method here
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//------------Global Error handling Middleware------------
//we are going to address the error fro a central location for that we need a global error handling mechanism (---middleware---)

//For error handling middleware there are 4 parametes and the middleware looks like

app.use(globalErrorHandler);
//***************************************
module.exports = app;

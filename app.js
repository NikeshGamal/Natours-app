const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRoute = require('./Routes/tourRoute.js');
const userRoute = require('./Routes/userRoute.js');

//middleware
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
//---------------ROUTES----------------
app.use('/api/v1/users', userRoute);
app.use('/api/v1/tours', tourRoute);

//***************************************
module.exports = app;

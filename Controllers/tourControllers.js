const Tour = require('../Models/tourModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//************Get all tours*************
exports.getAllTours = async (req, res, next) => {
  //EXECUTE QUERY
  const apiFeatures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await apiFeatures.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//************Get tour information**********
exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(tour);
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    // eslint-disable-next-line no-template-curly-in-string
    return next(new AppError(`No tour found for ID:${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tour,
    },
  });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//********Create a new tour*********
//Alternate method
//create method returns promise so instead of .then()----- we use aync await fuction
exports.createTour = catchAsync(async (req, res, next) => {
  //take the request and save to the database
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//********Update tour************
exports.updateTour = async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    // eslint-disable-next-line no-template-curly-in-string
    return next(new AppError(`No tour found for ID:${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//*********Delete tour***********
exports.deleteTour = async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    // eslint-disable-next-line no-template-curly-in-string
    return next(new AppError(`No tour found for ID:${req.params.id}`, 404));
  }
  // console.log(tour);
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------
//----------Tour Stats------------
exports.getTourStats = async (req, res, next) => {
  //aggregate method accepts the array
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4 },
      },
    },
    {
      $group: {
        _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsAverage' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
};


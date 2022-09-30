const Tour = require('../Models/tourModel');

const catchAsync = require('../utils/catchAsync');
//1.For Tours

//************Get all tours*************

exports.getALlTours = async (req, res, next) => {
  try {
    //BUILD QUERY
    //basic query
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //2..Advance filerting
    //we have an object queryObj so we need to check for the string so need to change the object to the string
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    //3.Sorting query
    if (req.query.sort) {
      //For single criteria we perform following query
      // query.sort(req.query.sort);

      //For multiple criteria we perform following query
      const sortBy = req.query.sort.split(',').join(' ');
      query.sort(sortBy);
    } else {
      query.sort('createdAt');
    }

    //4.field limit query
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //5.pagination query
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    //page with no documents
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not contain');
    }

    //EXECUTE QUERY
    const tours = await query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      error: err,
    });
  }
};

//************Get tour information**********

exports.getTour = async (req, res) => {
  // console.log(req.params);
  // console.log(tours);

  // const tour = tours.find((el) => tourID === el.id);

  // if (!tour) {
  //   return res.status(400).json({
  //     status: 'Fail',
  //     message: 'Invalid tour',
  //   });
  // }

  try {
    // console.log(tour);
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      error: err,
    });
  }
};

//********Create a new tour*********

// //   console.log(req.body);
// //   res.send('Done!!!');

// //id create (but in database it is already created)
// //accessing last id
// const newID = tours[tours.length - 1].id + 1;

// //newID and req.body are two separate objects so in order to access req.body through the newID we need to combine for that we use ****Object.assign()**** that combines two objects
// const newTour = Object.assign({ id: newID }, req.body);
// tours.push(newTour);

// //inorder to save to the database
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }
// );

//   console.log(tours);
//   console.log(newTour);

//For creating a document we use
//const newTour = new Tour({})
// newTour.save()

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

//********Update tour************
exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // console.log('tour');
    // console.log(tour);
    // console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//*********Delete tour***********

exports.deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    // console.log(tour);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

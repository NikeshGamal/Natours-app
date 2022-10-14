const User = require('./userModel');
const mongoose = require('mongoose');

//making tour schema

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startLocation:{//in actual this is not the schema 
    type:{
      type:String,
      default:'Point',
      enum:['Point']
  },
  coordinates:[Number],
  address:String,
  description:String
 },
 Location:[
  //this section is the embedded on where we embedded the other tour locations in this array of objects
    {
    type:{
        type:String,
        default:'Point',
        enum:['Point']
    },
    coordinates:[Number],
    address:String,
    description:String,
    day:Number
    }
   ],
   guides:[
      {
        type:mongoose.Schema.ObjectId,
        ref:"User"//Here we are referencing to the model that we are retrieving the data from ('Child referencing')
      }
   ]
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

//Embedded approach
//since we need to embedd the tour guides into our tour model so a middleware is used in order to retrieve the data from the User model and save the data to the tour model -----that is why we are using a pre middeware
// tourSchema.pre('save',async function(next){
//    const guidesPromises = this.guides.map(async id => await User.findById(id));
//    this.guides = await Promise.all(guidesPromises);
//    //this line helps to get the all data that we have in the promises in this case we have array of object and we will be getting the array of objects and updateing the ------guides-----field of the database
//    next();
// });

//Query Middleware
//to populate guides in every find query we use a middleware so that whenever we query getAll tours and ge a tour or other populate function is invoked
tourSchema.pre(/^find/, function(next){
    this.populate({
      path:"guides",
      select:"-__v -passwordChangedAt"
    })
    next();
});

//virtual populate
tourSchema.virtual('reviews',{
  ref:"Review",
  foreignField:"tour",
  localField:"_id"
});

//Making a tour model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

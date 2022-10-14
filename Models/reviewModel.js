const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
review:{
    type:String,
    require:[true,"A Review can not be empty"]
},
rating:{
    type:Number,
    min:1,
    max:5
},
createdAt:{
    type:Date,
    default:Date.now
},
 user:
    {
        type:mongoose.Schema.ObjectId,
        ref:'User',
        require:[true,"A Review must belong to a user"]
    }
,
 tour:
    {
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        require:[true,"A Review must belong to a tour"]
    }
},
{
    //make sure that when we have a virtual property/field that is not stored in the database we want to shoe them up with other values from the database 
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

//Query middleware
reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:"name"
    // }).populate({
    //     path:"user",
    //     select:"name photo"
    // });

     this.populate({
        path:"user",
        select:"name photo"
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
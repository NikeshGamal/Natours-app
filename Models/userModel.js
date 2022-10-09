const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please tell us your name!"],
    },
    email:{
        type:String,
        required:[true,"Please your calid email address!"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email!!!'],
    },
    photo:String,
    password:{
        type:String,
        required:[true,"Please provide a password!"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,"Please confirm your password!"],
        validate:{
            validator:function(el){
                return el ===this.password;
            },
            message:"Password are not same"
           }
       },
       passwordChangedAt: {
        type: Date,
    }
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    console.log('password hashing successful');

    //delete passwordCoform field 
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}


userSchema.methods.changePasswordAfter = async function(JWTTimestamp){
   if(this.passwordChangedAt){
       const changeTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
       console.log(changeTimestamp);
       console.log(JWTTimestamp);

      return JWTTimestamp < changeTimestamp;
   }
}
const User = mongoose.model('User',userSchema);

module.exports = User;
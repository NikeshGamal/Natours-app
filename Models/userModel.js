const crypto = require('crypto');
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
    role:{
        type:String,
        default:'user',
        enum:['admin','guide','lead-guide','user']
    },
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
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});
//Document middleware

//this middeware is invoked to get all users having active not false 
userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
});

//password encyprion section using middleware
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    console.log('password hashing successful');

    //delete passwordCoform field 
    this.passwordConfirm = undefined;
    next();
});

//is invoked when the password is reset and before the User gets save this middleware is called
userSchema.pre('save',function (next){
    if(!this.isModified('password') || this.isNew){
        return next();
    }
    
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//query-Middleware




//Instance methods

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now()+10*60*1000;
    // console.log(this);
    return resetToken;
}

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
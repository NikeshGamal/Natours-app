const sendgridMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

const API_KEY=process.env.API_KEY_SGM;


const sendMail = (options)=>{
console.log(API_KEY);
    sendgridMail.setApiKey(API_KEY);

const msg={
        to: options.message,
        from: 'crowdfundr@outlook.com', // Use the email address or domain you verified above
        subject: options.subject,
        message:options.message
    };

    console.log(msg);

    sendgridMail.send(msg).then(()=>{
      console.log('Email sent successgully')   
    })
    .catch(err=>console.log(err));
}


module.exports = sendMail;
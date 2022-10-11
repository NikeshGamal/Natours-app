const sendgridMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

const API_KEY=process.env.API_KEY_SGM;


const sendMail = (options)=>{
console.log(API_KEY);
    sendgridMail.setApiKey(API_KEY);

const msg={
        to:'nikesh.gamal123@gmail.com',// options.message,
        from: 'crowdfundr@outlook.com', // Use the email address or domain you verified above
        subject: 'SendGrid Mail',//options.subject,
        message:'Its fun to send mail using node js'//options.message
    };

    console.log(msg);

    sendgridMail.send(msg).then(()=>{
      console.log('Email sent successgully')   
    })
    .catch(err=>console.log(err));
}


module.exports = sendMail;
'use strict';
const nodemailer = require('nodemailer');

module.exports = function (mailOptions, callback) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'formulatefyi@gmail.com', //process.env.EMAIL_ADDRESS,
            pass: 'anibel4ever' //process.env.EMAIL_PASSWORD
        }
    });
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        return callback(null, info);
    });
};
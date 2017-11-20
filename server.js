require('dotenv').config();

// Modules
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('cookie-session');
const requireHTTPS = require('./controllers/requireHTTPS');

// Authentication Controllers
const authSignup = require('./controllers/authSignup');
const authLogin = require('./controllers/authLogin');
const authLogout = require('./controllers/authLogout');
const authVerification = require('./controllers/authVerification');
const authReSend = require('./controllers/authReSend');

// Data Controllers
const apiUserData = require('./controllers/apiUserData');
const apiNewForm = require('./controllers/apiNewForm');
const apiEditForm = require('./controllers/apiEditForm');
const { publish, unpublish } = require('./controllers/apiPublishForm');

// Express Port/App Declaration
const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
if(process.env.NODE_ENV !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

// app.use(requireHTTPS);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Passport 
app.use(cookieParser(process.env.SECRET));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Database configuration
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect("mongodb://localhost/formulate");
}
const db = mongoose.connection;

//=== Show any mongoose errors
db.on("error", function (error) {
    console.error("Mongoose Error: ", error);
});

//==== Once logged in to the db through mongoose, log a success message
db.once("open", function () {
    console.log("Mongoose connection successful.");
});

//==== Call controllers
// Auth
authLogin(app);
authSignup(app);
authLogout(app);
authVerification(app);
authReSend(app);
// Api
apiUserData(app);
apiNewForm(app);
apiEditForm(app);
publish(app);
unpublish(app);

// Connection to PORT
app.listen(PORT, function () {
    console.log(`Listening On Port: http://localhost:${PORT}`);
});

module.exports = app // For testing
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sendEmail = require('../helpers/sendEmail');
const User = require('../../models/User');

module.exports = new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    const newUser = new User({ email: email.trim(), password: password.trim(), verified: false });
    newUser.save((err) => { 
        if (err) return done(err);
        return done(null, newUser);
    });
});    
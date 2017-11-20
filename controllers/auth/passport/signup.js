const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sendEmail = require('../../helpers/sendEmail');
const User = require('../../../models/User');

module.exports = new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    const newUser = new User({ email: email.trim(), password: password.trim(), verified: false });
    return newUser.save()
        .then((user) => {
            return done(null, user);
        })
        .catch(err => {
            if (err) return done(err);
        });
});    
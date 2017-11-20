// Modules
const passport = require('passport');
const LocalLoginStrategy = require('./passport/login');
const validateLoginForm = require('./passport/validateLogin');

// Model
const User = require('../../models/User');

const localLogin = 'local-login';

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(localLogin, LocalLoginStrategy);

module.exports = (app) => {
    app.post('/auth/login', (req, res, next) => {
        const validationResult = validateLoginForm(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.message,
                errors: validationResult.errors
            });
        }


        return passport.authenticate(localLogin, (err, user) => {
            if (err) {
                return res.status(409).json({
                    success: false,
                    message: 'There was an issue accessing the database, please try again later'
                });
            }
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password did not match an account in our database'
                });
            }
            req.login(user, {}, (data) => {
                return res.status(200).json({
                    success: true,
                    message: 'You are logged in'
                });
            });
        })(req, res, next);
    });
};


const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = (app) => {
    app.get(`/auth/verify/:id`, (req, res) => {
        const _id = mongoose.Types.ObjectId(req.params.id);
        User.findOne({ _id: _id}, (err, thisUser) => {
            if (err) return res.status(500).send('could not verify user');
            thisUser.verified = true;
            thisUser.save((err) => {
                if (err) return res.status(500).send('could not verify user');
                return res.redirect('/');
            });
        });
    });
};
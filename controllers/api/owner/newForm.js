const User = require('../../../models/User')

const { formIsValid } = require('../../helpers/validateForm.js');

module.exports = (app) => {
    app.post('/api/new/form', (req, res) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Log in to access this content'
            })
        }
        return User.findOne({ email: req.user.email })
            .then((currentUser) => {
                const { form } = req.body;
                if (formIsValid(form)) {
                    currentUser.forms.push(form);
                    req.newForm_id = currentUser.forms[currentUser.forms.length - 1]._id
                    return currentUser.save()
                }
                throw { message: 'invalid form', status: 400 }
            })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    _id: req.newForm_id
                })
            })
            .catch((err) => {
                return res.status(err.status || 500).json({
                    success: false,
                    message: err.message,
                })
            });
    })
}
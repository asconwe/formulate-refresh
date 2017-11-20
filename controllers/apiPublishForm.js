const mongoose = require('mongoose');
const User = require('../models/User');

const { formIsValid } = require('./helpers/validateForm');

const findFormAndIndex = (req) => {
    try {
        const _id = mongoose.Types.ObjectId(req.params.form_id);
        const userForm = req.user.forms.id(_id);
        return { 
            formIndex: req.user.forms.indexOf(userForm),
            userForm,
            _id,
        };
    } catch (error) {
        return {
            error: error
        }
    }
}

module.exports = (app) => {
    app.post('/api/publish/form/:form_id', (req, res) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                cause: 'app-level-authentication',
                message: 'Log in to access this content',
            })
        }
        
        const { formIndex, userForm, formError } = findFormAndIndex(req)

        if (formError) {
            return res.status(400).json({
                success: false,
                message: "The form's ID is invalid",
                cause: 'invalid-_id',
            })
        }
        
        if (!userForm) {
            return res.status(400).json({
                success: false,
                cause: 'form-level-authentication',
                message: "it seems you don't own this form",
            })
        }
        
        if (userForm.published) {
            return res.status(400).json({
                success: false,
                cause: 'form-is-published',
                message: 'This form is already published.'
            })
        }
        
        req.formIndex = formIndex;
        userForm.published = true;
        return User.findOne(req.user._id)
            .then(user => {
                user.forms.set(req.formIndex, userForm);
                return user.save()
            })
            .then(user => {
                return res.status(200).json({
                    success: true,
                    form: userForm
                })
            })
            .catch(err => {
                return res.status(400).json({
                    success: false,
                    message: 'Could not update the form',
                    cause: 'save-failed'
                })
            })
           
    })
}
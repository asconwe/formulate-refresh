const mongoose = require('mongoose');
const User = require('../models/User');

const { formIsValid } = require('./helpers/validateForm');

const findFormAndIndex = (req) => {
    try {
        const _id = mongoose.Types.ObjectId(req.params.form_id);
        return { 
            formIndex: req.user.forms.indexOf(_id),
            userForm: req.user.forms.id(_id),
            _id,
        };
    } catch (error) {
        return {
            error: error
        }
    }
}

module.exports = (app) => {
    app.get('/api/edit/form/:form_id', (req, res) => {
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
                message: 'This form is published.'
            })
        }
        return res.status(200).json({
            success: true,
            form: userForm
        })
           
    })
    
    app.post('/api/edit/form/:form_id', (req, res) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Log in to access this content'
            })
        }
        const { userForm, formIndex, _id } = findFormAndIndex(req);
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
                message: 'This form is published.'
            })
        }
        
        const updatedForm = Object.assign({}, req.body.form, { _id: _id })
        if (formIsValid(updatedForm)) {
            User.findOne(req.user._id)
                .then((currentUser) => {
                    currentUser.forms[0] = updatedForm;
                    return currentUser.save()
                })
                .then((user) => {
                    return res.status(200).json({
                        success: true,
                        _id: req.user._id,
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        success: false,
                        cause: 'Could not save user form',
                        err: err.message,
                    })
                })
        } else {
            return res.status(400).json({
                success: false,
                cause: 'invalid-form-data',
                message: "Cannot save due to invalid form data",
            })
        }
    });
}
const User = require('../models/User')


elementIsValid = ({type, options}) => {
    if (options.width) {
        if (type === 'box') {
            if (options.children.length > 0) {
                const invalidElements = options.children.filter(element => !elementIsValid(element))
                return invalidElements.length === 0;
            }
            return false
        }
        return true;
    }
    return false;
}

const elementsAreValid = (form) => {
    const invalidElements = form.topLevelElements.filter(element => !elementIsValid(element))
    console.log('here', invalidElements.length === 0);
    return invalidElements.length === 0;
} 

const formIsValid = (form) => {
    return form.title.length > 0 && elementsAreValid(form);
}

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
            })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    _id: req.newForm_id
                })
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    message: 'could not save form',
                })
            });
    })
}
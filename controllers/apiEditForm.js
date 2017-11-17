const userOwnsForm = (req) => {
    return req.user.forms.filter(form => form._id === req.params.form_id)
}

module.exports = (app) => {
    app.post('/api/edit/form/:form_id') {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Log in to access this content'
            })
        }

        if (!userOwnsForm(req)) {

        }
    }
}
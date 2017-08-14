module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Log in to access this content'
            })
        }
        return res.status(200).json({ success: true, user: req.user })
    })
}
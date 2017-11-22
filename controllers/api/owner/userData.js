module.exports = (app) => {
    app.get('/api/user', (req, res, next) => {
        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: 'Log in to access this content'
            })
        }
        const { verified, forms, email } = req.user;
        if (verified) {
            return res.status(200).json({ 
                success: true, 
                forms, 
                email,
                verified
            });
        }
        let message = `Check your ${email} inbox for our verification email.`;
        return res.status(209).json({ success: true, message, verified });
    })
}
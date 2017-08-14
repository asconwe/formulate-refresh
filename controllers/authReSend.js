const sendEmail = require('./helpers/sendEmail');

module.exports = (app) => {
    app.get('/auth/sendemail', (req, res) => {
        if (!req.user) {
            return res.status(401).json({ success: false });
        }
        const _id = req.user._id;
        const base = 'http://www.formulate.fyi';
        let mailOptions = {
            from: `"formulate" <formulatefyi@gmail.com>`, // Sender address
            to: `${req.user.email}`, // list of receivers
            subject: `Verifiy your formulate account!`, // Subject line
            text: `Email address: ${req.body.email}, & URL: ${base}/auth/verify/${_id}`, // plain text body
            html: `Email address: ${req.body.email}<br>
                URL: <a href="${base}/auth/verify/${_id}">Click here to verify your email address, and start building forms!</a>
                <br>============================<br>
                Automated delivery` // html body
        };
        sendEmail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Could not send verification email.'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'You have re-sent the verification email.'
            });
        });
    })
}
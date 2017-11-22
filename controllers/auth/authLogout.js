module.exports = (app) => {
    app.get('/auth/logout', (req, res) => {
        req.logout();
        res.status(200).json({ logout: "success" });
    });
}
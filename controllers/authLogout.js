module.exports = (app) => {
    app.get('/auth/logout', (req, res) => {
        req.logout();
        res.json({ logout: "success" });
    });
}
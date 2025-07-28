// glimmergrid-mvp/controllers/hubController.js
// No model imports needed directly in this controller as it only renders a static page.

exports.renderHomePage = (req, res) => {
    res.render('hub/index', {
        title: 'Unplann\'d HUB',
        user: req.user // Pass user object for conditional rendering
    });
};
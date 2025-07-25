// glimmergrid-mvp/controllers/hubController.js
exports.renderHomePage = (req, res) => { // Renamed from renderDashboardPage
    // This controller function will render the new homepage (HUB).
    // req.user will be available if the user is logged in, otherwise it will be undefined.
    res.render('hub/index', { // Updated EJS path
        title: 'Unplann\'d HUB', // Updated title
        user: req.user // Pass user object for conditional rendering
    });
};

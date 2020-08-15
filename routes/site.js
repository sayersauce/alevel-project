/**
 * Homepage Route
 */

const db = require("../database");

exports.index = function(req, res) {
    db.getUserAssignments(req.session.userID, assignments => {
        res.render("pages/index", { username: req.session.username, assignments: assignments });
    });
}

exports.code = function(req, res) {
    res.render("pages/code");
}

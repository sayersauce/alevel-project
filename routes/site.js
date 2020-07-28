/**
 * Homepage Route
 */

exports.index = function(req, res) {
    res.render("pages/index", { username: req.session.username });
}

exports.code = function(req, res) {
    res.render("pages/code");
}

/**
 * Homepage router
 */

const db = require("../database");
const router = require("express").Router();

router.get("/", (req, res) => {
    db.getUserAssignments(req.session.userID, assignments => {
        res.render("pages/index", { username: req.session.username, assignments: assignments });
    });
});

module.exports = router;

/**
 * Homepage router
 */

const db = require("../database");
const router = require("express").Router();

router.get("/", async (req, res) => {
    let assignments = await db.getUserAssignments(req.session.userID);
    res.render("pages/index", { username: req.session.username, assignments: assignments });
});

module.exports = router;

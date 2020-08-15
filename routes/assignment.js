/**
 * Assignment Router
 */

const db = require("../database");
const router = require("express").Router();

router.get("/:id", (req, res, next) => {
    db.getUserAssignments(req.session.userID, (assignments) => {
        if (assignments.length) {
            for (let a in assignments) {
                let assignment = assignments[a];
                if (assignment.ID == req.params.id) {
                    res.render("pages/assignment", { assignment: assignment, code: undefined, console: undefined });
                    return;
                }
            }
            next();
        } else {
            next();
        }
    });
});

router.post("/run", (req, res) => {
    res.render("pages/assignment", { assignment: JSON.parse(req.body.assignment), code: req.body.code, console: "output" });

});

router.post("/submit", (req, res) => {
    res.render("pages/assignment", { assignment: JSON.parse(req.body.assignment), code: req.body.code, console: "output" });
});

module.exports = router;

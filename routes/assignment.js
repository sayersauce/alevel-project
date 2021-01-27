/**
 * Assignment Router
 */

const db = require("../database");
const router = require("express").Router();
const python = require("../code");

router.get("/:id", async (req, res, next) => {
    let assignment = await db.getUserAssignment(req.session.userID, req.params.id);
    if (assignment) {
        res.render("pages/assignment", { assignment: assignment, code: assignment.CODE, console: undefined, submitted: true });
    } else {
        next();
    }
});

router.post("/run", async (req, res) => {
    const assignment = JSON.parse(req.body.assignment);
    let tests = await db.getAssignmentTests(assignment.ASSIGNMENT);

    let con = await python.testCode(tests, req.body.code);

    assignment.MARK = `${con.passed}/${con.passed+con.failed}`;

    db.updateSubmissionCode(req.body.code, req.session.userID, assignment.ASSIGNMENT);

    res.render("pages/assignment", { assignment: assignment, code: req.body.code, console: con, submitted: false });
});

router.post("/submit", async (req, res) => {
    const assignment = JSON.parse(req.body.assignment);
    let tests = await db.getAssignmentTests(assignment.ASSIGNMENT);

    let con = await python.testCode(tests, req.body.code);

    let mark = `${con.passed}/${con.passed+con.failed}`;

    db.updateSubmission(req.body.code, mark, req.session.userID, assignment.ID);

    assignment.MARK = mark;

    res.render("pages/assignment", { assignment: assignment, code: req.body.code, console: con, submitted: true });
});

router.post("/save", async (req, res) => {
    db.updateSubmissionCode(req.body.code, req.session.userID, req.body.id);
    res.send("");
});

module.exports = router;

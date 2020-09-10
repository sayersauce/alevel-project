/**
 * Admin Page Router
 */

const db = require("../database");
const router = require("express").Router();

router.use((req, res, next) => {
    // Verify that the user is an admin
    if (req.session.admin) {
        next();
    } else {
        // If not redirect them to the homepage
        res.redirect("/");
    }
});

router.get("/", (req, res) => {
    db.getUsers(users => {
        db.getClasses(classes => {
            db.getAssignments(assignments => {
                db.getSubmissions(submissions => {
                    db.getTests(tests => {
                        for (let submission of submissions) {
                            for (let assignment of assignments) {
                                if (assignment.ID == submission.ASSIGNMENT) submission.ASSIGNMENT = assignment.NAME;
                            }
                            for (let user of users) {
                                if (user.ID == submission.USER) submission.USER = user.USERNAME;
                            }
                        }

                        for (let test of tests) {
                            for (let assignment of assignments) {
                                if (test.ASSIGNMENT == assignment.ID) test.ASSIGNMENT = assignment.NAME;
                            }
                        }
                        res.render("pages/admin", { users: users, classes: classes, assignments: assignments, submissions: submissions, tests: tests });
                    });
                });
            });
        });
    });
});

router.post("/createtoken", (req, res) => {
    db.createToken(req.body.className);
    res.redirect("/admin");
});

router.post("/createassignment", (req, res) => {
    db.createAssignment(req.body.title, req.body.desc, req.body.hints, req.session.userID, req.body.startCode, req.body.testCode, new Date(req.body.date).toISOString());
    res.redirect("/admin");
});

router.post("/createtest", (req, res) => {
    db.createTest(req.body.assignment, req.body.inputs, req.body.outputs, !!req.body.visible);
    res.redirect("/admin");
});

router.post("/assignuser", (req, res) => {
    db.assignToUser(req.body.user, req.body.assignment);
    res.redirect("/admin");
});

router.post("/deluser", (req, res) => {
    db.deleteUser(req.body.id);
    res.redirect("/admin");
});

router.post("/deltoken", (req, res) => {
    db.deleteToken(req.body.token);
    res.redirect("/admin");
});

router.post("/delassignment", (req, res) => {
    db.deleteAssignment(req.body.id);
    res.redirect("/admin");
});

router.post("/deltest", (req, res) => {
    db.deleteTest(req.body.id);
    res.redirect("/admin");
});

module.exports = router;

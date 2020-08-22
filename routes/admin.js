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
                    for (let submission of submissions) {
                        for (let assignment of assignments) {
                            if (assignment.ID == submission.ASSIGNMENT) submission.ASSIGNMENT = assignment.NAME;
                        }
                        for (let user of users) {
                            if (user.ID == submission.USER) submission.USER = user.USERNAME;
                        }
                    }
                    res.render("pages/admin", { users: users, classes: classes, assignments: assignments, submissions: submissions });
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

module.exports = router;

/**
 * Assignment Router
 */

const db = require("../database");
const router = require("express").Router();
const tmp = require("tmp");
const fs = require("fs");
const { exec } = require("child_process");


function runPythonCode(code, inputs, callback) {
    console.log(code)

    const tempFile = tmp.fileSync();
    const tempInputs = tmp.fileSync();

    fs.writeFileSync(tempFile.name, code);
    fs.writeFileSync(tempInputs.name, inputs);

    const python = exec(`python ${tempFile.name} < ${tempInputs.name}`, function (error, stdout, stderr) {
        console.log(stdout)
    });

    let output = "";

    python.stdin.on("data", data => {
        output += data.toString();
        console.log(data.toString());
    });

    python.stdout.on("data", data => {
        output += data.toString();
        console.log(data.toString());
    });

    python.stderr.on("data", data => {
        output += data.toString();
        console.log(data.toString());
    })

    python.on("close", () => {
        callback(output.split("\n").join("<br />"));
    });
}


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
    const assignment = JSON.parse(req.body.assignment);
    db.getAssignmentTests(assignment.ASSIGNMENT, tests => {
        runPythonCode(req.body.code, tests[0].INPUTS, userOutput => {
            res.render("pages/assignment", { assignment: assignment, code: req.body.code, console: userOutput });
        });
    });
});

module.exports = router;

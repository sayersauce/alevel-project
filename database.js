/**
 * SQLite3 Database Functions
 */

const sqlite3 = require("sqlite3").verbose();
const hashing = require("./hashing");

let db = new sqlite3.Database("database.db");

function init(){
    // Create the tables in the database if they don't exist

    // USERNAME in Users table is their Email
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            USERNAME VARCHAR(100) UNIQUE NOT NULL,
            FIRSTNAME VARCHAR(100) NOT NULL,
            LASTNAME VARCHAR(100) NOT NULL,
            PASSWORD VARCHAR(100) NOT NULL,
            CLASS VARCHAR(100) NOT NULL,
            REGISTERDATE DATETIME NOT NULL,
            LOGINDATE DATETIME NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Classes (
            TOKEN VARCHAR(6) NOT NULL PRIMARY KEY,
            NAME VARCHAR(100) NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Assignments (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            NAME TEXT UNIQUE NOT NULL,
            DESC TEXT NOT NULL,
            HINTS TEXT NULL,
            ASSIGNER INTEGER REFERENCES Users(ID),
            INITIALCODE TEXT NOT NULL,
            TESTCODE TEXT NOT NULL,
            CREATIONDATE DATETIME NOT NULL,
            DUEDATE DATETIME NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Submissions (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            USER INTEGER REFERENCES Users(ID),
            ASSIGNMENT INTEGER REFERENCES Assignments(ID),
            CODE TEXT NULL,
            MARK TEXT NULL,
            SUBMITDATE DATETIME NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Tests (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            ASSIGNMENT INTEGER REFERENCES Assignments(ID),
            INPUTS TEXT NOT NULL,
            OUTPUTS TEXT NOT NULL,
            VISIBLE BOOLEAN NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ClassAssignments (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CLASSNAME TEXT,
            ASSIGNMENT INTEGER REFERENCES Assignments(ID)
        );
    `);

    //db.run(`INSERT INTO Classes(TOKEN, NAME) VALUES("admins", "admins")`);
}


// Users


function getUsers() {
    // Retrieve all user rows from the Users table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Users", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
    
}

function insertUser(username, firstname, lastname, hash, token) {
    // Check if user has provided a valid access token
    return new Promise(async (resolve, reject) => {
        let className = await getClass(token);
        if (className) {
            let datetime = new Date().toISOString();
            db.run("INSERT INTO Users(FIRSTNAME, LASTNAME, USERNAME, PASSWORD, CLASS, REGISTERDATE, LOGINDATE) VALUES(?, ?, ?, ?, ?, ?, ?)", [firstname, lastname, username, hash, className, datetime, datetime], async function(err) {
                if (err) console.error(err);

                let assignments = await getClassAssignments(className);
                for (let assignment of assignments) {
                    assignToUser(this.lastID, assignment.ASSIGNMENT);
                }
            });
            
            
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

function deleteUser(id) {
    // Delete a user from the Users table
    db.run("DELETE FROM Users WHERE ID=?", id, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function getUser(username) {
    // Returns a promise for a user from the Users table if they exist
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Users WHERE USERNAME = ?", username, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function loginUser(username) {
    // Updates a user's login date if they exist
    db.run("UPDATE Users SET LOGINDATE = ? WHERE USERNAME = ?", [new Date().toISOString(), username], (err) => {
        if (err) console.error(err);
    })
}

function updatePassword(username, hash) {
    // Updates the hash of a user's password in the Users table
    db.run("UPDATE Users SET PASSWORD = ? WHERE USERNAME = ?", [hash, username], (err) => {
        if (err) console.error(err);
    })
}

function createNewPassword(username) {
    // Creates a new random password for a user that has forgotten their previous password
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let length = 10;
    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)]
    }

    updatePassword(username, hashing.hash(password));
    return password;
}


// Classes


function createToken(className) {
    // Creates a new access token for a class
    // Get current tokens in table to avoid repeats
    db.all("SELECT TOKEN FROM Classes", (err, tokens) => {
        if (err) {
            console.error(err);
        }

        let repeat = true;
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        let token;

        // Generate random tokens until one is made which isn't in the table already
        while (repeat) {
            token = "";
            repeat = false;

            for (let i = 0; i < 6; i++) {
                token += chars[Math.floor(Math.random() * chars.length)]
            }

            // Check if the token generated is a repeat
            for (let t of tokens) {
                if (t.TOKEN == token) repeat = true;
            }
        }

        db.run("INSERT INTO Classes VALUES(?, ?)", [token, className], (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
}

function getClass(token) {
    // Find the name of a class (group) based on its token. Returns a promise
    return new Promise((resolve, reject) => {
        db.get("SELECT NAME name FROM Classes WHERE TOKEN = ?", token, (err, row) => {
            if (err) return reject(err);
            if (row && row.name) {
                resolve(row.name);
            } else {
                resolve();
            }
        });
    });
}

function getClasses() {
    // Retrieve all class rows from the Classes table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Classes", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
    
}

function deleteToken(token) {
    // Deletes a token for a class in the Classes table
    db.run("DELETE FROM Classes WHERE TOKEN=?", token, (err) => {
        if (err) {
            console.error(err);
        }
    });
}


// Assignments


function createAssignment(title, desc, hints, assigner, initialCode, testCode, dueDate){
    // Inserts values into the Assignments table and creates a record for user submission in the submissions table

    let values = [title, desc, hints, assigner, initialCode, testCode, new Date().toISOString(), dueDate];

    // Insert row in Assignments
    db.run("INSERT INTO Assignments(NAME, DESC, HINTS, ASSIGNER, INITIALCODE, TESTCODE, CREATIONDATE, DUEDATE) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", values, (err) => {
        if (err) {
            if (err.errno == 19){
                console.log("Error: An assignment with this title aleady exists");
            } else {
                console.log(err);
            }
            return;
        }
    });
}

function getAssignment(id) {
    // Returns a promise for an assignment from the Assignments table if they exist
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Assignments WHERE ID = ?", id, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getAssignments() {
    // Retrieves all assignment rows from the Assignments table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Assignments", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function deleteAssignment(id) {
    // Deletes an assignment from the Assignments table and Submissions for the assignment
    db.run("DELETE FROM Assignments WHERE ID=?", id, (err) => {
        if (err) console.error(err);
    });
    db.run("DELETE FROM Submissions WHERE ASSIGNMENT=?", id, (err) => {
        if (err) console.error(err);
    });
}


// Class Assignments


function assignToClass(className, assignmentID) {
    // Assigns an assignment to a class of users
    db.all("SELECT * FROM Users WHERE Class=?", className, (err, rows) =>{
        if (err) console.error(err);

        for (let user of rows) {
            assignToUser(user.ID, assignmentID);
        }
    });

    db.run("INSERT INTO ClassAssignments(CLASSNAME, ASSIGNMENT) VALUES(?, ?)", [className, assignmentID], (err) => {
        if (err) console.error(err);
    });
}

function getAllClassAssignments() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM ClassAssignments JOIN Assignments ON ClassAssignments.ASSIGNMENT = Assignments.ID", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getClassAssignments(className) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM ClassAssignments WHERE CLASSNAME=?", className, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function deleteClassAssignment(id) {
    db.run("DELETE FROM ClassAssignments WHERE ID=?", id, (err) => {
        if (err) {
            console.error(err);
        }
    });
}


// Assignment Submissions


function assignToUser(userID, assignmentID) {
    // Assigns an assignment to a user
    db.run("INSERT INTO Submissions(USER, ASSIGNMENT) VALUES(?, ?)", [userID, assignmentID], (err) => {
        if (err) console.error(err);
    });
}

function getUserAssignment(user, assignment) {
    // Retrieves a single assignment from the Assignments table for a user based on an submission in the Submissions table
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Submissions INNER JOIN Assignments WHERE Submissions.ID=? AND Assignments.ID = Submissions.ASSIGNMENT AND Submissions.USER=?", [assignment, user], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getUserAssignments(id) {
    // Retrieves all assignments from the Assignments table for a user based on unsubmitted submissions in the Submissions table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Assignments INNER JOIN Submissions WHERE Submissions.USER=? AND Submissions.ASSIGNMENT = Assignments.ID", id, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getSubmissions() {
    // Retrieves all submissions rows from the Submissions table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Submissions INNER JOIN Assignments ON Submissions.ASSIGNMENT = Assignments.ID INNER JOIN Users ON Submissions.USER = Users.ID", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function updateSubmission(code, mark, user, assignment) {
    db.run("UPDATE Submissions SET CODE = ?, MARK = ?, SUBMITDATE = ?  WHERE USER = ? AND ASSIGNMENT = ?", [code, mark, new Date().toISOString(), user, assignment], (err) => {
        if (err) console.error(err);
    })
}

function getSubmissionsForAssignment(id) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Assignments INNER JOIN Submissions ON Submissions.ASSIGNMENT = ? INNER JOIN Users ON Submissions.USER = Users.ID WHERE Assignments.ID = ?", [id, id], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getSubmissionsForAssignment(id) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Assignments INNER JOIN Submissions ON Submissions.ASSIGNMENT = ? INNER JOIN Users ON Submissions.USER = Users.ID WHERE Assignments.ID = ?", [id, id], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}


// Tests


function getTests() {
    // Retrieves all test rows from the Tests table
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Tests INNER JOIN Assignments ON Tests.ASSIGNMENT = Assignments.ID", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getAssignmentTests(id) {
    // Retrieves all test rows from the Tests table where Assignment id = id
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Tests WHERE ASSIGNMENT = ?", id, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function createTest(assignmentID, inputs, outputs, visible){
    // Inserts values into the Tests table
    values = [assignmentID, inputs, outputs, visible];

    db.run("INSERT INTO Tests(ASSIGNMENT, INPUTS, OUTPUTS, VISIBLE) VALUES(?, ?, ?, ?)", values, (err) => {
        if (err) {
            if (err.errno == 19){
                console.log("Error: An assignment with this title aleady exists");
            } else {
                console.log(err);
            }
            return;
        }
    });
}

function deleteTest(id) {
    // Deletes a test from the Tests table
    db.run("DELETE FROM Tests WHERE ID=?", id, (err) => {
        if (err) {
            console.error(err);
        }
    });
}


module.exports = {getUsers, insertUser, getClass, getClasses, deleteUser, deleteToken, getUser, loginUser, createToken, updatePassword, createNewPassword, createAssignment, getAssignments, deleteAssignment, assignToUser, getUserAssignment, getUserAssignments, getSubmissions, getTests, createTest, deleteTest, getAssignmentTests, updateSubmission, getAssignment, getSubmissionsForAssignment, assignToClass, getAllClassAssignments, getClassAssignments, deleteClassAssignment};

init();

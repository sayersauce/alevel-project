/**
 * SQLite3 Database Functions
 */

const sqlite3 = require("sqlite3").verbose();
const hashing = require("./hashing");

let db = new sqlite3.Database("database.db");

function init(){
    // Create the tables in the database if they don't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            EMAIL VARCHAR(100) UNIQUE NOT NULL,
            USERNAME VARCHAR(100) UNIQUE NOT NULL,
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
            SUBMITTED BOOLEAN NOT NULL DEFAULT 0,
            SUBMITDATE DATETIME NULL
        );
    `);
}


// Users


function getUsers(callback) {
    // Retrieve all user rows from the Users table
    db.all("SELECT * FROM Users", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(rows);
    });
}

function insertUser(email, username, hash, token, callback) {
    // Check if user has provided a valid access token
    getClass(token, className => {
        if (className) {
            let datetime = new Date().toISOString();
            db.run("INSERT INTO Users(EMAIL, USERNAME, PASSWORD, CLASS, REGISTERDATE, LOGINDATE) VALUES(?, ?, ?, ?, ?, ?)", [email, username, hash, className, datetime, datetime]);
            callback(true);
        } else {
            callback(false);
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

function getUser(username, callback) {
    // Returns a user from the Users table if they exist
    db.get("SELECT * FROM Users WHERE USERNAME = ?", username, (err, row) => {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

function getUserFromEmail(email, callback) {
    // Returns a user from the Users table if they exist
    db.get("SELECT * FROM Users WHERE EMAIL = ?", email, (err, row) => {
        if (err) {
            console.error(err);
        }
        callback(row);
    });
}

function loginUser(username) {
    // Updates a user's login date if they exist
    db.run("UPDATE Users SET LOGINDATE = ? WHERE USERNAME = ?", [new Date().toISOString(), username], (err) => {
        if (err) {
            console.error(err);
        }
    })
}

function updatePassword(username, hash) {
    // Updates the hash of a user's password in the Users table
    db.run("UPDATE Users SET PASSWORD = ? WHERE USERNAME = ?", [hash, username], (err) => {
        if (err) {
            console.error(err);
        }
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

function getClass(token, callback) {
    // Find the name of a class (group) based on its token and if it exists, pass it into a callback
    db.get("SELECT NAME name FROM Classes WHERE TOKEN = ?", token, (err, row) => {
        if (err) {
            console.error(err);
        }
        if (row && row.name) {
            callback(row.name);
        } else {
            callback();
        }
    });
}

function getClasses(callback) {
    // Retrieve all class rows from the Classes table
    db.all("SELECT * FROM Classes", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(rows);
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
    db.run("INSERT INTO Assignments(NAME, DESC, HINTS, ASSIGNER, INITIALCODE, TESTCODE, CREATIONDATE, DUEDATE) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", values, function(err) {
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

function getAssignments(callback) {
    // Retrieves all assignment rows from the Assignments table
    db.all("SELECT * FROM Assignments", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(rows);
    });
}

function deleteAssignment(id) {
    // Deletes an assignment from the Assignments table and Submissions for the assignment
    db.run("DELETE FROM Assignments WHERE ID=?", id, (err) => {
        if (err) {
            console.error(err);
        }
    });
    db.run("DELETE FROM Submissions WHERE ASSIGNMENT=?", id, (err) => {
        if (err) {
            console.error(err);
        }
    });
}


// Assignment Submissions


function assignToUser(userID, assignmentID) {
    // Assigns an assignment to a user
    db.run("INSERT INTO Submissions(USER, ASSIGNMENT) VALUES(?, ?)", [userID, assignmentID], (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function getUserAssignments(id, callback) {
    // Retrieves all assignments from the Assignments table for a user based on unsubmitted submissions in the Submissions table
    db.all("SELECT * FROM Assignments INNER JOIN Submissions WHERE Submissions.USER=? AND Submissions.SUBMITTED=0 AND Submissions.ASSIGNMENT = Assignments.ID", id, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(rows);
    });
}

function getSubmissions(callback) {
    // Retrieves all submissions rows from the Submissions table
    db.all("SELECT * FROM Submissions", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        callback(rows);
    });
}



module.exports = {getUsers, insertUser, getClass, getClasses, deleteUser, deleteToken, getUser, loginUser, createToken, getUserFromEmail, updatePassword, createNewPassword, createAssignment, getAssignments, deleteAssignment, assignToUser, getUserAssignments, getSubmissions};

init();

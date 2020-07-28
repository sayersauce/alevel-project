/**
 * SQLite3 Database Functions
 */

const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("database.db");

function init(){
    let userQuery = `CREATE TABLE IF NOT EXISTS Users (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME VARCHAR(100) UNIQUE NOT NULL,
        PASSWORD VARCHAR(100) NOT NULL,
        CLASS VARCHAR(100) NOT NULL,
        REGISTERDATE DATETIME NOT NULL,
        LOGINDATE DATETIME NOT NULL
      );`;
    let classQuery = `CREATE TABLE IF NOT EXISTS Classes (
        TOKEN VARCHAR(6) NOT NULL UNIQUE,
        NAME VARCHAR(100) NOT NULL
      );`;
      
    db.run(userQuery);
    db.run(classQuery);
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

function insertUser(username, hash, token, callback) {
    // Check if user has provided a valid access token
    getClass(token, className => {
        if (className) {
            let datetime = new Date().toISOString();
            db.run("INSERT INTO Users(USERNAME, PASSWORD, CLASS, REGISTERDATE, LOGINDATE) VALUES(?, ?, ?, ?, ?)", [username, hash, className, datetime, datetime]);
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

function loginUser(username) {
    // Updates a user's login date if they exist
    db.run("UPDATE Users SET LOGINDATE = ? WHERE USERNAME = ?", [new Date().toISOString(), username], (err) => {
        if (err) {
            console.error(err);
        }
    })
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
    // Delete's a token for a class in the Classes table
    db.run("DELETE FROM Classes WHERE TOKEN=?", token, (err) => {
        if (err) {
            console.error(err);
        }
    });
}


module.exports = {getUsers, insertUser, getClass, getClasses, deleteUser, deleteToken, getUser, loginUser, createToken};

init();

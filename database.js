/**
 * SQLite3 Database Functions
 */


const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("database.db");

function init(){
    let userQuery = `CREATE TABLE IF NOT EXISTS Users (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME VARCHAR(100) NOT NULL,
        PASSWORD VARCHAR(100) NOT NULL,
        CLASS VARCHAR(100) NOT NULL
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

function insertUser(username, password, token, callback) {
    // Check if user has provided a valid access token
    getClass(token, className => {
        if (className) {
            db.run("INSERT INTO Users(USERNAME, PASSWORD, CLASS) VALUES(?, ?, ?)", [username, password, className]);
            callback(true);
        } else {
            callback(false);
        }
    });
}


// Classes


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


module.exports = {getUsers, insertUser, getClass, getClasses};

init();

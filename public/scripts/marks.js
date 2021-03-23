/**
 * Admin Marks Page
 */

const table = document.getElementById("table");
const timer = document.getElementById("timer");
const search = document.getElementById("search");

let receivedAt = null;

// Send AJAX request function
function update() {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            updateTable(this.responseText)
        }
    };

    xhttp.open("GET", "/admin/mark-data", true);
    xhttp.send();
}

// Update table function
function updateTable(data) {
    receivedAt = new Date();
    json = JSON.parse(data);
    titleHTML = "";
    marksHTML = "";
    userHTML = "";

    // Add titles to table
    for (let title of json.titles) {
        titleHTML += "<th>" + title + "</th>";
    }

    // Add maximum mark cells for each title
    for (let mark of json.maxMarks) {
        marksHTML += "<td>" + mark + "</td>";
    }

    // Insert row of marks for each user
    for (let id in json.users) {
        let user = json.users[id];

        assignmentRows = "";

        for (let title of json.titles) {
            if (title in user) {
                let mark = user[title][0];
                let submissionID = user[title][1];

                if (submissionID != null) {
                    // Link to admin live-code view page if they have submitted the assignment and display the mark
                    assignmentRows += "<td>" + mark + "<a href='/admin/submission/" + submissionID + "' style='float:right;'>View</a></td>";
                } else {
                    // Otherwise just display the mark
                    assignmentRows += "<td>" + mark + "</td>";
                }
            } else {
                assignmentRows += "<td></td>";
            }
        }

        userHTML += `
        <tr>
            <td>${user.FIRSTNAME}</td>
            <td>${user.LASTNAME}</td>
            <td>${user.CLASS}</td>
            ${assignmentRows}
        </tr>
        `
    }

    table.innerHTML = `
    <tr>
        <th>Firstname</th>
        <th>Surname</th>
        <th>Class</th>
        ${titleHTML}
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        ${marksHTML}
    </tr>
    ${userHTML}
    `
    
    // Make sure filter is applied
    filterTable();
}

// Filter the table based on a certain filter string
function filterTable() {
    let filterText = search.value.toLowerCase();

    for (let i = 0; i < table.rows.length; i++) {
        let row = table.rows[i];
        if (i > 1) {
            let match = false;

            // Check if any of the cells contain a match
            for (let cell of row.cells) {
                let text = cell.innerText.toLowerCase();
                if (text.includes(filterText)) {
                    match = true;
                }
            }
    
            if (match == false) {
                // If no cells contain a match, hide the entire row
                row.style.display = "none";
            } else {
                // Otherwise, display the row
                row.style.display = "table-row";
            }
        }
    }
}

// Fetch data to fill the table as soon as the page is loaded
update();
// Fetch data from the server to update the table every 2 seconds
setInterval(update, 2000);
// Filter the table every time a character is entered into the search bar
search.onkeyup = filterTable;

/**
 * Admin Marks Page
 */

const table = document.getElementById("table");
const timer = document.getElementById("timer");
const search = document.getElementById("search");

let receivedAt = null;

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

function updateTable(data) {
    receivedAt = new Date();
    json = JSON.parse(data);
    titleHTML = "";
    marksHTML = "";
    userHTML = "";

    for (let title of json.titles) {
        titleHTML += "<th>" + title + "</th>";
    }

    for (let mark of json.maxMarks) {
        marksHTML += "<td>" + mark + "</td>";
    }

    for (let id in json.users) {
        let user = json.users[id];

        assignmentRows = "";

        for (let title of json.titles) {
            if (title in user) {
                let mark = user[title][0];
                let submissionID = user[title][1];

                if (submissionID != null) {
                    assignmentRows += "<td>" + mark + "<a href='/admin/submission/" + submissionID + "' style='float:right;'>View</a></td>";
                } else {
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
    
    filterTable();
}

function filterTable() {
    let filterText = search.value.toLowerCase();

    for (let i = 0; i < table.rows.length; i++) {
        let row = table.rows[i];
        if (i > 1) {
            let match = false;

            for (let cell of row.cells) {
                let text = cell.innerText.toLowerCase();
                if (text.includes(filterText)) {
                    match = true;
                }
            }
    
            if (match == false) {
                row.style.display = "none";
            } else {
                row.style.display = "table-row";
            }
        }
    }
}

update();
setInterval(update, 2000);
search.onkeyup = filterTable;

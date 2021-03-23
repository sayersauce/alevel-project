/**
 * Save Assignment Code AJAX
 */

const id = JSON.parse(document.getElementById("assignment").value).ID;
let sent = true;

// Everytime the user types a character, send the request
ide.onkeyup = () => {
    saveCode();
}

// Send an AJAX request to save the code from the IDE to the database
function saveCode() {
    if (sent == true) {
        sent = false;

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            sent = true;
        };
    
        xhttp.open("POST", "/assignment/save", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(`code=${ide.value}&id=${id}`);
    }
}

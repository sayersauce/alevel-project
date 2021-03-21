/**
 * Assignment Page Script
 */

const forms = document.getElementsByTagName("form");
const formInputs = document.getElementsByClassName("code");
const ide = document.getElementById("text");

// Disable spellchecking for ide element
ide.spellcheck = false;

// Check for tab key press and insert 4 spaces
ide.onkeydown = e => {
    if(e.keyCode == 9 || e.which==9){
        e.preventDefault();
        let s = ide.selectionStart;
        ide.value = ide.value.substring(0, ide.selectionStart) + "\t" + ide.value.substring(ide.selectionEnd);
        ide.selectionEnd = s + 1; 
    }
}

// Transport ide text to form inputs
for (let form of forms) {
    form.onsubmit = e => {
        for (let input of formInputs) {
            input.value = ide.value;
        }
    }
}

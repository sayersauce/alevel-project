/**
 * Assignment Page Script
 */

const forms = document.getElementsByTagName("form");
const formInputs = document.getElementsByClassName("code");
const ide = document.getElementById("ide");

for (let form of forms) {
    form.onsubmit = e => {
        for (let input of formInputs) {
            input.value = ide.innerText;
        }
    }
}

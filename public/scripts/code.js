/**
 * Textarea Source Code Editor
 */

const editor = document.getElementById("ide");

editor.contentEditable = true;
editor.spellcheck = false;

editor.oninput = () => {
    if (editor.innerText == "" || editor.childElementCount == 0 || editor.innerHTML == "<br>") {
        editor.innerHTML = "<div><br></div>";
    }
}

editor.onkeydown = e => {
    if (e.keyCode === 9) {
        e.preventDefault();
        let selection = getSelection();
        let range = selection.getRangeAt(0);
        let tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode); 
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

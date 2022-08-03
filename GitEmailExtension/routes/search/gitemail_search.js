import { GitEmail, Account, Repo } from '../../lib/gitemail.js';

window.onload = () => {

    document.getElementById("gitemail-search-button")
        .addEventListener(
            "click",
            () => evaluateInput(),
            false
        );
}

const evaluateInput = async () => {
    const username = document.getElementById("gitemail-input").value;
    if (![undefined, null, ""].some(x => x === username)) {
        toggleLoader(true);
        let email = await gitUserEmail(username);
        if (email === true) email = "No repos to scan.";
        else if (email === false) email = "No commits to scan.";
        else if (email === null) email = "User doesn't exist.";
        createResultElement(username, email);
        toggleLoader(false);
    }
}

const toggleLoader = (turn_on) => {
    document.getElementById("gitemail-loader").style.visibility = (turn_on)
        ? "visible"
        : "hidden";
}

const gitUserEmail = async (username) => await (new GitEmail(username)).gitEmail();

const createResultElement = (username, email) => {
    
    // Create the span element that holds theusername in a thicker font.
    let user_li = document.createElement("li");
    user_li.setAttribute("class", "centeredlistitem thickspan");
    user_li.setAttribute("style", "margin-top: 10px;");
    user_li.appendChild(document.createTextNode(username));

    // Create a div element that holds the email and the span element.
    let email_li = document.createElement("li");
    email_li.setAttribute("class", "centeredlistitem");
    email_li.appendChild(document.createTextNode(email));

    // Append the div in the DOM to the div with id "gitemail-results".
    document.getElementById("gitemail-results").appendChild(user_li);
    document.getElementById("gitemail-results").appendChild(email_li);
}
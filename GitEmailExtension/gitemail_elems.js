let errored = false;

function createGistsButton () {
    const URL = window.location.href;
    const urlParts = URL.split('/');
    if (document.getElementById("gitemail-gist-button") === null
     && urlParts.length < 5
     && urlParts[urlParts.length - 1] !== "") {
        const NAV = document.getElementsByClassName("UnderlineNav-body width-full p-responsive");
        let gistbutton = document.createElement("button");
        gistbutton.appendChild(document.createTextNode("Gists"));
        gistbutton.setAttribute("class", "UnderlineNav-item js-responsive-underlinenav-item");
        gistbutton.setAttribute("id", "gitemail-gist-button");
        gistbutton.addEventListener(
            "click",
            () => {
                let user = URL.split("github.com/")[1];
                if (user.includes('?')) user = user.split('?')[0];
                window.location = `https://gist.github.com/${user}`;
            },
            false);
        if (NAV.length > 0) NAV[0].append(gistbutton);
    }
}

function createGitemailEntry () {
    
    if (document.getElementById("gitemail-email-div") === null) {

        // Create the necessary elements.
        // img "gitemail-logo-svg" - Holding the svg logo.
        let gitemail_icon = document.createElement("img");
        gitemail_icon.setAttribute("id", "gitemail-logo-svg");
        gitemail_icon.setAttribute("src", chrome.extension.getURL("gitemail_logo.svg"));
        gitemail_icon.setAttribute("height", "16");
        gitemail_icon.setAttribute("viewBox", "0 0 16 16");

        // span "gitemail-user-email" - Holding the email info.
        let gitemail_span = document.createElement("span");
        gitemail_span.appendChild(document.createTextNode("Processing..."));
        gitemail_span.setAttribute("id", "gitemail-user-email");
        gitemail_span.setAttribute("style", "padding-left: 10px");

        // div "gitemail-email-div" - Containing the previous two.
        let gitemail_entry = document.createElement("div");
        gitemail_entry.setAttribute("id", "gitemail-email-div");
        gitemail_entry.setAttribute("style", "padding-top: 4px");
        gitemail_entry.appendChild(gitemail_icon);
        gitemail_entry.appendChild(gitemail_span);

        // Insert the elements into the required place in the dom.
        const NAV = document.getElementsByClassName("js-profile-editable-area d-flex flex-column d-md-block");
        if (NAV.length > 0) NAV[0].append(gitemail_entry);

        return true;
    }
    
    return false;
}

async function insertGitemailEmail () {

    // Extract user from URL.
    const URL = window.location.href;
    let user = URL.split("github.com/")[1];
    if (user.includes('?')) user = user.split('?')[0];

    // Try get the user email.
    try{
        const gitEmail = await import(chrome.runtime.getURL("gitemail.js"));
        let userEmail = await (new gitEmail.GitEmail(user)).gitEmail();
        if (userEmail === true) userEmail = "No repos to scan.";
        else if (userEmail === false) userEmail = "No commits to scan.";
        else if (userEmail === null) userEmail = "User doesn't exist.";

        // Insert it into the DOM.
        document.getElementById("gitemail-user-email").textContent = userEmail;
    }
    catch (ex) {
        errored = true;
    }

}

function insertGitemailElements () {
    if (errored === false) {
        createGistsButton();
        if (createGitemailEntry()) insertGitemailEmail();
    }
}

window.onload = () => insertGitemailElements();
window.setInterval(() => insertGitemailElements(), 500);
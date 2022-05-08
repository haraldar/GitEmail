import { GitEmail, Account, Repo } from "./gitemail.js";

const buttons = {
    "#search-button" : searchButtonPressed,
    "#copy-button" : copyButtonPressed,
    "#fullreport-button" : fullReportButtonPressed
};

const outputOpts = [
    (null, "No such user."),
    (true, "No repos to scan."),
    (false, "No email found.")
];

/**
 * Manages the windows' loading activities. Those include assigning the EventListeners
 * and checking if the users is above a GitHub profile page and if so automatically
 * obtain the initial email.
 */
window.onload = async function () {
    // Add the click-Events to the buttons.
    for (var btn in buttons) {
        document.querySelector(btn).addEventListener('click', buttons[btn], false);
    }

    // Set me as default user.
    document.querySelector("#gituser-input").value = "haraldar";
    
    // If the user opened the extension on a GitHub profile, automatically get the
    // user name.
    chrome.tabs.query(
        {currentWindow : true, active : true}, 
        async function(tabs) {
            const currentUrl = tabs[0].url.toString();
            console.log(currentUrl);
            if (currentUrl.includes("github.com/")) {
                const urlParts = currentUrl.split("github.com/");
                console.log(urlParts);
                const urlSuffix = urlParts[urlParts.length - 1];
                console.log(urlSuffix);
                if (!['/', '?', '='].some((char) => urlSuffix.includes(char))) {
                    setUser(urlSuffix);
                    searchButtonPressed();
                }
            }
        }
    );
}

/**
 * Get the user from the input field.
 * @returns The user from the input field.
 */
const getUser = () => document.querySelector("#gituser-input").value;

/**
 * Sets the user in the input field.
 * @param {string} user The user to set.
 * @returns null
 */
 const setUser = (user) => document.querySelector("#gituser-input").value = user;

/**
 * Sets the email on display in the associated output label.
 * @param {string} email The email/ message to display in the output label.
 * @returns null
 */
 const setEmail = (email) => document.querySelector("#gituser-output").textContent = email;

/**
 * The button event that triggers the attempt to get the email and displays the result
 * in the associated output label.
 */
async function searchButtonPressed () {
    setEmail("Processing...");
    chrome.tabs.query(
        {currentWindow : true, active : true}, 
        async function (tabs) {
            console.log(getUser());
            const email = await new GitEmail(getUser()).gitEmail();
            console.log(email);
            const output = outputOpts.filter((opt) => opt[0] === email);
            setEmail((output.length === 0) ? email : output[1]);
        }
    );
}

/**
 * The button event that copies the content of the output label to the clipboard.
 */
function copyButtonPressed () {
    try {
        navigator
            .clipboard
            .writeText(document.querySelector("#gituser-output").textContent);
    }
    catch (ex) {
        console.log("Couldn't copy to clipboard with error:");
        console.log(ex.toString());
    }
  }

async function fullReportButtonPressed () {
    let ghAccount = await new GitEmail(getUser()).getUser();
    chrome.storage.local.set({"ghToReportOn" : ghAccount}, function () { });
    if (ghAccount == null) return;
    chrome.tabs.create({ url: chrome.runtime.getURL("fullreport.html") });
}
let errored = false;
let currentURL = null;
let currentUser = null;

const dropDowns = {
    actions: 0,
    profile: 1
};


// onselection change event listener for tab ot update if
// the gitemail data have to be updated


/**
 * Imports the named module/ file dynamically during runtime.
 * @param {string} filePath
 * @returns The dynamically imported module.
 */
const getModule = async function (filePath) {
    return await import(chrome.runtime.getURL(filePath));
}


/**
 * Retrieve a list of the parts that form the URL.
 * @param {string} delim - The delimiter to split the window href location for.
 * @returns {list} - A list that holds the parts of the URL.
 */
const getUrlParts = function (delim = '/') {
    return window.location.href.split(delim);
}


/**
 * Retrieve a list of the path parameters from the URL path.
 * @param {string} delim - The delimiter to split the window URL path.
 * @returns {list} - A list that holds the parts of the
 */
const getUrlPathParts = function (delim = '/') {
    return window.location.pathname.split(delim);
}


/**
 * Extracts the user from the URL.
 * @returns {string} - The user from the URL.
 */
const getUserFromUrl = function () {
    return getUrlPathParts()[1];
}


/**
 * Fetches the element containing the profile side summary.
 * @returns {HTMLElement} - The element that contains the side summary.
 */
const getProfileSummarySide = function () {
    return document.getElementsByClassName("js-profile-editable-area d-flex flex-column d-md-block");
}


/**
 * Retrieves the Dropdown menus from the GH UI.
 * @returns {HTMLElement} - The dropdown menus.
 */
const getDropDownMenu = function () {
    return document.getElementsByClassName("dropdown-menu dropdown-menu-sw");
}


/**
 * Creates a node element of a certain type and optionally sets attributes and child nodes.
 * @param {string} type - The HTML element type.
 * @param {object} attrs - The attributes to set for the element to be created.
 * @param {list} children - The child nodes to append to the element.
 * @param {EventListener} listener - The child nodes to append to the element.
 * @returns {HTMLElement} The resulting node element.
 */
const createNodeElem = function (type, attrs = {}, children = [], listener = null) {

    let elem = document.createElement(type);

    Object.entries(attrs)
        .forEach(attr => elem.setAttribute(...attr));

    children.forEach(child => elem.appendChild(child));

    if (listener !== null)
        elem.addEventListener(
            "click",
            () => listener(),
            false
        );

    return elem;

}


/**
 * Adds a new tab to the GitHub UI.
 * @param {string} btnId - The HTML id to use for the button in the website.
 * @param {string} btnText - The text that is displayed on the button.
 * @param {EventListener} listener - The EventListener for the tab.
 * @returns {HTMLElement}
 */
const addTabButton = function (id, text, listener = null) {

    const pathParts = getUrlPathParts();

    if (
        document.getElementById(id) !== null
        || pathParts.length > 3
        || pathParts[pathParts.length - 1] === ""
    ) return;

    const tabBtn = createNodeElem(
        "button",
        {
            id,
            class: "UnderlineNav-item js-responsive-underlinenav-item"
        },
        [
            document.createTextNode(text)
        ],
        listener
    );

    if (listener !== null) {
        tabBtn.addEventListener(
            "click",
            () => listener(),
            false
        )
    }

    const NAV = document.getElementsByClassName("UnderlineNav-body width-full p-responsive");
    if (NAV.length > 0) NAV[0].append(tabBtn);

    return tabBtn;

}


/**
 * Inserts a new option to click into the dropdowns existing in the GH UI.
 * @param {number} dropdown - The dropdown number. Use the dropdown object supplied.
 * @param {string} id - The id to use for the element in the frontend.
 * @param {string} text - The text that is presented on the button.
 * @param {EventListener} listener - The action that is to be used upon clicking on the element.
 * @returns {HTMLElement}
 */
const addDropDownMenuItem = function (dropdown, id, text, listener = null) {

    const ddMenu = getDropDownMenu()[dropdown];

    const item = createNodeElem(
        "a",
        {
            id,
            role: "menuitem",
            class: "dropdown-item"
        },
        [
            document.createTextNode(text)
        ],
        listener
    );


    if (ddMenu.lastElementChild.localName === "include-fragment") {

        const divider = createNodeElem(
            "div",
            {
                role: "none",
                class: "dropdown-divider"
            }
        );

        ddMenu.appendChild(divider);

    }

    ddMenu.appendChild(item);

    return item;

}


/**
 * Create the Invitations button entry in the correct dropdown menu.
 */
const createInvitationsMenuBtn = function () {

    const id = "gitemail-goto-invitations";

    if (document.getElementById(id) !== null)
        return;

    const invi = addDropDownMenuItem(
        dropDowns.profile,
        id,
        "Your Invitations"
    );
    invi.style = "cursor: pointer;"
    invi.addEventListener(
        "click",
        () => {
            window.location.href = chrome.runtime.getURL("routes/invitations/gitemail_invitations.html");
        },
        false
    );
}


/**
 * Creates the Gists button amongst the profile tab.
 */
const createGistsTabBtn = function () {

    const id = "gitemail-gists-btn";

    if (
        getUrlPathParts().length > 2
        || document.getElementById(id) !== null
    ) return;

    const gists = addTabButton(
        id,
        "Gists"
    );
    gists.addEventListener(
        "click",
        () => {
            window.location = `https://gist.github.com/${getUserFromUrl()}`;
        },
        false
    )
}


/**
 *
 */
const createDownloadBtn =  function () {

    const id = "gitemail-code-dl-btn";
    const pathParts = getUrlPathParts();
    
    if (
        document.getElementById(id) !== null
        || document.getElementById("repository-container-header") === null
        || pathParts.length < 4
    ) return;

    const [ user, repo ] = pathParts.slice(1, 3);

    const fileNavChildren = document
        .getElementsByClassName("file-navigation mb-3 d-flex flex-items-start")[0]
        .children;

    const targetDiv = fileNavChildren[fileNavChildren.length - 1];

    const copyables = [
        `https: https://github.com/${user}/${repo}.git`,
        `SSH: git@github.com:${user}/${repo}.git`,
        `GH CLI: gh repo clone ${user}/${repo}`
    ];

    const copyItems = copyables.map(
        copyable => createNodeElem(
            "li",
            {},
            [
                createNodeElem(
                    "button",
                    {
                        class: "dropdown-item btn-link"
                    },
                    [
                        document.createTextNode(copyable)
                    ]
                )
            ]
        )
    );

    const optionsDiv = createNodeElem(
        "div",
        {
            "data-view-component" : true
        },
        [
            createNodeElem(
                "ul",
                {
                    class: "dropdown-menu dropdown-menu-sw",
                    style: "margin: 2px 0px 0px; width: fit-content;"
                },
                [
                    ...copyItems
                ]
            )
        ]
    );

    const summaryElem = createNodeElem(
        "summary",
        {
            class: "btn-primary btn",
            "data-view-component" : true
        },
        [
            document.createTextNode("Code")
        ]
    );

    const detailsElem = createNodeElem(
        "details",
        {
            class: "position-relative details-overlay details-reset js-codespaces-details-container",
            "data-view-component" : true,
            style: "margin: 0px 0px 0px 8px;",
            id
        },
        [
            summaryElem,
            optionsDiv
        ]
    );

    targetDiv.appendChild(detailsElem);
}


/**
 * Create the GitEmail profile summary entry.
 * @returns {boolean} true if element doesn't exist yet else false
 */
function createGitemailEntry () {

    if (document.getElementById("gitemail-email-div") === null)
    {

        // Create the necessary elements.
        // img "gitemail-logo-svg" - Holding the svg logo.
        const gitemail_icon = createNodeElem(
            "img",
            {
                id: "gitemail-logo-svg",
                src: chrome.extension.getURL("static/gitemail_logo.svg"),
                height: "16",
                viewBox: "0 0 16 16"
            }
        );

        // span "gitemail-user-email" - Holding the email info.
        const gitemail_span = createNodeElem(
            "span",
            {
                id: "gitemail-user-email",
                style: "padding-left: 10px;"
            },
            [
                document.createTextNode("Processing...")
            ]
        );

        // div "gitemail-email-div" - Containing the previous two.
        const gitemail_entry = createNodeElem(
            "div",
            {
                id: "gitemail-email-div",
                style: "padding-top: 4px;"
            },
            [
                gitemail_icon,
                gitemail_span
            ]
        );

        // Insert the elements into the required place in the dom.
        const NAV = document.getElementsByClassName("js-profile-editable-area d-flex flex-column d-md-block");
        if (NAV.length > 0) NAV[0].append(gitemail_entry);

        return true;
    }

    return false;
}


/**
 * Inserts the email data fetched for a particular user.
 */
async function insertGitemailEmail () {

    // Extract user from URL.
    let user = getUserFromUrl();

    // Try get the user email.
    try {
        const gitEmail = await import(chrome.runtime.getURL("lib/gitemail.js"));
        let userEmail = await (new gitEmail.GitEmail(user)).gitEmail();
        if (userEmail === true) userEmail = "No repos to scan.";
        else if (userEmail === false) userEmail = "No commits to scan.";
        else if (userEmail === null) userEmail = "User doesn't exist.";

        // Insert it into the DOM.
        document.getElementById("gitemail-user-email").textContent = userEmail;
    }
    catch (ex) {
        errored = true;
        userEmail = "Couldn't retrieve user data.";
    }

}


/**
 * Applies all the create and insert functions to the GitHub UI.
 */
function insertGitemailElements () {

    if (currentURL !== window.location.href) {

        currentURL = window.location.href;

        createGistsTabBtn();
        createInvitationsMenuBtn();
        createDownloadBtn();

        // if (createGitemailEntry())
        //     insertGitemailEmail();
    }

}


window.onload = () => insertGitemailElements();
window.setInterval(
    () => insertGitemailElements(),
    500
);
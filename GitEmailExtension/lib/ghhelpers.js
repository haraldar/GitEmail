export const dropDowns = {
    actions: 0,
    profile: 1
};


// onselection change event listener for tab ot update if
// the gitemail data have to be updated


export const getModule = async function (filePath) {
    return await import(chrome.runtime.getURL(filePath));
}


export const getUrlParts = function (delim = '/') {
    return window.location.href.split(delim);
}


export const getUrlPathParts = function (delim = '/') {
    return window.location.pathname.split(delim);
}


export const getUserFromUrl = function () {
    return getUrlPathParts()[1];
}

export const getProfileSummarySide = function () {
    return document.getElementsByClassName("js-profile-editable-area d-flex flex-column d-md-block");
}

export const getDropDownMenu = function () {
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
export const createNodeElem = function (type, attrs = {}, children = [], listener = null) {

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
 */
export const addTabButton = function (id, text, listener) {

    const pathParts = getUrlPathParts();
    
    if (
        document.getElementById(id) !== null
        || pathParts.length > 2
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

    const NAV = document.getElementsByClassName("UnderlineNav-body width-full p-responsive");
    if (NAV.length > 0) NAV[0].append(tabBtn);

}


/**
 * Inserts a new option to click into the dropdowns existing in the GH UI.
 * @param {number} dropdown - The dropdown number. Use the dropdown object supplied.
 * @param {string} id - The id to use for the element in the frontend.
 * @param {string} text - The text that is presented on the button.
 * @param {EventListener} listener - The action that is to be used upon clicking on the element.
 */
export const addDropDownMenuItem = function (dropdown, id, text, listener = null) {

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

}
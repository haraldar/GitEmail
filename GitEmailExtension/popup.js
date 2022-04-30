const buttons = {
    '#search-button' : searchButtonPressed,
    '#copy-button' : copyButtonPressed
};

/**
 * Manages the windows' loading activities. Those include assigning the EventListeners
 * and checking if the users is above a GitHub profile page and if so automatically
 * obtain the initial email.
 */
window.onload = function () {
    // Add the click-Events to the buttons.
    for (btn in buttons) {
        document.querySelector(btn).addEventListener('click', buttons[btn], false);
    }

    // Set me as default user.
    document.querySelector("#gituser-input").value = "haraldar";
    
    // If the user opened the extension on a GitHub profile, automatically get the
    // user name.
    chrome.tabs.query(
        {currentWindow : true, active : true}, 
        async function(tabs) {
            let currentUrl = tabs[0].url.toString();
            console.log(currentUrl);
            if (currentUrl.includes("github.com/")) {
                const urlParts = currentUrl.split("github.com/");
                console.log(urlParts);
                let urlSuffix = urlParts[urlParts.length - 1];
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
let getUser = () => document.querySelector("#gituser-input").value;

/**
 * Sets the user in the input field.
 * @param {string} user The user to set.
 * @returns null
 */
let setUser = (user) => document.querySelector("#gituser-input").value = user;

/**
 * Sets the email on display in the associated output label.
 * @param {string} email The email/ message to display in the output label.
 * @returns null
 */
let setEmail = (email) => document.querySelector("#gituser-output").textContent = email;

/**
 * The button event that triggers the attempt to get the email and displays the result
 * in the associated output label.
 */
async function searchButtonPressed () {
    setEmail("Processing...");
    chrome.tabs.query(
        {currentWindow : true, active : true}, 
        async function (tabs) {            
            let email = await new GitEmail(getUser()).gitEmail();
            let output = undefined;
            switch (email) {
                case null: output = "No such user."; break;
                case true: output = "No repos to scan."; break;
                case false: output = "No email found."; break;
                default: output = email;
            }
            setEmail(output);
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

/**
 * Contains all functions that get user profile data, repositories and commits.
 */
class GitEmail {

    constructor (account, accountType = Account.NAME) {
        this.API_BASE = "https://api.github.com";
        this.account = account;
        this.accountType = accountType;
    }
    
    /**
     * Attempts to return a jsonified response.
     * @param {string} url_end Basically the url suffix that contains the parameters.
     * @returns The returned json from the GitHub API.
     */
    async getResponse (url_end) {
        let response = await fetch(
            this.API_BASE + "/" + url_end,
            {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                }
            });
        return await response.json();
    }

    /**
     * Sets the object's account and account type.
     * @param {String} account The account name or id to set.
     * @param {Repo} accountType Defines the type of account.
     * @returns The account name.
     */
    setAccount (account, accountType) {
        this.account = account;
        this.accountType = accountType;
        return account;
    }

    /**
     * Converts the objects' account from Account.ID to Account.Name.
     * @returns The username or null.
     */
    async convertToName () {
        let response = await this.getUser();
        return (user != null) ?
            this.setAccount(response["login"], Account.NAME) :
            null;
    }

    /**
     * Fetches the user account JSON from the GitHub API.
     * @returns The user JSON.
     */
    async getUser () {
        let user = await this.getResponse(`${this.accountType}/${this.account}`);
        return (user.hasOwnProperty("message")) ? null : user;
    }

    /**
     * Fetches the users' repositories.
     * @param {Repo} repoType The type filter for accepted repositories.
     * @param {Boolean} onlyNames Converts the results strictly to their repository name.
     * @returns A list of repositories. Either each entry is JSON-type or a string.
     */
    async getUserRepos (repoType = Repo.ALL, onlyNames = false) {
        let response = await this.getResponse(`${this.accountType}/${this.account}/repos`);
        if (response.hasOwnProperty("message")){
            return null;
        }
        else {
            let repos = [];
            for (var repo in response) {
                if (repoType == Repo.ALL || repoType == response[repo]["fork"]) {
                    if (!onlyNames) repos.push(response[repo]);
                    else repos.push(response[repo]["name"]);
                }
            }
            console.log(repos);
            return repos;
        }
    }

    /**
     * Fetches a specific repositories' commits for the objects' user.
     * @param {String} repo The repository to get the commits for.
     * @returns A list of commits. Maximum amount is 30 due to public API limitations.
     */
    async getRepoCommits (repo) {
        return await this.getResponse(`repos/${this.account}/${repo}/commits`);
    } 

    /**
     * Determines the users public committing email.
     * @returns The users' public email or null.
     */
    async gitEmail () {
        let user = await this.getUser();
        if (user == null) return null;
        let repos = await this.getUserRepos(Repo.OWNED, true);
        if (repos.length == 0) {
            return true;
        }
        else {
            console.log(repos);
            for (let repo in repos) {
                let commits = await this.getRepoCommits(repos[repo]);
                console.log(commits);
                console.log(repos[repo]);
                for (var commit in commits) {
                    if (commits[commit]["author"] != null) {
                        if (commits[commit]["author"]["login"] == this.account) {
                            return commits[commit]["commit"]["author"]["email"];
                        }
                    }
                }
            }
            return false;
        }
    }
}


/**
 * A restricted amount of account types.
 */
class Account {

    static ID = "user";
    static NAME = "users";

    constructor (accountType) {
        this.accountType = accountType;
    }

    toString () {
        return this.accountType;
    }

}

/**
 * A restricted amount of repository types.
 */
class Repo {

    static ALL = null;
    static FORKED = true;
    static OWNED = false;

    constructor (repo_type) {
        this.repo_type = repo_type;
    }

    toBoolean () {
        return this.repo_type;
    }
}
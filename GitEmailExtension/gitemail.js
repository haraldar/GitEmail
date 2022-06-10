/**
 * Contains functions that get user profile data, repositories and commits.
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
        const response = await fetch(
            this.API_BASE + "/" + url_end,
            {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                }
            });
            return response.json();
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
        const response = await this.getUser();
        return (user != null) ?
            this.setAccount(response["login"], Account.NAME) :
            null;
    }

    /**
     * Fetches the user account JSON from the GitHub API.
     * @returns The user JSON.
     */
    async getUser () {
        const user = await this.getResponse(`${this.accountType}/${this.account}`);
        return (user.hasOwnProperty("message")) ? null : user;
    }

    /**
     * Fetches the users' repositories (code piece created with the help of @nikitakhutorni).
     * @param {Repo} repoType The type filter for accepted repositories.
     * @param {Boolean} onlyNames Converts the results strictly to their repository name.
     * @returns A list of repositories. Either each entry is JSON-type or a string.
     */
    async getUserRepos (repoType = Repo.ALL, onlyNames = false) {
        const response = await this.getResponse(`${this.accountType}/${this.account}/repos`);
        return (response.hasOwnProperty("message")) ?
            null :
            response.filter(repo => repoType == Repo.ALL || repoType == repo["fork"])
            .map(repo => onlyNames ? repo.name : repo);
    }

    /**
     * Fetches a specific repositories' commits for the objects' user.
     * @param {String} repo The repository to get the commits for.
     * @returns A list of commits. Maximum amount is 30 due to public API limitations.
     */
    async getRepoCommits (repo) {
        return await this.getResponse(`repos/${this.account}/${repo}/commits`);
    }

    async getRepoLanguages () {

    }

    /**
     * Determines the users public committing email.
     * @returns The users' public email, true if no repos to scan, false if no repos
     * that contain the user's commits or null if user doesn't exist.
     */
    async gitEmail () {
        const user = await this.getUser();
        if (user == null) return null;
        const repos = await this.getUserRepos(Repo.OWNED, true);
        if (repos.length == 0) {
            return true;
        }
        else {
            for (let repo in repos) {
                let commits = await this.getRepoCommits(repos[repo]);
                for (var commit in commits) {
                    if (commits[commit].author != null) {
                        if (commits[commit].author.login == this.account) {
                            return commits[commit].commit.author.email;
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

export {GitEmail, Account, Repo};
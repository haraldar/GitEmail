import {GitEmail, Account, Repo} from './gitemail.js';

// TODO
// 1. extract all languages of a user from the last 30 repos, count them together then display in spider chart
// 2. get all associates in the last 30 repos and show as mind map
// 3. get used libraries from each file


const coherents_withcheck = {
    "name" : "name",
    "bio" : "bio",
    "email" : "email",
    "location" : "location",
    "company" : "company",
    "hireable" : "hireable",
    "blog" : "blog",
    "twitter" : "twitter_username",
    "followers" : "followers",
    "following" : "following",
    "gists" : "public_gists",
    "repos" : "public_repos"
};

const coherents_nocheck = {
    "account" : "login",
    "created" : "created_at",
    "updated" : "updated_at"
};

window.onload = async function () {
    await chrome.storage.local.get(["ghToReportOn"], async function (items) {
        // Fill out the standard output fields with the passed json object.
        const ghToReportOn = items["ghToReportOn"];
        getElem("image").src = ghToReportOn["avatar_url"];
        document.querySelector("#fullreport-title").textContent += (": " + ghToReportOn["login"]);

        setMultipleText(coherents_nocheck, ghToReportOn, false);
        setMultipleText(coherents_withcheck, ghToReportOn);

        getElem("account").href = `https://www.github.com/${ghToReportOn.login}`;

        if (ghToReportOn.company != null) {
            if (ghToReportOn.company.includes("@")) {
                getElem("company").href = "https://www.github.com/" + ghToReportOn.company
                .replace("@", "")
                .replace(" ", "");
            }
        }

        if (ghToReportOn.blog != null)
            getElem("blog").href = ghToReportOn.blog;

        if (ghToReportOn.twitter_username != null)
            getElem("twitter").href = "https://www.twitter.com/" + ghToReportOn.twitter_username;

        // Check if email has been correctly extracted, else obtain it from one of the commits.
        const reportedUser = getElem("account").textContent;
        console.log(await new GitEmail(reportedUser).getUser());
        const email = await new GitEmail(reportedUser).gitEmail();
        if (email !== null && email !== true && email != false) {
            const currentDisplayedEmail = getElem("email").textContent;
            if (currentDisplayedEmail == "Not given.") {
                getElem("email").textContent = email;
                getElem("email").href = `mailto:${email}`;
            }
        };
        const repos = await new GitEmail(reportedUser).getUserRepos(Repo.OWNED, false);
        console.log(repos);
    });
}

const getElem = (selector) => document.querySelector(`#user-${selector}`);

const notGivenOr = (elem) => elem ?? "Not given.";

function setElemText (elem, key, data_dict, notGivenCheck = true){
    getElem(elem).textContent = notGivenCheck ?
        notGivenOr(data_dict[key]) :
        data_dict[key];
}

function setMultipleText (elems_dict, data_dict, notGivenCheck = true) {
    for (let elem in elems_dict) {
        setElemText(elem, elems_dict[elem], data_dict, notGivenCheck);
    }
}


function newElem (id, text, href = null) {
    // 1.1 Check if elem exists.
    // 1.2. if elem exists, remove.
    // 2.1. create elem with id
    // 2.2. set href if given and as a-tag
    // 3. Insert the element in the correct div.
}
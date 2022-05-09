import {GitEmail, Account, Repo} from './gitemail.js';

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

        // Check if email has been correctly extracted, else obtain it from one of the commits.
        const reportedUser = getElem("account").textContent;
        console.log(await new GitEmail(reportedUser).getUser());
        const email = await new GitEmail(reportedUser).gitEmail();
        if (email !== null && email !== true && email != false) {
            const currentDisplayedEmail = getElem("email").textContent;
            if (currentDisplayedEmail == "Not given.") getElem("email").textContent = email;
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
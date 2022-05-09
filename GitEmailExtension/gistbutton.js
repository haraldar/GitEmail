function createGistButton() {
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
        console.log(URL);
        if (NAV.length > 0) NAV[0].append(gistbutton);
    }
}

window.onload = () => createGistButton();
window.setInterval(() => createGistButton(), 500);
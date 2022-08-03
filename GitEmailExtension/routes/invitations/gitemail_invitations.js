document
    .getElementById("find-btn")
    .addEventListener(
        "click",
        () => {
            const repoName = document.getElementById("repo-input").value;
            const inviSrc = document.getElementById("source-input").value;
            window.location.href = `https://www.github.com/${inviSrc}/${repoName}/invitations`;
        },
        false
    )
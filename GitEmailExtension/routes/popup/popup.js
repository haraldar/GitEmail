window.onload = chrome.tabs.create(
    {
        url: chrome.runtime.getURL("routes/search/gitemail_search.html")
    }
);
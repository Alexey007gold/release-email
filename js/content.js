let regex = /https:\/\/github\.com\/wkda\/([A-Za-z0-9]+(-[A-Za-z0-9]+)+)\/releases\/tag\/([0-9]+(\.[0-9]+)+)/i;
let floatingButton;

function createFloatingButton(recipients) {
    floatingButton = document.createElement('p');
    updateButtonLook(recipients);

    floatingButton.style.cursor = "pointer";
    floatingButton.id = 'release_tag_float';
    floatingButton.style.position = 'fixed';
    floatingButton.style.left = '10px';
    floatingButton.style.padding = '1px 5px';
    floatingButton.style.color = 'white';
    floatingButton.style.borderRadius = '5px';
    floatingButton.style.zIndex = '9999';
    floatingButton.style.top = '50%';
    floatingButton.style.transform = 'translateY(-50%)';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('images/icon48.png');
    icon.width = 24;
    icon.height = 24;
    floatingButton.appendChild(icon);
}

function updateButtonLook(recipients) {
    if (recipients) {
        floatingButton.title = 'Generate Release Email';
        floatingButton.style.backgroundColor = '#eb7e24';
        floatingButton.onclick = () => onClick(true);
    } else {
        floatingButton.title = 'Setup extension first!'
        floatingButton.style.backgroundColor = '#8c8c8c';
        floatingButton.onclick = () => onClick(false);
    }
}

function recreateIfNeeded(recreate, config) {
    if (recreate) {
        updateButtonLook(config.recipients);
        removeButton();
        addButton();
    }
}

function getButton() {
    return document.getElementById('release_tag_float');
}

function addButton() {
    if (!getButton()) {
        document.body.appendChild(floatingButton);
    }
}

function removeButton() {
    let existingButton = getButton();
    if (existingButton) {
        existingButton.remove();
    }
}

function onClick(configured) {
    withConfig(function (config) {
        if (config.recipients) {
            recreateIfNeeded(!configured, config);
            doOpenLink(config);
        } else {
            recreateIfNeeded(configured, config);
            alert('Setup extension first!')
        }
    });
}

function doOpenLink(config) {
    const tagParts = window.location.pathname.split('/');
    const repoName = tagParts[2];
    const tagName = tagParts[5];
    const changes = parseChanges();

    const defaultSu = `[Technical] Release of ${repoName} ${tagName}`;
    const defaultBody = `We are going to release ${repoName} ${tagName}\nChanges:\n${changes}`;
    const defaultAcc = 0;

    let replacer = replacePlaceholders(repoName, tagName, changes);
    const suTemplate = replacer(config.suTemplate);
    const bodyTemplate = replacer(config.bodyTemplate);

    const recipients = encodeURIComponent(config.recipients);
    const su = encodeURIComponent(suTemplate || defaultSu);
    const body = encodeURIComponent(bodyTemplate || defaultBody);
    const acc = config.acc || defaultAcc;

    let url = `https://mail.google.com/mail/u/${acc}/?fs=1&tf=cm&to=${recipients}&su=${su}&body=${body}`;
    window.open(url, '_blank').focus();
}

function replacePlaceholders(repoName, tagName, changes) {
    return function (target) {
        if (!target) {
            return;
        }
        return target.replaceAll('$repoName', repoName)
            .replaceAll('$tagName', tagName)
            .replaceAll('$changes', changes);

    }
}

function parseChanges() {
    let summaryString = '';
    const markdownBody = document.querySelector('.markdown-body');

    if (markdownBody) {
        const detailsElements = markdownBody.querySelectorAll('details');
        detailsElements.forEach(detailsElement => {
            const summaryElement = detailsElement.querySelector('summary');
            if (summaryElement) {
                summaryString += summaryElement.textContent + '\n';
            }
        });

        if (summaryString) {
            return summaryString;
        }

        const listElements = markdownBody.querySelectorAll('li');
        listElements.forEach(listElement => {
            if (listElement) {
                summaryString += listElement.textContent.replaceAll(/\([^)]*\)/g, '') + '\n';
            }
        });

    }
    return summaryString;
}

function withConfig(consumer) {
    chrome.storage.sync.get(['recipients', 'suTemplate', 'bodyTemplate', 'acc'], function (config) {
        consumer(config);
    });
}

function checkUrl(url) {
    regex.test(url) ? addButton() : removeButton();
}

withConfig(function (config) {
    createFloatingButton(config.recipients);

    window.navigation.addEventListener("navigate", (event) => {
        checkUrl(event.destination.url);
    })

    checkUrl(window.location.href);
});

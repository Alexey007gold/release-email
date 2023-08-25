function createFloatingButton(recipients, su, body, acc) {

    let floatingButton;
    if (recipients) {
        floatingButton = document.createElement('a');
        floatingButton.href = `https://mail.google.com/mail/u/${acc}/?fs=1&tf=cm&to=${recipients}&su=${su}&body=${body}`;
        floatingButton.title = 'Generate Release Email';
        floatingButton.target = '_blank';
        floatingButton.style.backgroundColor = '#eb7e24';
    } else {
        floatingButton = document.createElement('p');
        floatingButton.title = 'Setup extension first!'
        floatingButton.style.backgroundColor = '#8c8c8c';
        floatingButton.onclick = () => alert('Setup extension first!');
    }

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


    return floatingButton;
}


chrome.storage.sync.get(['recipients', 'suTemplate', 'bodyTemplate', 'acc'], function (result) {
    const tagParts = window.location.pathname.split('/');
    const repoName = tagParts[2];
    const tagName = tagParts[5];
    const changes = parseChanges();

    console.log(result);

    const defaultSu = `[Technical] Release of ${repoName} ${tagName}`;
    const defaultBody = `We are going to release ${repoName} ${tagName}\nChanges:\n${changes}`;
    const defaultAcc = 0;

    let replacer = replacePlaceholders(repoName, tagName, changes);
    const suTemplate = replacer(result.titleTemplate);
    const bodyTemplate = replacer(result.bodyTemplate);

    const recipients = encodeURIComponent(result.recipients);
    const su = encodeURIComponent(suTemplate || defaultSu);
    const body = encodeURIComponent(bodyTemplate || defaultBody);
    const acc = result.acc || defaultAcc;

    const floatingButton = createFloatingButton(recipients, su, body, acc);

    document.body.appendChild(floatingButton);
});

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

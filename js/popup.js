document.addEventListener('DOMContentLoaded', function () {
    const recipientsInput = document.getElementById('recipients');
    const suTemplateInput = document.getElementById('su');
    const bodyTemplateInput = document.getElementById('body');
    const saveButton = document.getElementById('saveButton');
    const accInput = document.getElementById('acc');

    chrome.storage.sync.get(['recipients', 'suTemplate', 'bodyTemplate', 'acc'], function (result) {
        if (result.recipients) {
            recipientsInput.value = result.recipients;
        }
        if (result.suTemplate) {
            suTemplateInput.value = result.suTemplate;
        } else {
            suTemplateInput.value = '[Technical] Release of $repoName $tagName'
        }
        if (result.bodyTemplate) {
            bodyTemplateInput.value = result.bodyTemplate;
        } else {
            bodyTemplateInput.value = `We are going to release $repoName $tagName\n\nChanges:\n$changes`;
        }
        if (result.acc) {
            accInput.value = result.acc;
        } else {
            accInput.value = 0;
        }
    });

    saveButton.addEventListener('click', function () {
        const recipients = recipientsInput.value;
        const su = suTemplateInput.value;
        const body = bodyTemplateInput.value;
        const acc = accInput.value;
        chrome.storage.sync.set({recipients: recipients, suTemplate: su, bodyTemplate: body, acc: acc}, function () {
            console.log('Settings saved!');
            window.close();
        });
    });
});

const enablePickerBtn = document.getElementById('enable-picker-btn');
const languageSelect = document.getElementById('language-select');

enablePickerBtn.addEventListener('click', () => {
    const targetLanguage = languageSelect.value;

    chrome.storage.sync.set({ targetLanguage: targetLanguage });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            type: "ENABLE_PICKER"
        });
        window.close();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['targetLanguage'], (result) => {
        if (result.targetLanguage) {
            languageSelect.value = result.targetLanguage;
        }
    });
});
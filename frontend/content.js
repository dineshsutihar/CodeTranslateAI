let isPickerEnabled = false;
let hoveredElement = null;

// The main listener for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ENABLE_PICKER") {
        if (!isPickerEnabled) enablePicker();
    }
});

function enablePicker() {
    isPickerEnabled = true;
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick, true);
}

function disablePicker() {
    isPickerEnabled = false;
    document.body.style.cursor = 'default';
    if (hoveredElement) hoveredElement.classList.remove('translator-highlight');
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    document.removeEventListener('click', onClick, true);
}

function onMouseOver(e) {
    hoveredElement = e.target;
    hoveredElement.classList.add('translator-highlight');
}

function onMouseOut(e) {
    e.target.classList.remove('translator-highlight');
    hoveredElement = null;
}

function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const clickedElement = e.target;
    const selectedCode = clickedElement.textContent;
    disablePicker();

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'translator-loading';
    loadingDiv.textContent = 'Translating...';
    clickedElement.parentNode.insertBefore(loadingDiv, clickedElement.nextSibling);

    chrome.runtime.sendMessage({ type: "TRANSLATE_CODE", code: selectedCode }, (response) => {
        loadingDiv.remove();

        if (response.error) {
            alert(`Error: ${response.error}`);
        } else if (response.translation) {
            injectTranslatedCode(response.translation, clickedElement);
        }
    });
}

function injectTranslatedCode(translatedCode, originalElement) {
    const container = document.createElement('div');
    container.className = 'translation-container';

    const header = document.createElement('h4');
    header.textContent = 'AI-Generated Translation:';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = translatedCode;
    pre.appendChild(code);

    container.appendChild(header);
    container.appendChild(pre);

    // Insert the container right after the original element
    originalElement.parentNode.insertBefore(container, originalElement.nextSibling);
}
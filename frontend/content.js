let isPickerEnabled = false;
let hoveredElement = null;

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

async function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const clickedElement = e.target;
    const selectedCode = clickedElement.textContent;
    const cacheKey = `translation_${hashCode(selectedCode)}`;
    const originalWidth = clickedElement.getBoundingClientRect().width;
    disablePicker();

    const { targetLanguage } = await chrome.storage.sync.get('targetLanguage');
    const lang = targetLanguage || 'Java';

    const cachedData = await getFromCache(cacheKey);
    if (cachedData && cachedData[lang]) {
        injectOrUpdateTranslations(cachedData, clickedElement, originalWidth);
        return;
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'translator-loading';
    loadingDiv.textContent = `Translating to ${lang}...`;
    clickedElement.parentNode.insertBefore(loadingDiv, clickedElement.nextSibling);

    chrome.runtime.sendMessage({ type: "TRANSLATE_CODE", code: selectedCode }, async (response) => {
        loadingDiv.remove();

        if (response.error) {
            alert(`Error: ${response.error}`);
        } else if (response.translation) {
            const cleanedTranslation = response.translation.replace(/```[a-z]*\n/g, '').replace(/```/g, '').trim();

            const newData = cachedData || {};
            newData[lang] = cleanedTranslation;
            await saveToCache(cacheKey, newData, 10);

            injectOrUpdateTranslations(newData, clickedElement, originalWidth);
        }
    });
}

function injectOrUpdateTranslations(translations, originalElement, width) {
    const componentStyles = `
        .tab-nav {
            display: flex;
            border-bottom: 1px solid #ccc;
            background-color: #f0f0f0;
        }
        .tab-link {
            padding: 10px 15px;
            cursor: pointer;
            border: none;
            background-color: transparent;
            font-size: 1em;
            font-weight: 500;
            color: #333;
            border-bottom: 3px solid transparent;
        }
        .tab-link:hover {
            background-color: #e5e5e5;
        }
        .tab-link.active {
            color: #007bff;
            border-bottom: 3px solid #007bff;
        }
        .tab-content-area {
            background-color: #fff;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        pre {
            margin: 0;
            padding: 16px;
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #f6f8fa;
            border-top: 1px solid #ddd;
            margin-bottom: 10px;
        }
        code {
            font-family: monospace;
            font-size: 14px;
            color: #24292e;
            line-height: 1;
        }
    `;

    let container = originalElement.nextElementSibling;
    if (!container || container.id !== 'my-code-translator-container') {
        container = document.createElement('div');
        container.id = 'my-code-translator-container';

        const shadowRoot = container.attachShadow({ mode: 'open' });

        const styleElement = document.createElement('style');
        styleElement.textContent = componentStyles;
        shadowRoot.appendChild(styleElement);

        const uiWrapper = document.createElement('div');
        shadowRoot.appendChild(uiWrapper);

        originalElement.parentNode.insertBefore(container, originalElement.nextSibling);
    }

    container.style.width = `${width}px`;
    container.style.boxSizing = 'border-box';

    const shadowRoot = container.shadowRoot;
    const uiWrapper = shadowRoot.querySelector('div');
    uiWrapper.innerHTML = '';

    const tabNav = document.createElement('div');
    tabNav.className = 'tab-nav';

    const contentArea = document.createElement('div');
    contentArea.className = 'tab-content-area';

    uiWrapper.appendChild(tabNav);
    uiWrapper.appendChild(contentArea);

    Object.keys(translations).forEach((lang, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-link';
        tabButton.textContent = lang;

        const contentPanel = document.createElement('div');
        contentPanel.className = 'tab-content';

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = translations[lang];
        pre.appendChild(code);
        contentPanel.appendChild(pre);

        tabNav.appendChild(tabButton);
        contentArea.appendChild(contentPanel);

        if (index === 0) {
            tabButton.classList.add('active');
            contentPanel.classList.add('active');
        }

        tabButton.addEventListener('click', () => {
            shadowRoot.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
            shadowRoot.querySelectorAll('.tab-content').forEach(panel => panel.classList.remove('active'));

            tabButton.classList.add('active');
            contentPanel.classList.add('active');
        });
    });
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
}

async function saveToCache(key, data, daysToExpire) {
    const expirationMs = daysToExpire * 24 * 60 * 60 * 1000;
    const cacheItem = {
        data: data,
        expiresAt: Date.now() + expirationMs,
    };
    await chrome.storage.local.set({ [key]: cacheItem });
}

async function getFromCache(key) {
    const result = await chrome.storage.local.get(key);
    const cacheItem = result[key];

    if (!cacheItem) {
        return null;
    }

    if (Date.now() > cacheItem.expiresAt) {
        await chrome.storage.local.remove(key);
        return null;
    }

    return cacheItem.data;
}
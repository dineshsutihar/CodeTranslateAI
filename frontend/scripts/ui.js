export function injectOrUpdateTranslations(
  translations,
  originalElement,
  width
) {
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
            color: #555;
            border-bottom: 3px solid transparent;
        }
        .tab-link:hover {
            background-color: #e5e5e5;
        }
        .tab-link.active {
            color: #007bff;
            font-weight: 600;
            border-bottom: 3px solid #007bff;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .code-wrapper{
            position:relative
        }
        .copy-button {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 6px 12px;
            font-size: 14px;
            background-color: rgba(255, 255, 255, 0.08); /* soft overlay */
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #f0f0f0;
            cursor: pointer;
            transition: background-color 0.3s, border-color 0.3s, color 0.3s;
            z-index: 10;
        }
        .copy-button:hover {
            background-color: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            color: #ffffff;
        }
        .copy-button:active {
            background-color: rgba(255, 255, 255, 0.2);
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        code {
            font-family: monospace;
            font-size: 0.8em;
        }
    `;

  let container = originalElement.nextElementSibling;

  if (!container || container.id !== "my-code-translator-container") {
    container = document.createElement("div");
    container.id = "my-code-translator-container";
    const shadowRoot = container.attachShadow({ mode: "open" });
    const prismTheme = document.createElement("link");
    prismTheme.rel = "stylesheet";
    prismTheme.href = chrome.runtime.getURL("packages/prism.css");
    shadowRoot.appendChild(prismTheme);
    const styleElement = document.createElement("style");
    styleElement.textContent = componentStyles;
    shadowRoot.appendChild(styleElement);
    const uiWrapper = document.createElement("div");
    uiWrapper.className = "ui-wrapper";
    shadowRoot.appendChild(uiWrapper);
    originalElement.parentNode.insertBefore(
      container,
      originalElement.nextSibling
    );
  }

  container.style.width = `${width}px`;
  container.style.boxSizing = "border-box";
  const shadowRoot = container.shadowRoot;
  const uiWrapper = shadowRoot.querySelector(".ui-wrapper");
  uiWrapper.innerHTML = "";
  const tabNav = document.createElement("div");
  tabNav.className = "tab-nav";
  const contentArea = document.createElement("div");
  contentArea.className = "tab-content-area";
  uiWrapper.appendChild(tabNav);
  uiWrapper.appendChild(contentArea);
  Object.keys(translations).forEach((lang) => {
    const contentPanel = document.createElement("div");
    contentPanel.className = "tab-content";
    contentPanel.dataset.lang = lang;
    const codeWrapper = document.createElement("div");
    codeWrapper.className = "code-wrapper";
    const copyButton = document.createElement("div");
    copyButton.className = "copy-button";
    copyButton.innerText = "copy";
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(translations[lang]).then(() => {
        copyButton.innerText = "Copied!";
        setTimeout(() => (copyButton.innerText = "Copy"), 2000);
      });
    });
    const langClass = `language-${lang.toLowerCase()}`;
    const pre = document.createElement("pre");
    pre.className = langClass;
    const code = document.createElement("code");
    code.className = langClass;
    code.textContent = translations[lang];

    pre.appendChild(code);
    codeWrapper.appendChild(copyButton);
    codeWrapper.appendChild(pre);
    contentPanel.appendChild(codeWrapper);
    contentArea.appendChild(contentPanel);
  });

  Object.keys(translations).forEach((lang, index) => {
    const tabButton = document.createElement("button");
    tabButton.className = "tab-link";
    tabButton.textContent = lang;
    tabButton.addEventListener("click", () => {
      shadowRoot
        .querySelectorAll(".tab-link")
        .forEach((btn) => btn.classList.remove("active"));
      shadowRoot
        .querySelectorAll(".tab-content")
        .forEach((panel) => panel.classList.remove("active"));
      tabButton.classList.add("active");
      shadowRoot
        .querySelector(`.tab-content[data-lang="${lang}"]`)
        .classList.add("active");
    });
    tabNav.appendChild(tabButton);
    if (index === 0) {
      tabButton.click();
    }
  });
  try {
    if (window.Prism) {
      contentArea
        .querySelectorAll(`pre[class*="language-"]`)
        .forEach((element) => window.Prism.highlightElement(element));
    }
  } catch (e) {
    console.error("CodeTranslateAI: Error highlighting syntax.", e);
  }
}

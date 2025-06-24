# CodeTranslateAI 🚀

CodeTranslateAI is a powerful Chrome extension that allows you to translate code snippets on any webpage in real-time. Simply select a block of code, choose your target language, and get an AI-powered translation instantly injected into the page in a clean, tabbed interface.

## ✨ Key Features

- **On-the-Fly Translation:** Instantly translate code on platforms like Stack Overflow, Medium, and technical blogs.
- **Secure Backend:** Uses a serverless Cloudflare Worker so your AI API key is never exposed on the frontend.
- **Multi-Language Tabs:** Translate the same code block into multiple languages and switch between them easily.
- **Smart Caching:** Translations are cached in your browser for 10 days to reduce API calls and provide instant results for previously translated code.
- **Elegant UI:** A clean, non-intrusive UI that matches the width of the original code block and uses a tabbed layout for multiple translations.
- **Powered by Gemini:** Leverages the power of Google's Gemini AI for high-quality code translations.

---

## 🔧 Tech Stack

- **Frontend:**
  - Plain JavaScript (ES6+)
  - HTML5 & CSS3
  - Chrome Extension APIs (`storage`, `runtime`, `scripting`)
  - Shadow DOM for style isolation.
- **Backend:**
  - Cloudflare Workers
  - TypeScript
  - Wrangler CLI
  - Google Gemini API

---

## 📚 Getting Started & Installation Guide

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js and npm installed on your machine.

- [Download Node.js](https://nodejs.org/)

### ⚙️ Part 1: Backend Setup (Cloudflare Worker)

1.  **Clone the Repository** (or set up your backend folder).

    ```sh
    git clone https://github.com/dineshsutihar/CodeTranslateAI.git
    cd CodeTranslateAI/backend
    ```

2.  **Install Dependencies**

    ```sh
    npm install
    ```

3.  **Login to Cloudflare**

    ```sh
    npx wrangler login
    ```

4.  **Get a Gemini API Key**

    - Go to [Google AI Studio](https://aistudio.google.com/) to create your free API key.

5.  **Set the Secret Key**

    - Run the following command and paste your Gemini API key when prompted. This stores it securely on Cloudflare.

    ```sh
    npx wrangler secret put GEMINI_API_KEY
    ```

6.  **Deploy the Worker**

    - Deploy the backend to make it live.

    ```sh
    npx wrangler deploy
    ```

    - After deployment, **copy the URL** that Wrangler provides. It will look like `https://backend.<your-worker-name>.dev`.

### 🖥️ Part 2: Frontend Setup (Chrome Extension)

1.  **Configure the Backend URL**

    - Navigate to your Chrome extension folder (e.g., `my-code-translator`).
    - Open the `background.js` file.
    - Find the `BACKEND_URL` constant and **paste the Cloudflare Worker URL** you copied in the previous step.

    ```javascript
    // background.js
    const BACKEND_URL = "https://backend.<your-worker-name>.dev"; // PASTE YOUR URL HERE
    ```

2.  **Load the Extension in Chrome**

    - Open Google Chrome and navigate to `chrome://extensions`.
    - Enable **"Developer mode"** using the toggle in the top-right corner.
    - Click the **"Load unpacked"** button.
    - Select your Chrome extension folder (the one containing `manifest.json`).

The **CodeTranslateAI** icon should now appear in your Chrome toolbar, and the extension is ready to use\!

---

## 📖 How to Use

1.  Click the extension icon in the Chrome toolbar.
2.  Select your desired target language from the dropdown menu.
3.  Click the **"Enable Code Selector"** button.
4.  Your cursor will change to a crosshair. Hover over any code block on a webpage and click on it.
5.  A "Translating..." message will appear, followed by a new UI element containing the translated code.
6.  If you translate the same block into another language, a new tab will be added to the UI.

---

## 🐛 Debugging the Backend

If you encounter errors or the translation isn't working, the first step is to check the live logs from your Cloudflare Worker. This allows you to see what's happening on the server in real-time.

1.  **Navigate to your Backend Directory**

    - Open your terminal and change into the directory where your Cloudflare Worker code is located (e.g., `CodeTranslateAI/backend`).

2.  **Run the Tail Command**

    - Execute the following command to start streaming the logs:

    ```sh
    npx wrangler tail
    ```

    - The terminal will connect and say `Connected to [worker-name], waiting for logs...`.

3.  **Trigger the Error**

    - With the log stream running, go to your browser and use the extension to perform an action that causes an error.

4.  **Check the Terminal**

    - Look back at your terminal. Any errors or log messages from your worker will appear instantly. Look for lines that start with `(error)`. This will give you the exact reason for the failure, such as an invalid API key or a quota issue.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE.txt` for more information.

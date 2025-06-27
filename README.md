# CodeTranslateAI 🚀

CodeTranslateAI is a powerful Chrome extension that allows you to translate code snippets on any webpage in real-time. Simply select a block of code, choose your target language, and get an AI-powered translation instantly injected into the page in a clean, tabbed interface.

## ✨ Key Features

- **On-the-Fly Translation:** Instantly translate code on platforms like Stack Overflow, Medium, and technical blogs.
- **Secure Serverless Backend:** Uses a Cloudflare Worker so your AI API key is never exposed on the frontend.
- **Multi-Language Tabs:** Translate the same code block into multiple languages and switch between them easily.
- **Smart Caching:** Translations are cached in your browser for 10 days to reduce API calls and provide instant results.
- **Elegant & Isolated UI:** A clean UI that matches the width of the original code block and uses a Shadow DOM to prevent any style conflicts with the host page.
- **Powered by Gemini:** Leverages Google's Gemini AI for high-quality code translations with syntax highlighting.

---

## 🔧 Tech Stack

- **Frontend:**
  - Modular JavaScript (ES6+)
  - **esbuild** (for bundling)
  - HTML5 & CSS3
  - Chrome Extension APIs (`storage`, `activeTab`)
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

You must have **Node.js** and **npm** installed on your machine.

- [Download Node.js](https://nodejs.org/)

### ⚙️ Part 1: Backend Setup (Cloudflare Worker)

1.  **Clone the Repository**

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

    - Run the following command and paste your Gemini API key when prompted.

    <!-- end list -->

    ```sh
    npx wrangler secret put GEMINI_API_KEY
    ```

6.  **Deploy the Worker**

    - Deploy the backend to make it live.

    <!-- end list -->

    ```sh
    npx wrangler deploy
    ```

    - After deployment, **copy the URL** that Wrangler provides.

### 🖥️ Part 2: Frontend Setup (Chrome Extension)

1.  **Navigate to the Frontend Directory**

    ```sh
    cd ../frontend
    ```

2.  **Install Dependencies**

    ```sh
    npm install
    ```

3.  **Configure the Backend URL**

    - Open the `background.js` file.
    - Find the `BACKEND_URL` constant and **paste the Cloudflare Worker URL** you copied in the previous step.

    ```javascript
    // background.js
    const BACKEND_URL = "https://backend.exampledinesh.workers.dev"; // PASTE YOUR URL HERE
    ```

4.  **Build the Extension**

    - You must run the build command to bundle the modular JavaScript files.

    <!-- end list -->

    ```sh
    npm run build
    ```

    This will create a `dist` folder containing the `content.bundle.js` file.

5.  **Load the Extension in Chrome**

    - Open Google Chrome and navigate to `chrome://extensions`.
    - Enable **"Developer mode"**.
    - Click the **"Load unpacked"** button.
    - Select your Chrome extension folder (the `frontend` folder that contains `manifest.json`).

The **CodeTranslateAI** icon should now appear in your Chrome toolbar\!

---

## 💻 Development Workflow

When you make changes to the frontend JavaScript files in the `scripts/` folder, you must re-bundle them before you can see the changes.

1.  Save your changes in any `.js` file inside the `scripts/` folder.
2.  Run the build command in your terminal:
    ```sh
    npm run build
    ```
3.  Go to `chrome://extensions` and click the **reload** button for the CodeTranslateAI extension.

---

## 📖 How to Use

1.  Click the extension icon in the Chrome toolbar.
2.  Select your desired target language from the dropdown menu.
3.  Click the **"Enable Code Selector"** button.
4.  Your cursor will change to a crosshair. Click on any code block on a webpage.
5.  A "Translating..." message will appear, followed by the translated code in a new UI.

---

## 🐛 Debugging the Backend

If you encounter errors, check the live logs from your Cloudflare Worker.

1.  **Navigate to your Backend Directory**.
2.  **Run the Tail Command**:
    ```sh
    npx wrangler tail
    ```
3.  **Trigger the Error** by using the extension in your browser and check the terminal for error messages.

---

## ⚖️ License

Distributed under the MIT License.

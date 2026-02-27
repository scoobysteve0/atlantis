# Atlantis v4.0

This is the production-ready macOS Electron Application build of Atlantis (v4.0).
It transforms the previous web-based dashboard (v3.3) into a native desktop application with a clean, robust architecture.

## Features

- **Native macOS Experience:** Custom frameless window with native drag regions and traffic lights.
- **Secure Architecture:** Uses Electron's `contextBridge` and `ipcRenderer` for secure communication between the main process and the UI.
- **Robust Data Handling:** Handles local `data.json` loading via Node.js file system access in the main process, ensuring reliability.
- **Modular Codebase:** Organized into `src/main` (Electron) and `src/renderer` (UI/Web).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/scoobysteve0/atlantis.git
    cd atlantis
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the App

To start the application in development mode:

```bash
npm start
```

## Building for Production

To create a distributable macOS application (`.dmg` or `.app`):

```bash
npm run dist
```
The output will be in the `dist/` directory.

## Project Structure

- `src/main/`: Electron main process (`index.js`) and preload script (`preload.js`).
- `src/renderer/`: The UI code (HTML, CSS, JS), migrated from the v3.3 web app.
- `package.json`: Dependencies and build scripts.

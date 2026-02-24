# 📄 PDF Finder - Build Guide

Welcome! This guide will show you how to set up the development environment and build the **PDF Finder** standalone application for macOS, Windows, and Linux.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js**: (v16 or higher recommended) - [Download here](https://nodejs.org/)
- **npm**: (Comes bundled with Node.js)
- **Git**: To clone the repository.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/matteokoi/OpenAllPDFs.git
cd OpenAllPDFs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
To test the app without building it, use:
```bash
npm start
```

---

## 📦 Building Standalone Apps

We use `electron-builder` to package the application. You can build for specific platforms using the commands below.

### 🍏 for macOS
Generates a `.app` and a `.dmg` installer.
```bash
npm run build:mac
```
*Output: `dist/OpenAllPDFs-x.x.x.dmg`*

### 🪟 for Windows
Generates a one-click NSIS installer (`.exe`).
```bash
npm run build:win
```
*Output: `dist/OpenAllPDFs Setup x.x.x.exe`*

### 🐧 for Linux
Generates a portable `.AppImage`.
```bash
npm run build:linux
```
*Output: `dist/OpenAllPDFs-x.x.x.AppImage`*

---

## 📂 Where is my app?
After running any build command, find your portable app or installer in the **`dist/`** folder.

---

## 🛠️ Troubleshooting

- **macOS Build Hardware**: If you are on an Intel Mac, the build will target Intel. If you are on Apple Silicon (M1/M2/M3), it will target ARM64.
- **Linux Dependencies**: Building the Linux version on non-Linux systems may require `libarchive` or `fpm`. We recommend building for Linux on a Linux environment for best compatibility.
- **Windows Wine**: Building Windows apps on macOS/Linux may require `wine`. If you encounter errors, try building directly on a Windows machine.

---

### 🎨 Features Recap
- **Glassmorphism UI**: Beautiful Apple-inspired design.
- **Batch Download**: Sequential secure downloading to any folder.
- **Favicon Support**: Visual identification of document sources.
- **Responsive**: Adapts to any window size.

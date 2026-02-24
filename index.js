const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 600,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true,
            plugins: true // Enable internal PDF viewer
        }

    });

    // Set a common User-Agent to avoid being blocked
    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('open-pdf', (event, url) => {
    shell.openExternal(url);
});

ipcMain.on('open-pdf-internal', (event, url) => {
    const pdfWin = new BrowserWindow({
        width: 900,
        height: 800,
        webPreferences: {
            plugins: true // Built-in PDF viewer
        }
    });
    pdfWin.loadURL(url);
});

ipcMain.on('download-pdf', (event, url) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        // This will trigger the 'will-download' event on the session
        win.webContents.downloadURL(url);
    }
});

let batchTargetFolder = null;
let batchTotal = 0;
let batchCompleted = 0;

ipcMain.on('download-all-to-folder', async (event, urls) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Select Destination Folder for PDFs',
        properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) return;

    batchTargetFolder = filePaths[0];
    batchTotal = urls.length;
    batchCompleted = 0;

    for (const url of urls) {
        // This triggers 'will-download' on the session
        win.webContents.downloadURL(url);
    }
});

app.on('session-created', (session) => {
    session.on('will-download', (event, item, webContents) => {
        if (batchTargetFolder) {
            // SILENT BATCH DOWNLOAD
            const fileName = item.getFilename();
            const filePath = path.join(batchTargetFolder, fileName);

            // Set save path to download without prompt
            item.setSavePath(filePath);

            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed');
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused');
                    }
                }
            });

            item.once('done', (event, state) => {
                if (state === 'completed') {
                    batchCompleted++;
                    webContents.send('download-progress', {
                        current: batchCompleted,
                        total: batchTotal,
                        filename: fileName
                    });

                    // Reset if everything is done
                    if (batchCompleted === batchTotal) {
                        batchTargetFolder = null;
                    }
                } else {
                    console.log(`Download failed: ${state}`);
                }
            });
        } else {
            // REGULAR SINGLE DOWNLOAD
            // The user will see the default Electron/OS save dialog
        }
    });
});

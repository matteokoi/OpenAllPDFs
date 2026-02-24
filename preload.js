const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pdfApp', {
    findPDFs: () => {
        const urls = [...new Set(
            [...document.querySelectorAll('a[href]')]
                .map(a => a.href)
                .filter(h => h && /\.pdf(\?|#|$)/i.test(h))
        )];
        return urls;
    },
    openPDF: (url) => ipcRenderer.send('open-pdf', url),
    openPDFInternal: (url) => ipcRenderer.send('open-pdf-internal', url),
    downloadPDF: (url) => ipcRenderer.send('download-pdf', url),
    downloadAllToFolder: (urls) => ipcRenderer.send('download-all-to-folder', urls),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data))
});

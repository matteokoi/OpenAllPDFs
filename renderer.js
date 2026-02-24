const urlInput = document.getElementById('urlInput');
const loadBtn = document.getElementById('loadBtn');
const status = document.getElementById('status');
const targetWebview = document.getElementById('targetWebview');
const results = document.getElementById('results');
const countSpan = document.getElementById('count');
const pdfList = document.getElementById('pdfList');
const openAllBtn = document.getElementById('openAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const openGallBtn = document.getElementById('openGallBtn');

const viewerSection = document.getElementById('viewerSection');
const pdfViewer = document.getElementById('pdfViewer');
const backBtn = document.getElementById('backBtn');
const viewerTitle = document.getElementById('viewerTitle');

const gallerySection = document.getElementById('gallerySection');
const galleryGrid = document.getElementById('galleryGrid');
const backFromGallBtn = document.getElementById('backFromGallBtn');

let foundUrls = [];
let isUserInitiated = false;

loadBtn.onclick = () => {
    let url = urlInput.value.trim();
    if (!url) return;

    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    isUserInitiated = true;
    status.textContent = 'Loading page...';
    results.style.display = 'none';
    viewerSection.style.display = 'none';
    gallerySection.style.display = 'none';
    pdfList.innerHTML = '';
    galleryGrid.innerHTML = '';

    targetWebview.src = url;
};

backBtn.onclick = () => {
    viewerSection.style.display = 'none';
    results.style.display = 'block';
    pdfViewer.src = 'about:blank';
};

backFromGallBtn.onclick = () => {
    gallerySection.style.display = 'none';
    results.style.display = 'block';
    galleryGrid.innerHTML = '';
};

openGallBtn.onclick = () => {
    results.style.display = 'none';
    gallerySection.style.display = 'block';
    showGallery();
};

function showGallery() {
    galleryGrid.innerHTML = '';
    foundUrls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const header = document.createElement('div');
        header.className = 'gallery-item-header';
        header.textContent = url.split('/').pop().split('?')[0];

        const wv = document.createElement('webview');
        wv.src = url;
        wv.setAttribute('plugins', '');

        const footer = document.createElement('div');
        footer.className = 'gallery-item-footer';
        footer.style.gap = '10px';

        const openBtn = document.createElement('button');
        openBtn.className = 'secondary';
        openBtn.textContent = 'Preview';
        openBtn.onclick = () => {
            gallerySection.style.display = 'none';
            viewerSection.style.display = 'block';
            viewerTitle.textContent = header.textContent;
            pdfViewer.src = url;
        };

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'secondary download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => window.pdfApp.downloadPDF(url);

        footer.appendChild(openBtn);
        footer.appendChild(downloadBtn);

        item.appendChild(header);
        item.appendChild(wv);
        item.appendChild(footer);
        galleryGrid.appendChild(item);
    });
}

targetWebview.addEventListener('did-finish-load', async () => {
    const currentURL = targetWebview.getURL();

    // Ignore initial blank page or loads that weren't triggered by the button
    if (currentURL === 'about:blank' || !isUserInitiated) {
        return;
    }

    status.textContent = 'Page loaded. Waiting for dynamic content...';

    // Wait 2 seconds for dynamic content (like search results) to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    status.textContent = 'Searching for PDFs...';

    try {
        // Execute script in webview to find PDFs
        // Improved regex handles query params and is case-insensitive
        const code = `
            (() => {
                const links = Array.from(document.querySelectorAll('a[href]'));
                const pdfLinks = links
                    .map(a => a.href)
                    .filter(href => {
                        try {
                            const url = new URL(href, window.location.href).href;
                            // Check if it ends in .pdf or has .pdf before search/hash params
                            return /\\.pdf($|\\?|#)/i.test(url);
                        } catch (e) {
                            return false;
                        }
                    });
                return [...new Set(pdfLinks)];
            })()
        `;

        foundUrls = await targetWebview.executeJavaScript(code);

        if (foundUrls.length > 0) {
            status.textContent = 'Detection complete.';
            results.style.display = 'block';
            countSpan.textContent = foundUrls.length;

            foundUrls.forEach(url => {
                const li = document.createElement('li');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'file-name';
                nameSpan.textContent = url.split('/').pop().split('?')[0] || url;
                nameSpan.title = url;

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'icon-actions';

                // Preview Icon
                const previewBtn = document.createElement('i');
                previewBtn.className = 'fa-solid fa-eye icon-btn view';
                previewBtn.title = 'Preview In-App';
                previewBtn.onclick = () => {
                    results.style.display = 'none';
                    viewerSection.style.display = 'block';
                    viewerTitle.textContent = nameSpan.textContent;
                    pdfViewer.src = url;
                };

                // Download Icon
                const downloadBtn = document.createElement('i');
                downloadBtn.className = 'fa-solid fa-download icon-btn download';
                downloadBtn.title = 'Download PDF';
                downloadBtn.onclick = () => window.pdfApp.downloadPDF(url);

                // External Icon
                const externalBtn = document.createElement('i');
                externalBtn.className = 'fa-solid fa-arrow-up-right-from-square icon-btn external';
                externalBtn.title = 'Open in Browser';
                externalBtn.onclick = () => window.pdfApp.openPDF(url);

                actionsDiv.appendChild(previewBtn);
                actionsDiv.appendChild(downloadBtn);
                actionsDiv.appendChild(externalBtn);

                li.appendChild(nameSpan);
                li.appendChild(actionsDiv);
                pdfList.appendChild(li);
            });
        } else {
            status.textContent = 'No PDF links found on this page. If this is a search page, the results might still be loading or blocked.';
        }
    } catch (err) {
        console.error(err);
        status.textContent = 'Error searching for PDFs: ' + err.message;
    }
});
targetWebview.addEventListener('did-fail-load', (e) => {
    console.error('Webview load failure:', e);
    status.textContent = `Error: Failed to load page (${e.errorDescription})`;
});

openAllBtn.onclick = () => {
    foundUrls.forEach(url => {
        // Open each in a new internal Electron window
        window.pdfApp.openPDFInternal(url);
    });
};

downloadAllBtn.onclick = () => {
    if (foundUrls.length === 0) return;
    status.textContent = 'Preparing batch download...';
    window.pdfApp.downloadAllToFolder(foundUrls);
};

window.pdfApp.onDownloadProgress(({ current, total, filename }) => {
    status.textContent = `Downloaded ${current} of ${total}: ${filename}`;
    if (current === total) {
        status.textContent = `Project complete: Successfully downloaded ${total} files.`;
    }
});

(() => {
    const urls = [...new Set(
        [...document.querySelectorAll('a[href]')]
            .map(a => a.href)
            .filter(h => h && /\.pdf\b/i.test(h))
    )];

    console.log(`Found ${urls.length} PDFs`);

    const btn = document.createElement('button');
    btn.textContent = 'Open next ' + urls.length + ' PDFs';
    btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;padding:10px 12px;';
    document.body.appendChild(btn);

    let idx = 0;
    btn.onclick = () => {
        const batch = urls.slice(idx, idx + urls.length);
        batch.forEach(u => window.open(u, '_blank', 'noopener'));
        idx += batch.length;
        btn.textContent = idx >= urls.length ? 'Done' : `Open next ` + urls.length + ` PDFs (${idx}/${urls.length})`;
    };
})();
// ==UserScript==
// @name         Freshdesk Quote Folder (Performance Optimized)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automatically folds quoted text in Freshdesk tickets with a toggle button. Throttled for CPU.
// @author       You
// @match        https://*.freshdesk.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=freshdesk.com
// @updateURL    https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/freshdesk-quote-folder.user.js
// @downloadURL  https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/freshdesk-quote-folder.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Inject CSS for our custom toggle button
    const style = document.createElement('style');
    style.textContent = `
        .fd-quote-toggle {
            display: block;
            padding: 4px 10px;
            margin: 8px 0;
            font-size: 12px;
            font-weight: 500;
            color: #2c5cc5;
            background-color: #ebeff8;
            border: 1px solid #d3dcf1;
            border-radius: 12px;
            cursor: pointer;
            user-select: none;
            font-family: inherit;
            transition: background-color 0.2s ease;
        }
        .fd-quote-toggle:hover {
            background-color: #d3dcf1;
        }
    `;
    document.head.appendChild(style);

    // 2. Main function to find and fold quotes
    function processQuotes() {
        const quotes = document.querySelectorAll('blockquote:not(.fd-processed), .gmail_quote:not(.fd-processed), .yahoo_quoted:not(.fd-processed)');

        if (quotes.length === 0) return; // Exit early if nothing to do

        quotes.forEach(quote => {
            quote.classList.add('fd-processed');
            quote.style.display = 'none';

            const btn = document.createElement('button');
            btn.className = 'fd-quote-toggle';
            btn.innerHTML = '&#10133; Show Quoted Text';
            btn.title = 'Click to expand or collapse quoted message';

            btn.addEventListener('click', function(e) {
                e.preventDefault(); 
                if (quote.style.display === 'none') {
                    quote.style.display = 'block';
                    btn.innerHTML = '&#10134; Hide Quoted Text';
                } else {
                    quote.style.display = 'none';
                    btn.innerHTML = '&#10133; Show Quoted Text';
                }
            });

            quote.parentNode.insertBefore(btn, quote);
        });
    }

    // 3. Run initially for page load
    processQuotes();

    // 4. MutationObserver with Throttling
    let throttleTimer = null;
    
    const observer = new MutationObserver((mutations) => {
        // Quick check to see if any nodes were actually added
        let nodesAdded = false;
        for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                nodesAdded = true;
                break;
            }
        }

        // If nodes were added AND we aren't currently waiting for a timer to finish
        if (nodesAdded && !throttleTimer) {
            
            // Start a 300ms timer. 
            // Any mutations that happen while this timer is ticking are ignored by the observer,
            // but they WILL be caught when processQuotes() finally runs at the end of the 300ms.
            throttleTimer = setTimeout(() => {
                processQuotes();
                throttleTimer = null; // Reset the timer so a new batch can start
            }, 300);
        }
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

})();
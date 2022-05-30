// ==UserScript==
// @name         GoToNextPage
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      0.4
// @description  A shortcut (ctrl+alt+n) for clicking the next-button of pagination. google.com and amazon.com are tested.
// @author       fujifruity
// @match        *://*/*
// @grant        none
// @license      MIT
// ==/UserScript==

{
    'use strict';

    // Keywords to filter buttons.
    const keywords = [
        'next', 'Next','NEXT', '>',
        '次', 'つぎ', '＞'
    ]
    window.addEventListener('keydown', event => {
        if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return
        if (event.key != 'n' || !event.altKey || !event.ctrlKey) return

        const queries = [
            '[class*="pagination"]',
            '[class*="Pagination"]',
            '[class*="pagenation"]',
            '[class*="Pagenation"]',
            '[class*="pager"]'].join(',')
        const paginations = [...document.querySelectorAll(queries)]
        console.log('paginations', paginations)

        const nextButtons = paginations.map(pg => {
            const descendants = [...pg.querySelectorAll('*')]
            return descendants.reverse().find(e =>
                // is visible
                e.offsetParent != null
                // and has any keyword somewhere
                && keywords.some(keyword => e.outerHTML?.includes(keyword))
            )
        }).filter(e => e) // filter undefined
        console.log('nextButtons', nextButtons)

        // Click them all.
        nextButtons.forEach(e => e.click())

        // If it did not work, click the first clickable descendant.
        nextButtons.forEach(e => {
            const isClickable = e => e.tagName == 'A' || e.getAttribute('onclick')
            const clickable = [...e.querySelectorAll('*')].find(isClickable)
            console.log('clickable', clickable)
            clickable.click()
        })
    })
}
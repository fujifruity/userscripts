// ==UserScript==
// @name         NoMouseGoogle
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      1.16
// @description  Shortcut for Google search results. j/k to move focus, enter/l/h to open in current/new/background tab, n/p to go to next/previous page.
// @author       fujifruity
// @include      https://www.google.com/search*
// @include      https://www.google.co.*/search*
// @grant        GM.openInTab
// @license      MIT
// @downloadURL none
// ==/UserScript==

{
    const tag = "noMouseGoogleCurrentItem"
    const itemQuery = "#res div[data-hveid][data-ved][lang], #botstuff div[data-hveid][data-ved][lang], #rso video-voyager>div"
    const findItems = () => [...document.querySelectorAll(itemQuery)]
        .filter(e => e.offsetParent != null /* is visible */)
    const findCurrentItem = items => items.find(e => e.hasAttribute(tag))
    const moveCursor = step => {
        const items = findItems()
        const currentItem = findCurrentItem(items)
        const r = currentItem.getBoundingClientRect();
        const inScreen = (0 < r.top && r.top < window.innerHeight
            || 0 < r.bottom && r.bottom < window.innerHeight)
        if (!inScreen) {
            const dist = e => {
                const r = e.getBoundingClientRect()
                return Math.abs(window.innerHeight - (r.top + r.bottom))
            }
            const nearestItem = items.reduce((acc, e) => dist(acc) < dist(e) ? acc : e)
            select(nearestItem, currentItem)
            return
        }
        const nextIdx = (items.indexOf(currentItem) + step + items.length) % items.length
        select(items[nextIdx], currentItem)
    }
    const highlight = e => {
        const isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        e.style.backgroundColor = isDarkTheme ? '#2a2a2a' : 'WhiteSmoke'
    }
    const select = (item, currentItem) => {
        // Deselect current item.
        if (currentItem) {
            currentItem.style.backgroundColor = null
            currentItem.removeAttribute(tag)
        }
        // Select the item.
        item.setAttribute(tag, '')
        highlight(item)
        item.scrollIntoView({ behavior: "smooth", block: "center" })
        console.log('select', item)
    }

    const currentItemHref = () => findCurrentItem(findItems()).querySelector('a').href
    const openInNewTab = inBackground => GM.openInTab(currentItemHref(), inBackground)
    const openInThisTab = () => window.open(currentItemHref(), "_self")

    // Select the first item without scrolling.
    const items = findItems()
    items[0].setAttribute(tag, '')
    highlight(items[0])

    window.addEventListener('keydown', event => {
        if (["INPUT", "TEXTAREA"].includes(event.target.tagName) || event.ctrlKey || event.altKey || event.metaKey) return
        if (event.key == 'j') moveCursor(+1)
        if (event.key == 'k') moveCursor(-1)
        if (event.key == 'l') openInNewTab(false)
        if (event.key == 'h') openInNewTab(true)
        if (event.key == 'Enter') openInThisTab()
        if (event.key == 'n') document.querySelector('#pnnext')?.click()
        if (event.key == 'p') document.querySelector('#pnprev')?.click()
    })

}
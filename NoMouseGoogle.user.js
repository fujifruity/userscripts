// ==UserScript==
// @name         NoMouseGoogle
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      1.11
// @description  Shortcut for Google search results. j/k to move focus, l/h to open in new/background tab, n/p to go to next/previous page.
// @author       fujifruity
// @include      https://www.google.com/search*
// @include      https://www.google.co.*/search*
// @grant        GM.openInTab
// @license      MIT
// ==/UserScript==

{
    const items = [...document.querySelectorAll('#rso div[data-hveid][data-ved][lang], #rso video-voyager>div')]
        .filter(e => e.offsetParent != null /* is visible */)
    const open = inBackground => {
        const url = findCurrentItem().querySelector('a').href
        GM.openInTab(url, inBackground)
    }
    const tag = "noMouseGoogleCurrentItem"
    const findCurrentItem = () => items.find(e => e.hasAttribute(tag))

    const moveCursor = step => {
        const currentItem = findCurrentItem()
        const r = currentItem.getBoundingClientRect();
        const inScreen = (0 < r.top && r.top < window.innerHeight
            || 0 < r.bottom && r.bottom < window.innerHeight)
        if (!inScreen) {
            const dist = e => {
                const r = e.getBoundingClientRect()
                return Math.abs(window.innerHeight - (r.top + r.bottom))
            }
            const nearestItem = items.reduce((acc, e) => dist(acc) < dist(e) ? acc : e)
            select(nearestItem)
            return
        }
        const nextIdx = (items.indexOf(currentItem) + step + items.length) % items.length
        select(items[nextIdx])
    }
    const highlight = e => {
        const isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        e.style.backgroundColor = isDarkTheme ? '#2a2a2a' : 'WhiteSmoke'
    }
    const select = item => {
        // Deselect current item.
        const currentItem = findCurrentItem()
        if (currentItem) {
            currentItem.style.backgroundColor = null
            currentItem.removeAttribute(tag)
        }
        // Select the item.
        item.setAttribute(tag, '')
        highlight(item)
        item.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    // Select the first item without scrolling.
    items[0].setAttribute(tag, '')
    highlight(items[0])

    window.addEventListener('keydown', event => {
        if (event.target.tagName == "INPUT" || event.ctrlKey || event.altKey) return
        if (event.key == 'j') moveCursor(+1)
        if (event.key == 'k') moveCursor(-1)
        if (event.key == 'l') open(false)
        if (event.key == 'h') open(true)
        if (event.key == 'n') document.querySelector('#pnnext')?.click()
        if (event.key == 'p') document.querySelector('#pnprev')?.click()
    })

}
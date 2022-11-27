// ==UserScript==
// @name         SimpleShortcuts
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      2.2
// @description  Lets you create single-key shortcuts to click buttons. Press ctrl+alt+s to open manager.
// @author       fujifruity
// @match        *://*/*
// @run-at       document-idle
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @grant        GM.deleteValues
// @license      MIT
// ==/UserScript==

(async () => {
    'use strict';

    const getShortcuts = async url => {
        const shortcuts = await GM.getValue(url) ?? '{}'
        return JSON.parse(shortcuts)
    }
    const elem = selector => document.querySelector(selector)
    const setShortcuts = async url => {
        const shortcuts = await getShortcuts(url)
        Object.keys(shortcuts).forEach(k => {
            window.addEventListener('keydown', event => {
                if (["INPUT", "TEXTAREA"].includes(event.target.tagName) ||
                    event.ctrlKey || event.altKey || event.metaKey || event.key != k) return
                // natural click
                const button = elem(shortcuts[k])
                button.focus()
                console.log('clicking', button);
                ["mousedown", "mouseup", "click"].forEach(eventType => {
                    const clickEvent = document.createEvent('MouseEvents');
                    clickEvent.initEvent(eventType, true, true);
                    button.dispatchEvent(clickEvent);
                })
            })
        })
    }
    // Find the longest matching url from GM cache
    let defaultUrl; {
        const urls = await GM.listValues()
        // // delete all
        // urls.forEach(url=>{
        //     console.log('delete url', url)
        //     GM.deleteValue(url)
        // })
        console.log('urls', urls)
        const foundUrl = urls.sort((a, b) => b.length - a.length).find(url => location.href.startsWith(url))
        defaultUrl = foundUrl ?? location.protocol + '//' + location.host + location.pathname
    }
    // Set shortcuts if exist
    setShortcuts(defaultUrl)

    const modalId = 'fujifruity-simpleshortcuts'
    const createModal = async () => {
        const modal = `
            <div id=${modalId} style="z-index:99999; width:auto; max-height:90%; position:fixed;
                padding:1em; margin:1em; border-radius: 8px; overflow-y:auto; cursor:pointer;
                box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; background-color:white" >
                <p><b>SimpleShortcuts</b></p>
                <label for=urlInput>URL</label><br>
                <input id=urlInput size=32><br><br>
                <input id=keyInput size=3 placeholder=key maxlength=20>
                <input id=valueInput size=16 placeholder="CSS selector">
                <input id=saveButton type=button value=Save>
                <div id=shortcutList></div>
            </div> `
        document.body.innerHTML = modal + document.body.innerHTML
        // Init url input
        elem('#urlInput').value = defaultUrl
        // Init key input
        const keyInput = elem('#keyInput')
        keyInput.addEventListener('keyup', event => {
            keyInput.value = event.key
            keyInput.size = event.key.length
        })
        // Init shortcut list
        const updateShortcutList = async () => {
            const shortcuts = await getShortcuts(elem('#urlInput').value)
            const lines = Object.keys(shortcuts).map(k => `<p>${k ? k : '" "'} → ${shortcuts[k]}</p>`).join('')
            elem('#shortcutList').innerHTML = lines
        }
        updateShortcutList()
        // Init save button
        elem('#saveButton').onclick = async () => {
            const key = elem('#keyInput').value
            const value = elem('#valueInput').value
            const url = elem('#urlInput').value
            const shortcuts = await getShortcuts(url)
            if (!key) return
            if (value) {
                shortcuts[key] = value
            } else {
                delete shortcuts[key]
            }
            await GM.setValue(url, JSON.stringify(shortcuts))
            updateShortcutList()
            setShortcuts(url)
        }
        return elem('#' + modalId)
    }

    window.addEventListener('keydown', async event => {
        if (!event.altKey && !event.metaKey || !event.ctrlKey || event.key != 's') return
        // Show modal
        const modal = elem('#' + modalId) ?? await createModal()
        modal.style.display = 'block'
        modal.focus()
        // Set event listeners to close modal
        const closeModal = modal => { modal.style.display = 'none' }
        const onKeydown = event => {
            if (event.target.tagName == "INPUT" || event.key != 'Escape') return
            closeModal(modal)
            window.removeEventListener('keydown', onKeydown)
        }
        const onClick = event => {
            if (modal.contains(event.target)) return
            closeModal(modal)
            window.removeEventListener('click', onClick)
        }
        window.addEventListener('keydown', onKeydown)
        window.addEventListener('click', onClick)
    })
})()
// ==UserScript==
// @name         SimpleShortcuts
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      1.0
// @description  Simple (single-key) keyboard shortcuts for arbitrary sites.
// @author       fujifruity
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

{
    'use strict';

    class Keybind {
        constructor(key, onKeydown) {
            this.key = key;
            this.onKeydown = onKeydown;
        }
    }

    // A keybind bound to a clickable element to be clicked
    class Shortcut extends Keybind {
        constructor(key, selector) {
            super(key, () => document.querySelector(selector).click())
            this.selector = selector;
        }
        // Append '(key)' to the innerText of the clickable element as a reminder
        remind() {
            const clickable = document.querySelector(this.selector)
            clickable.innerText = clickable.innerText + "(" + this.key + ")"
        }
    }

    const registerKeybinds = (urlHead, keybinds) => {
        if (!location.href.startsWith(urlHead)) return
        console.log('modify button texts')
        keybinds.filter(k => k instanceof Shortcut).forEach(s => s.remind())
        console.log('register keybinds')
        window.addEventListener('keydown', event => {
            const isInput = ["INPUT", "TEXTAREA"].includes(event.target.tagName)
            if (isInput) return
            const keybind = keybinds.find(k => k.key == event.key)
            if (!keybind) return
            keybind.onKeydown()
            event.preventDefault()
            console.log(event)
        })
    }

    // Examples
    registerKeybinds(
        "https://www.amazon.",
        [
            // Pressing '/' gives focus to the search box
            new Keybind('/', () => document.getElementById('twotabsearchtextbox').focus()),
            // Pressing 'n' clicks the 'next' button
            new Shortcut('n', 'li.a-last > a:nth-child(1)')
        ]
    )
    registerKeybinds(
        "https://www.google.",
        // Pressing 'n' clicks the 'next' button
        [ new Shortcut('n', '#pnnext > span:nth-child(2)') ]
    )

}
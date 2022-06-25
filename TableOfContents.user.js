// ==UserScript==
// @name         TableOfContents
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      1.2
// @description  Create a table of contents for the page. ctrl+alt+t to show; click an item to jump; escape or click outside to close.
// @author       fujifruity
// @match        *://*/*
// @grant        none
// ==/UserScript==

{
    const modalId = 'fujifruity-toc'
    const getModal = () => document.getElementById(modalId) ?? createModal()
    const createModal = () => {
        const modal = document.createElement('div')
        modal.id = modalId
        modal.style.zIndex = 99999
        modal.style.width = 'auto'
        modal.style.maxHeight = '90%'
        modal.style.position = 'fixed'
        modal.style.padding = '1em'
        modal.style.margin = '1em'
        modal.style.overflowY = 'auto'
        const color = window.getComputedStyle(document.body, null).backgroundColor
        const isRgba = color.match(/,/g).length == 3
        const rgb = isRgba ? color.replace(/, \d+\)/, ')') : color
        modal.style.backgroundColor = rgb
        modal.style.cursor = 'pointer'
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.16)'
        document.body.prepend(modal)
        // Add headdings to the modal
        const headdings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
        const clonedHeaddings = headdings.map(e => e.cloneNode(true))
        const clickableHeaddings = clonedHeaddings.map((e, i) => {
            e.addEventListener('click', event => headdings[i].scrollIntoView({ behavior: "smooth" }))
            return e
        })
        clickableHeaddings.forEach(e => modal.appendChild(e))
        return modal
    }
    const closeModal = () => {
        const modal = getModal()
        modal.style.display = 'none'
    }
    window.addEventListener('keydown', event => {
        if (!event.ctrlKey || !event.altKey || event.key != 't') return
        const modal = getModal()
        modal.style.display = 'block'
        // Set shortcut to close modal
        const onKeydown = event => {
            if (event.key != 'Escape') return
            closeModal()
            window.removeEventListener('keydown', onKeydown)
        }
        const onClick = event => {
            closeModal()
            window.removeEventListener('click', onClick)
        }
        window.addEventListener('keydown', onKeydown)
        window.addEventListener('click', onClick)
    })
}
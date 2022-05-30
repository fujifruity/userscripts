// ==UserScript==
// @name         TableOfContents
// @namespace    com.gmail.fujifruity.greasemonkey
// @version      1.1
// @description  Create a table of contents from h-tags. ctrl+alt+t to show; escape or click outside to close.
// @author       fujifruity
// @match        *://*/*
// @grant        none
// ==/UserScript==

{
    const log = (...msg) => console.log('TableOfContents', ...msg)

    const modalId = 'fujifruity-toc'

    const getModal = () => document.getElementById(modalId) ?? createModal()

    const createModal = () => {
        log('create toc')
        const modal = document.createElement('div')
        modal.id = modalId
        modal.style.zIndex = 99999
        modal.style.width = 'auto'
        modal.style.maxHeight = '90%'
        modal.style.position = 'fixed'
        modal.style.padding = '1em'
        modal.style.margin = '1em'
        modal.style.overflowY = 'auto'
        modal.style.backgroundColor = 'white'
        modal.style.cursor = 'pointer'
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.16)'
        document.body.prepend(modal)
        // Add headdings to the modal
        const headdings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
        const clonedHeaddings = headdings.map(e => e.cloneNode(true))
        const clickableHeaddings = clonedHeaddings.map( (e, i) => {
            e.addEventListener('click', event => headdings[i].scrollIntoView() )
            return e
        })
        clickableHeaddings.forEach(e => modal.appendChild(e))
        return modal
    }

    const closeModal = () => {
        log('close toc')
        const modal = getModal()
        modal.style.display = 'none'
    }

    log('set shortcuts')
    window.addEventListener('keydown', event => {
        if (!event.ctrlKey || !event.altKey || event.key != 't') return
        log('show toc')
        const modal = getModal()
        modal.style.display = 'block'
        // set shortcut closes modal
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
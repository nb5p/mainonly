// ==UserScript==
// @name        mainonly
// @namespace   Violentmonkey Scripts
// @match       *://**/*
// @grant       none
// @version     0.1
// @author      jerrylususu (https://github.com/jerrylususu)
// @author      nb5p (https://github.com/nb5p)
// @grant       GM.registerMenuCommand
// @description A JavaScript bookmarklet designed to isolate and highlight a specific element on a webpage, effectively hiding all other elements.
// ==/UserScript==

// A JavaScript bookmarklet designed to isolate and highlight a specific element on a webpage, effectively hiding all other elements.

function HandleClick() { (function () {
    var selectedElement = document.body; // just in case no element is selected

    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = ".mainonly { outline: 2px solid red; }";
    const supportsHas = CSS.supports('selector(:has(*))');

    /** @param {*} element */
    function outlineElement(element) {
        if (element instanceof HTMLElement) { // Ignores non-HTMLElements
            selectedElement.classList.remove("mainonly");
            selectedElement = element;
            selectedElement.classList.add("mainonly");
        }
    }

    /** @param {MouseEvent} event */
    function onMouseOver(event) {
        outlineElement(event.target);
    }


    /** @param {MouseEvent} event */
    function onClick(event) {
        event.preventDefault();
        if (supportsHas) { // If using :has() selector
            style.textContent = ":not(:has(.mainonly), .mainonly, .mainonly *) { display: none; }";
        } else { // In case :has() selector is not supported:
            style.textContent = ":not(.mainonly *, .mainonly-ancestor) { display: none; }";
            var /** @type {HTMLElement | null} */ curr = selectedElement;
            do { curr.classList.add("mainonly-ancestor"); } while (curr = curr.parentElement);
        }
        cleanupEventListeners();
    }

    /** @param {KeyboardEvent} event */
    function onKeydown(event) {
        if (event.key === "Escape") {
            style.remove();
            document.removeEventListener("keydown", onKeydown);
            cleanupEventListeners();
            selectedElement?.classList.remove("mainonly");
            if (!supportsHas) { // In case :has() selector is not supported:
                for (const element of document.getElementsByClassName("mainonly-ancestor")) {
                    element.classList.remove("mainonly-ancestor");
                }
            }
        }
    }

    /** @param {WheelEvent} event */
    function onWheel(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            // Scrolling up, select parent element
            outlineElement(selectedElement.parentElement);
        } else {
            // Scrolling down, select first child element
            outlineElement(selectedElement.firstElementChild);
        }
    }

    function cleanupEventListeners() {
        document.removeEventListener("mouseover", onMouseOver);
        document.removeEventListener("click", onClick);
        document.removeEventListener("wheel", onWheel);
    }

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("click", onClick);
    document.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKeydown);
})();}

GM.registerMenuCommand("Inject mainonly", HandleClick);

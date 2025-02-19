import "./components/simple-greeting.js";

window.addEventListener("DOMContentLoaded", () => {
    console.log("[DEBUG] DOM loaded");
    const hud = document.querySelector(".hud");
    window.currentActiveHUD = null;

    function loadHUD(name) {
        if (window.currentActiveHUD === name) {
            return;
        }
        const elementName = `#${name}`;
    
        const template = document.querySelector(elementName);
        if (!template) {
            throw new Error(`[ERROR] Unable to found HTML Template with name '${elementName}'`);
        }

        const clone = document.importNode(template.content, true);
        hud.innerHTML = "";
        hud.appendChild(clone);
        window.currentActiveHUD = name;

        console.log(`[DEBUG] hud '${elementName}' loaded!`)
    }
    window.loadHUD = loadHUD;
});


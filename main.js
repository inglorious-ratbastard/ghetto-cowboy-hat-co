const texts = ["Custom Designs", "Handmade Hats", "Unique Styles", "Western Elegance"];
let index = 0;
const bannerText = document.getElementById("banner-text");

setInterval(() => {
    index = (index + 1) % texts.length;
    bannerText.classList.remove("fade-in"); // Reset animation
    void bannerText.offsetWidth; // Trigger reflow to restart animation
    bannerText.textContent = texts[index];
    bannerText.classList.add("fade-in"); // Apply animation again
}, 10000);


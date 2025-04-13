const texts = ["Custom Designs", "Handmade Hats", "Unique Styles", "Western Elegance"];
let index = 0;
const bannerText = document.getElementById("banner-text");

setInterval(() => {
    index = (index + 1) % texts.length;
    bannerText.classList.remove("fade-in"); 
    void bannerText.offsetWidth; 
    bannerText.textContent = texts[index];
    bannerText.classList.add("fade-in"); 
}, 10000);

setTimeout(()=>{
  history.replaceState('', document.title, window.location.origin + window.location.pathname + window.location.search);
}, 5);

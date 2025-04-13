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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      e.preventDefault();

      // Scroll to the element smoothly
      target.scrollIntoView({ behavior: 'smooth' });

      // Remove the hash from the URL without reloading the page
      history.replaceState(null, null, ' ');
    }
  });
});

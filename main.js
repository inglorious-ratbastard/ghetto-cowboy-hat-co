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



document.querySelectorAll('.block').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Optional: update the URL without the hash
        history.replaceState(null, null, ' ');
      }
    });
  })

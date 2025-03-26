(function horizontalScrollingBanner() {
  const banners = document.querySelectorAll('.horizontal-scrolling-banner');
  if (!banners.length) return;

  const pxPerSecond = 50; 
  const delayBeforeRestart = 5000; 

  function setUpElements() {
      banners.forEach(banner => {
          const wrapper = document.createElement('div');
          wrapper.classList.add('scrolling-wrapper');
          const children = [...banner.children];

          banner.innerHTML = '';
          banner.appendChild(wrapper);

          let totalWidth = 0;
          while (totalWidth < window.innerWidth * 2) {
              children.forEach(child => {
                  const clone = child.cloneNode(true);
                  wrapper.appendChild(clone);
                  totalWidth += clone.offsetWidth;
              });
          }

          wrapper.style.width = `${totalWidth}px`;
      });
  }

  function animate() {
      banners.forEach(banner => {
          const wrapper = banner.querySelector('.scrolling-wrapper');
          if (!wrapper) return;

          let start = performance.now();

          function step(timestamp) {
              const elapsed = timestamp - start;
              const moveX = (elapsed / 1000) * pxPerSecond;
              wrapper.style.transform = `translateX(${-moveX}px)`;

              if (-moveX <= -wrapper.offsetWidth / 2) {
                  setTimeout(() => {
                      start = performance.now();
                      wrapper.style.transform = 'translateX(0)';
                      requestAnimationFrame(step);
                  }, delayBeforeRestart);
              } else {
                  requestAnimationFrame(step);
              }
          }

          requestAnimationFrame(step);
      });
  }

  setUpElements();
  animate();
  window.addEventListener('resize', setUpElements);
})();


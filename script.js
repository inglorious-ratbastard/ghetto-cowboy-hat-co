window.builderOrderData = {};

(function() {
  const originalAddEvent = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'touchmove') {
      const wrapped = function(e) {
        if (!e.cancelable) {
          return;
        }
        return listener.call(this, e);
      };
      return originalAddEvent.call(this, type, wrapped, options);
    }
    return originalAddEvent.call(this, type, listener, options);
  };
})();

$(document).foundation();

$(document).on('open.zf.reveal', '.reveal', function() {
  $('body').css('overflow', 'hidden');
});

$(document).on('closed.zf.reveal', '.reveal', function(event) {
  $('body').css('overflow', '');
  if ($(event.target).attr('id') === 'builderModal') {
    setTimeout(() => {
      const shopTop = $('#shop').offset().top;
      window.scrollTo({ top: shopTop, behavior: 'smooth' });
    }, 50);
  }
}); 

$(document).on('close.zf.offCanvas', '#offCanvasBottom', function () { 
    document.activeElement.blur();
});

$(document).foundation();
$('.off-canvas a').on('click', function (e) {
  const href = $(this).attr('href') || '';
  const isAnchor = href.startsWith('#') && href.length > 1; 
  const $target = isAnchor ? $(href) : $();
  const closeDuration = 400; 
  const scrollDuration = 100; 

  $('.off-canvas').addClass('is-closing');
  $('.off-canvas').foundation('close');

  if (isAnchor && $target.length) {
    e.preventDefault();
    setTimeout(() => {
      $('html, body').animate(
        { scrollTop: $target.offset().top },
        scrollDuration,
        'swing'
      );
    }, closeDuration);
  }
});

$(document).on('closed.zf.offcanvas', '#offCanvasBottom', function () {
  $(this).removeClass('is-closing');
});

window.showTooltip = function(targetSelector, message, opts = {}) {
  const duration = opts.duration ?? 1500;
  const offsetY = opts.offsetY ?? 10;

  const $target = document.querySelector(targetSelector);
  if (!$target) return;

  const prev = document.getElementById('dynamic-tooltip');
  if (prev) prev.remove();

  const tooltip = document.createElement('div');
  tooltip.id = 'dynamic-tooltip';
  tooltip.className = 'dynamic-tooltip';
  tooltip.setAttribute('role', 'status');
  tooltip.style.position = 'absolute';
  tooltip.style.zIndex = 9999;
  tooltip.style.padding = '6px 10px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.background = 'rgba(0,0,0,0.85)';
  tooltip.style.color = '#fff';
  tooltip.style.fontSize = '13px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.opacity = '0';
  tooltip.style.transition = 'opacity .18s ease, transform .18s ease';
  tooltip.textContent = message;

  document.body.appendChild(tooltip);

  const rect = $target.getBoundingClientRect();
  const ttRect = tooltip.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const left = rect.left + (rect.width / 2) - (ttRect.width / 2);
  const top = rect.top + scrollTop - ttRect.height - offsetY;

  tooltip.style.left = `${Math.max(8, left)}px`;
  tooltip.style.top = `${Math.max(8, top)}px`;
  tooltip.style.transform = 'translateY(6px)';

  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  });
    
  setTimeout(() => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(6px)';
    setTimeout(() => tooltip.remove(), 220);
  }, duration);
};

$(document).ready(function() { 
  function showTooltip(targetSelector, message) {
    const $target = $(targetSelector);
    if ($target.length === 0) return;

    $('#dynamic-tooltip').remove();

    const tooltip = $(`
      <span id="dynamic-tooltip"
            class="tooltip top"
            role="tooltip"
            style="position:absolute; z-index:9999;"
            data-yeti-box="dynamic-tooltip"
            data-toggle="dynamic-tooltip">
        ${message}
      </span>
    `);

    $('body').append(tooltip);

    const offset = $target.offset();
    tooltip.css({
      top: offset.top - tooltip.outerHeight() - 10,
      left: offset.left + ($target.outerWidth() / 2) - (tooltip.outerWidth() / 2)
    });

    tooltip.fadeIn(200);
    setTimeout(() => {
      tooltip.fadeOut(300, () => tooltip.remove());
    }, 1500);
  }

  $('a:contains("Review Purchase")').on('click', function(e) {
    e.preventDefault();

    const cartCount = parseInt($('.cart__count').text() || '0', 10);
    if (cartCount === 0) {
      showTooltip('.cart', 'Your cart is empty — add an item before continuing!');
      return; 
    }

    if ($('#review-page').length === 0) {
      const reviewPage = `
        <section id="review-page" style="display:none; min-height:100vh; padding:3rem;">
          <button class="button warning" id="downloadPDF">Download PDF</button> 
          <div class="grid-container text-center">
            <h2>Review Your Purchase</h2>
            <p>Here’s a summary of your selected items.</p>

            <div id="order-summary" class="callout secondary text-left" style="max-width:500px; margin:2rem auto;">
              <p><strong>Hat:</strong> Custom Ghetto Cowboy Hat</p>
              <p><strong>Quantity:</strong> <span id="summary-qty">0</span></p>
              <p><strong>Total:</strong> $<span id="summary-total">0.00</span></p>
            </div>

            <a href="#shop" class="button hollow alert" id="backToShop">← Back to Shop</a>
            <button class="button hollow success" id="confirmPurchase">Confirm Purchase</button>
          </div>
        </section>
      `;
      $('#gchc-main').append(reviewPage);
    } 

    const summaryBox = document.getElementById("order-summary");
    const invoiceNumber = "10000" + Math.floor(100000 + Math.random() * 900000);

    summaryBox.innerHTML = `
      <p id="invoice-number">Invoice #${invoiceNumber}</p>
      <p><strong>Hat:</strong> Custom Ghetto Cowboy Hat</p>
      <p><strong>Quantity:</strong> <span id="summary-qty">0</span></p>
      <p><strong>Total:</strong><span id="summary-total">0.00</span></p>
      <hr>
      <h5>Order Details</h5>
    `; 

    Object.entries(window.builderOrderData).forEach(([key, value]) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${key}:</strong> ${value}`;
      summaryBox.appendChild(p);
    });

    const qty = $('.add-quantity__value').val() || 0;
    const pricePerHat = 29.99;
    const total = (qty * pricePerHat).toFixed(2);
    $('#summary-qty').text(qty);
    $('#summary-total').text(total);
    $('#review-page').fadeIn(400);
  });

  $(document).on('click', '#backToShop', function(e) {
    e.preventDefault();
    $('#review-page').hide();
    $('#gchc-main > section').not('#review-page').fadeIn(400);
    window.location.hash = '#shop';

    setTimeout(() => {
      const shopTop = $('#shop').offset().top;
      window.scrollTo({ top: shopTop, behavior: 'smooth' });
    }, 50);
  });

  $(document).on('click', '#confirmPurchase', function() {
    const invoiceNumber = window.invoiceNumber || Math.floor(Math.random() * 900000 + 100000);
    const qty = window.builderOrderData?.Quantity || 1;
    const total = window.builderOrderData?.Total || "0.00";

    let emailBody = `Order Confirmation\n`;
    emailBody += `Invoice #: ${invoiceNumber}\n`;
    emailBody += `Hat: Custom Ghetto Cowboy Hat\n`;
    emailBody += `Quantity: ${qty}\n`;
    emailBody += `Total: $${total}\n\n`;
    emailBody += `--- Order Details ---\n`;

    Object.entries(window.builderOrderData || {}).forEach(([key, value]) => {
        emailBody += `${key}: ${value}\n`;
    });

    const mailtoLink =
        `mailto:ghettocowboyhatsco@gmail.com` +
        `?subject=` + encodeURIComponent(`Order Confirmation - Invoice ${invoiceNumber}`) +
        `&body=` + encodeURIComponent(emailBody);
    
    window.open(mailtoLink);  
    
    $('#builderModal').find('input[type="text"], input[type="email"], input[type="tel"], textarea').val('');
    $('#builderModal').find('input[type="checkbox"]').prop('checked', false);
    
    $('.triggerSet').each(function () {
        const input = this;
        input.value = '';
        input.style.backgroundColor = '';
        input.style.color = '';
        const sp = Spectrum.getInstance('#' + input.id);
        if (sp) {  
            sp.destroy();
            sp.hide();     
            sp.rebuild();
        }
        input.dataset.hex = '';
    });
    
    window.builderOrderData = {};
    
    $('#review-page').hide();
    $('#gchc-main > section').not('#review-page').fadeIn(400);
    window.location.hash = '#shop';
    window.resetCart();

    setTimeout(() => {
      const shopTop = $('#shop').offset().top;
      window.scrollTo({ top: shopTop, behavior: 'smooth' });
    }, 50);
  });

});

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

document.addEventListener('DOMContentLoaded', () => {
  const addQuantityAll = document.querySelectorAll('.add-quantity');
  const cart = document.querySelector('.cart');
  const cartCount = cart?.querySelector('.cart__count');
  let globalCounter = 0; 
  const MAX_COUNT = 5; 

  function changeCart() {
    cartCount.textContent = `${globalCounter}`;
    cart?.classList.add('is-animated');
    setTimeout(() => {
      cart?.classList.remove('is-animated');
    }, 600);
  }

  function resetCart() {
    globalCounter = 0;
    $('.add-quantity__value').val(0); 
    $('.cart__count').text('0');
  }
  window.resetCart = resetCart;

  addQuantityAll?.forEach(quantity => {
    const addButtonAll = quantity.querySelectorAll('[data-add-button]');
    const deleteButton = quantity.querySelector('[data-delete-button]');
    const valueInput = quantity.querySelector('.add-quantity__value');
    const minusButton = quantity.querySelector('.add-quantity__minus-button');

    addButtonAll.forEach(button => {
      button.addEventListener('click', () => {
        if (globalCounter >= MAX_COUNT) {  
          showTooltip('.cart', `Cart limit reached (max ${MAX_COUNT} items)`);
          return; 
        }

        quantity.classList.add('is-active');
        valueInput.stepUp();
        globalCounter = Math.min(globalCounter + 1, MAX_COUNT);
        changeCart();

        if (parseInt(valueInput.value) > 1) {
          deleteButton.style.display = 'none';
          minusButton.style.display = 'flex';
        } else {
          deleteButton.style.display = 'flex';
          minusButton.style.display = 'none';
        }
      });
    });

    deleteButton?.addEventListener('click', () => { 
      quantity.classList.remove('is-active');
      valueInput.value = 0;
      deleteButton.style.display = 'flex';
      minusButton.style.display = 'none';
      globalCounter = Math.max(0, globalCounter - 1);
      changeCart();
    });

    minusButton?.addEventListener('click', () => {
      valueInput.stepDown();
      globalCounter = Math.max(0, globalCounter - 1);
      changeCart();

      if (parseInt(valueInput.value) > 1) {
        deleteButton.style.display = 'none';
        minusButton.style.display = 'flex';
      } else {
        deleteButton.style.display = 'flex';
        minusButton.style.display = 'none';
      }
    });
  });
});

  document.addEventListener('DOMContentLoaded', function () { 
    const feedbackName = document.getElementById('feedbackName');
    const feedbackEmail = document.getElementById('feedbackEmail');
    const feedbackSubmit = document.getElementById('submitBtn');

    const builderModal = document.getElementById('builderModal');
    const builderName = document.getElementById('fullNameInput');
    const builderEmail = document.getElementById('emailInput');
    const builderCheckbox = document.getElementById('orderCheckbox');
    const builderSubmit = document.getElementById('builderSubmitBtn');

    function setDisabled(btn, state) {
      if (!btn) return;
      btn.disabled = !!state;
      btn.style.pointerEvents = state ? 'none' : '';
      btn.setAttribute('aria-disabled', state ? 'true' : 'false');
    }

    function validateFeedbackModal() {
      if (!feedbackSubmit) return;
      const nameFilled = feedbackName && feedbackName.value.trim() !== '';
      const emailValid = feedbackEmail && feedbackEmail.value.trim() !== '' && feedbackEmail.checkValidity();
      setDisabled(feedbackSubmit, !(nameFilled && emailValid));
    }
    if (feedbackName) feedbackName.addEventListener('input', validateFeedbackModal);
    if (feedbackEmail) feedbackEmail.addEventListener('input', validateFeedbackModal);
    validateFeedbackModal();

    function validateBuilderModal() {
      if (!builderSubmit) return;
      const nameFilled = builderName && builderName.value.trim() !== '';
      const emailValid = builderEmail && builderEmail.value.trim() !== '' && builderEmail.checkValidity();
      const checkboxChecked = builderCheckbox && builderCheckbox.checked;
      const ok = nameFilled && emailValid && checkboxChecked;
      setDisabled(builderSubmit, !ok);
      return ok;
    }

    if (builderName) builderName.addEventListener('input', validateBuilderModal);
    if (builderEmail) builderEmail.addEventListener('input', validateBuilderModal);
    if (builderCheckbox) builderCheckbox.addEventListener('change', validateBuilderModal);

    if (typeof jQuery !== 'undefined' && builderModal) {
      jQuery(document).on('open.zf.reveal', '#builderModal', function () {
        validateBuilderModal();
      });
    }
    
    if (builderSubmit) {
      builderSubmit.addEventListener("click", function (e) {
        const ok = validateBuilderModal();
        if (!ok) {
            e.preventDefault();
            return;
        }
        
        const data = {}; 
        function saveField(key, value) {
            if (value && value.toString().trim() !== "") {
                data[key] = value;
            }
        }

        saveField("Brim Color", document.getElementById("triggerSetBrim").value);
        saveField("Front Color", document.getElementById("triggerSetFront").value);
        saveField("Side Color", document.getElementById("triggerSetSide").value);
        saveField("Back Color", document.getElementById("triggerSetBack").value);

        saveField("Full Name", document.getElementById("fullNameInput").value);
        saveField("Shipping Address", document.getElementById("shippingInput").value);
        saveField("Email", document.getElementById("emailInput").value);
        saveField("Phone Number", document.getElementById("phoneNumberInput").value);
        saveField("Feedback", document.getElementById("orderFormText").value);

        if (document.getElementById("bulkcheckbox").checked) {
            saveField("Bulk Order", "Yes");
            saveField("Number of Hats", document.getElementById("bulkNumber").value);
        }

        window.builderOrderData = data;
        jQuery('#builderModal').foundation('close');
      });
    }

    validateBuilderModal();
  });

document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.triggerSet');

  function readableTextColor(hex) {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  }

  function applyColor(input, hexColor) {
      const colorName = getClosestColorName(hexColor);
      input.dataset.hex = hexColor;  
      input.value = colorName;
      input.style.backgroundColor = hexColor;
      input.style.color = readableTextColor(hexColor);
      input.style.setProperty('--placeholder-color', input.style.color);
  }


  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  const cssColors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  };

  function getClosestColorName(hex) {
    const rgb = hexToRgb(hex);
    let closestName = null;
    let minDistance = Infinity;

    for (const [name, colorHex] of Object.entries(cssColors)) {
      const c = hexToRgb(colorHex);
      const distance = Math.sqrt(
        Math.pow(rgb.r - c.r, 2) +
        Math.pow(rgb.g - c.g, 2) +
        Math.pow(rgb.b - c.b, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestName = name;
      }
    }

    return closestName || hex; 
  }

  inputs.forEach(input => {
    let spInstance = null;
    let initialized = false;

    function ensureSpectrum() {
      if (initialized) return;
      spInstance = Spectrum.getInstance(`#${input.id}`);
      if (!spInstance) {
        console.error(`Spectrum instance not found for ${input.id}`);
        return;
      }

      if (typeof spInstance.hide === 'function') spInstance.hide();

      setTimeout(() => {
        const spInputs = spInstance.container
          ? spInstance.container.querySelectorAll(".sp-input")
          : document.querySelectorAll(".sp-input"); 

        spInputs.forEach((el, index) => {
          const idBase = `${input.id}_sp_${index + 1}`;
          if (!el.id) el.id = idBase;
          if (!el.name) el.name = idBase;
        });
      }, 50);

      input.addEventListener('input', () => {
        const val = input.value.trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) applyColor(input, val);
      });

      input.addEventListener('change', () => {
        const val = input.value.trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) applyColor(input, val);
      });

      spInstance.on('move change dragstop', (color) => {
          if (!color) return; 
          let hex = color.toHexString?.() || String(color);
          if (/^#([0-9a-f]{3})$/i.test(hex)) {
              hex = '#' + hex.substring(1).split('').map(ch => ch + ch).join('');
          }

          applyColor(input, hex);
      });

      initialized = true;
    }

    input.addEventListener('focus', () => {
      ensureSpectrum();
      if (spInstance?.show) spInstance.show();
    });

    input.addEventListener('click', () => {
      ensureSpectrum();
      if (spInstance?.show) spInstance.show();
    });
  });
});

$(document).on("click", "#downloadPDF", async function () {
    const reviewPage = document.querySelector("#review-page");
    const orderSummary = document.querySelector("#order-summary");

    if (!reviewPage) return alert("Review page is not available.");

    const invoiceEl = document.querySelector("#invoice-number");
    let invoiceNumber = "Invoice";
    if (invoiceEl) {
        invoiceNumber = invoiceEl.textContent.replace(/[^0-9]/g, "") || "Invoice";
    }

    const tempWrapper = document.createElement("div");
    tempWrapper.id = "pdf-wrapper";
    tempWrapper.style.padding = "20px";
    tempWrapper.style.background = "#fff";

    const reviewClone = reviewPage.cloneNode(true);
    const summaryClone = orderSummary ? orderSummary.cloneNode(true) : null;

    tempWrapper.appendChild(reviewClone);
    if (summaryClone) tempWrapper.appendChild(summaryClone);

    tempWrapper.style.position = "fixed";
    tempWrapper.style.left = "-9999px";
    document.body.appendChild(tempWrapper);

    await new Promise(r => requestAnimationFrame(r));
    const canvas = await html2canvas(tempWrapper, {
        scale: 2,
        useCORS: true,
        logging: false
    });

    const imgData = canvas.toDataURL("image/png");
    const pxPerMm = canvas.width / 210; 
    const pdfHeight = canvas.height / pxPerMm; 
    const pdf = new jspdf.jsPDF("p", "mm", [210, pdfHeight]);
    pdf.addImage(imgData, "PNG", 0, 0, 210, pdfHeight);
    pdf.save(`Invoice_${invoiceNumber}.pdf`);

    tempWrapper.remove();
});

function setupSlider(id) {
  const slider = document.querySelector(`#${id}`);
  const slides = slider.querySelector(".slides");
  const slideCount = slider.querySelectorAll(".slide").length;
  let currentIndex = 0;
  let interval;
  let startX = 0;
  let endX = 0;

  function updateSlidePosition() {
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function updateDots() {
    slider.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
      const progress = dot.querySelector(".progress");
      if (index === currentIndex) {
        progress.style.animation = "progress 5s linear";
        dot.style.pointerEvents = "none"; 
      } else {
        progress.style.animation = "none";
        progress.style.width = "0"; 
        dot.style.pointerEvents = "auto"; 
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlidePosition();
    updateDots();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlidePosition();
    updateDots();
  }

  slider.querySelector(".next").addEventListener("click", () => {
    nextSlide();
    resetInterval();
  });

  slider.querySelector(".prev").addEventListener("click", () => {
    prevSlide();
    resetInterval();
  });

  slider.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (index !== currentIndex) {
        currentIndex = index;
        updateSlidePosition();
        updateDots();
        resetInterval();
      }
    });
  });

  slides.addEventListener("touchstart", touchStart);
  slides.addEventListener("touchend", touchEnd);

  function touchStart(event) {
    startX = event.touches[0].clientX;
  }

  function touchEnd(event) {
    endX = event.changedTouches[0].clientX;
    handleSwipe();
  }

  function handleSwipe() {
    if (endX - startX > 50) {
      prevSlide();
    } else if (startX - endX > 50) {
      nextSlide();
    }
    resetInterval();
  }

  function startInterval() {
    interval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function resetInterval() {
    clearInterval(interval);
    startInterval();
  }

  startInterval();
  updateSlidePosition();
  updateDots();
}

setupSlider("slider1");

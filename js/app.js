(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");
  burger.addEventListener("click", function(){
    var open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  menu.addEventListener("click", function(e){
    if (e.target.tagName === "A") { menu.classList.remove("open"); burger.setAttribute("aria-expanded","false"); }
  });

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14 });
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  }

  document.querySelectorAll(".faq-item").forEach(function(item){
    item.querySelector(".faq-q").addEventListener("click", function(){
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function(i){ i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  var toggle = document.getElementById("billing-toggle");
  if (toggle) {
    toggle.querySelectorAll("button").forEach(function(btn){
      btn.addEventListener("click", function(){
        toggle.querySelectorAll("button").forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        var mode = btn.getAttribute("data-billing");
        document.querySelectorAll(".plan-price").forEach(function(el){
          el.childNodes[0].textContent = el.getAttribute("data-"+mode) + " ";
        });
        document.querySelectorAll(".plan-old").forEach(function(el){
          var v = el.getAttribute("data-"+mode);
          el.textContent = v ? "было " + v + " / мес" : "";
          el.style.display = v ? "block" : "none";
        });
      });
    });
  }

  var phone = document.getElementById("phone");
  function formatPhone(v){
    var d = v.replace(/\D/g,"");
    if (d.charAt(0)==="8") d="7"+d.slice(1);
    if (d.charAt(0)!=="7" && d.length) d="7"+d;
    d=d.slice(0,11);
    var p="+7";
    if(d.length>1) p+=" ("+d.slice(1,4);
    if(d.length>=5) p+=") "+d.slice(4,7);
    if(d.length>=8) p+=" - "+d.slice(7,9);
    if(d.length>=10) p+="-"+d.slice(9,11);
    return d.length? p : "";
  }
  phone.addEventListener("input", function(){ phone.value = formatPhone(phone.value); });
  phone.addEventListener("focus", function(){ if(!phone.value) phone.value="+7 ("; });

  var schedTabs = document.querySelectorAll(".schedule-tabs [data-filter]");
  var rows = document.querySelectorAll("#schedule-table .td");
  schedTabs.forEach(function(tab){
    tab.addEventListener("click", function(){
      schedTabs.forEach(function(t){ t.classList.remove("active"); t.setAttribute("aria-selected","false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected","true");
      var f = tab.getAttribute("data-filter");
      rows.forEach(function(r){
        r.style.display = (f === "all" || r.getAttribute("data-slot") === f) ? "" : "none";
      });
    });
  });

  var videoModal = document.getElementById("video-modal");
  var openVideoBtn = document.getElementById("open-video");
  function openModal(m){ m.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(m){ m.hidden = true; document.body.style.overflow = ""; }
  if (openVideoBtn) {
    openVideoBtn.addEventListener("click", function(){
      openModal(videoModal);
    });
    videoModal.addEventListener("click", function(e){
      if (e.target.hasAttribute("data-close") || e.target.closest("[data-close]")) {
        closeModal(videoModal);
        var v = videoModal.querySelector("video");
        if (v) v.pause();
      }
    });
  }

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  document.querySelectorAll(".gallery-grid img").forEach(function(img){
    img.addEventListener("click", function(){
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      openModal(lightbox);
    });
  });
  lightbox.addEventListener("click", function(e){
    if (e.target.hasAttribute("data-close") || e.target === lightboxImg) return;
    if (e.target !== lightboxImg) closeModal(lightbox);
  });

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
      if (!videoModal.hidden) closeModal(videoModal);
      if (!lightbox.hidden) closeModal(lightbox);
    }
  });

  var slider = document.getElementById("review-slider");
  var prevBtn = document.getElementById("rev-prev");
  var nextBtn = document.getElementById("rev-next");
  function cardStep(){
    var card = slider.querySelector(".review-card");
    return card ? card.offsetWidth + 16 : 300;
  }
  function updateNav(){
    prevBtn.disabled = slider.scrollLeft <= 4;
    nextBtn.disabled = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 4;
  }
  prevBtn.addEventListener("click", function(){ slider.scrollBy({left: -cardStep(), behavior: reduce ? "auto" : "smooth"}); });
  nextBtn.addEventListener("click", function(){ slider.scrollBy({left: cardStep(), behavior: reduce ? "auto" : "smooth"}); });
  slider.addEventListener("scroll", updateNav, {passive: true});
  window.addEventListener("resize", updateNav);
  updateNav();

  var loadMapBtn = document.getElementById("load-map");
  if (loadMapBtn) {
    loadMapBtn.addEventListener("click", function(e){
      e.preventDefault();
      var wrap = loadMapBtn.closest(".map-wrap");
      var iframe = document.createElement("iframe");
      iframe.title = "Карта залов";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.src = "https://yandex.ru/map-widget/v1/?um=constructor%3A1a2b3c&source=constructor";
      var pin = wrap.querySelector(".map-pin");
      var ph = document.getElementById("map-placeholder");
      if (ph) ph.remove();
      wrap.insertBefore(iframe, pin);
    });
  }

  var spyLinks = document.querySelectorAll(".nav-links a");
  var sections = [];
  spyLinks.forEach(function(a){
    var id = a.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({el: sec, link: a});
  });
  function onScroll(){
    var pos = window.scrollY + 140;
    var current = null;
    sections.forEach(function(s){
      if (s.el.offsetTop <= pos) current = s;
    });
    spyLinks.forEach(function(a){ a.classList.remove("is-active"); });
    if (current) current.link.classList.add("is-active");
  }
  window.addEventListener("scroll", onScroll, {passive: true});
  onScroll();

  var form = document.getElementById("signup-form");
  var fields = document.getElementById("form-fields");
  var success = document.getElementById("form-success");
  var successText = document.getElementById("success-text");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("name").value.trim();
    var ph = phone.value.trim();
    var agree = document.getElementById("agree").checked;
    var digits = ph.replace(/\D/g,"");
    var valid = true;
    document.getElementById("err-name").classList.remove("show");
    document.getElementById("err-phone").classList.remove("show");
    document.getElementById("err-agree").classList.remove("show");
    document.getElementById("name").classList.remove("invalid");
    phone.classList.remove("invalid");
    if (!name || name.length < 2) { document.getElementById("err-name").classList.add("show"); document.getElementById("name").classList.add("invalid"); valid=false; }
    if (digits.length !== 11) { document.getElementById("err-phone").classList.add("show"); phone.classList.add("invalid"); valid=false; }
    if (!agree) { document.getElementById("err-agree").classList.add("show"); valid=false; }
    if (!valid) return;
    fields.style.display = "none";
    success.classList.add("show");
    successText.textContent = "Спасибо, " + name + "! Администратор перезвонит в течение часа и забронирует зал рядом с тобой.";
  });
})();
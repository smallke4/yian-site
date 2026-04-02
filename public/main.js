/* =============================================
   有巢氏麻吉地產翊安 - Main JavaScript
   資料從後台 API 動態載入
   ============================================= */

let VIDEOS   = [];
let LISTINGS = [];
let currentVideoFilter = "all";
let currentAreaFilter  = "all";
let likedListings      = new Set();

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteData();
  initNavbar();
  renderVideos();
  renderListings();
  initVideoTabs();
  initListingsFilter();
  initNewsletter();
  initModal();
  initScrollReveal();
  initScrollAnimations();
});

/* ============================================================
   LOAD DATA FROM API
   ============================================================ */
async function loadSiteData() {
  try {
    const res  = await fetch("/api/data");
    const data = await res.json();

    VIDEOS   = data.videos   || [];
    LISTINGS = data.listings || [];

    const p = data.profile;
    if (p) {
      setText(".logo-text",    p.name);
      setHTML(".hero-name",    p.name + '<span class="hero-name-sub"> ' + p.nameEn + '</span>');
      setText(".hero-tagline", p.tagline);
      setHTML(".hero-subtitle", (p.subtitle || "").replace(/\n/g, "<br>"));
      setHTML(".about-big-name", p.name + ' <span>' + p.nameEn + '</span>');

      if (p.stats) {
        const nums = document.querySelectorAll(".stat-num");
        if (nums[0]) nums[0].textContent = p.stats.fans;
        if (nums[1]) nums[1].textContent = p.stats.videos;
        const cards = document.querySelectorAll(".hero-float-card strong");
        if (cards[0]) cards[0].textContent = p.stats.videos;
        if (cards[1]) cards[1].textContent = p.stats.fans;
        const qs = document.querySelectorAll(".qs-item strong");
        if (qs[1]) qs[1].textContent = p.stats.years;
        if (qs[2]) qs[2].textContent = p.stats.deals;
      }

      const bioEl = document.querySelector(".about-lead");
      if (bioEl && p.bio) bioEl.textContent = p.bio;
    }

    const c = data.contact;
    if (c) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.href = "mailto:" + c.email;
        el.textContent = c.email;
      });
      const lineEl  = document.querySelector(".contact-list li:nth-child(3) span");
      const hoursEl = document.querySelector(".contact-list li:nth-child(4) span");
      if (lineEl)  lineEl.textContent  = "LINE ID：" + c.lineId;
      if (hoursEl) hoursEl.textContent = c.hours;

      setSocialHref(".social-btn.youtube",   c.youtube);
      setSocialHref(".social-btn.instagram", c.instagram);
      setSocialHref(".social-btn.facebook",  c.facebook);
      setSocialHref(".social-btn.tiktok",    c.tiktok);
      setSocialHref(".social-btn.line",      c.line);
      const ytBtn = document.querySelector('.section-cta a[href*="youtube"]');
      if (ytBtn && c.youtube) ytBtn.href = c.youtube;
    }

    likedListings = new Set(LISTINGS.filter(l => l.liked).map(l => l.id));

  } catch (e) {
    console.warn("API 載入失敗，使用預設資料", e);
  }
}

function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = val || "";
}
function setHTML(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.innerHTML = val || "";
}
function setSocialHref(sel, url) {
  const el = document.querySelector(sel);
  if (el && url) el.href = url;
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar   = document.getElementById("navbar");
  const toggle   = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const spans  = toggle.querySelectorAll("span");
    const isOpen = navLinks.classList.contains("open");
    spans[0].style.transform = isOpen ? "rotate(45deg) translate(5px, 5px)" : "";
    spans[1].style.opacity   = isOpen ? "0" : "1";
    spans[2].style.transform = isOpen ? "rotate(-45deg) translate(5px, -5px)" : "";
  });

  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle.querySelectorAll("span").forEach(s => {
        s.style.transform = "";
        s.style.opacity   = "1";
      });
    });
  });
}

/* ============================================================
   RENDER VIDEOS
   ============================================================ */
function renderVideos(filter = "all") {
  const grid     = document.getElementById("videoGrid");
  const filtered = filter === "all" ? VIDEOS : VIDEOS.filter(v => v.category === filter);

  grid.innerHTML = filtered.map(v => `
    <div class="video-card reveal" data-category="${v.category}" data-id="${v.id}">
      <div class="video-thumb" style="background:${v.gradient};">
        <div class="thumb-emoji">${v.emoji}</div>
        <div class="video-thumb-overlay"></div>
        <div class="video-play-btn"><i class="fa-solid fa-play"></i></div>
        <span class="video-duration">${v.duration}</span>
        <span class="video-badge badge-${v.badge}">${v.badgeText}</span>
      </div>
      <div class="video-info">
        <h4>${v.title}</h4>
        <div class="video-meta">
          <span><i class="fa-solid fa-eye"></i>${v.views} 次觀看</span>
          <span><i class="fa-regular fa-clock"></i>${v.time}</span>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".video-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id);
      openVideoModal(VIDEOS.find(v => v.id === id));
    });
  });

  setTimeout(triggerReveal, 50);
}

function initVideoTabs() {
  document.querySelectorAll(".vtab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".vtab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentVideoFilter = btn.dataset.filter;
      renderVideos(currentVideoFilter);
    });
  });
}

/* ============================================================
   RENDER LISTINGS
   ============================================================ */
function renderListings(areaFilter = "all") {
  const grid     = document.getElementById("listingsGrid");
  const filtered = areaFilter === "all" ? LISTINGS : LISTINGS.filter(l => l.area === areaFilter);

  grid.innerHTML = filtered.map(l => `
    <div class="listing-card reveal" data-area="${l.area}">
      <div class="listing-img" style="background:${l.gradient};">
        <div class="listing-img-bg"></div>
        <span class="listing-img-emoji">${l.emoji}</span>
        <div class="listing-badges">
          ${(l.badges||[]).map(b=>`<span class="listing-badge ${b.cls}">${b.text}</span>`).join("")}
        </div>
        <button class="listing-heart" data-id="${l.id}" aria-label="收藏">
          <i class="fa-${likedListings.has(l.id)?'solid':'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="listing-body">
        <div class="listing-area-tag"><i class="fa-solid fa-location-dot"></i>${l.areaName}</div>
        <h3>${l.title}</h3>
        <div class="listing-specs">
          <span><i class="fa-solid fa-ruler-combined"></i>${l.size}</span>
          <span><i class="fa-solid fa-bed"></i>${l.rooms}</span>
          <span><i class="fa-solid fa-building"></i>${l.floor}</span>
        </div>
        <div class="listing-price">NT$ ${l.price}<span> ${l.unit}</span></div>
        <div class="listing-action">
          <button class="btn-listing"><i class="fa-solid fa-calendar-check"></i> 預約帶看</button>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".listing-heart").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      if (likedListings.has(id)) {
        likedListings.delete(id);
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      } else {
        likedListings.add(id);
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        btn.style.animation = "none";
        btn.offsetHeight;
        btn.style.animation = "heartPop 0.3s ease";
      }
    });
  });

  grid.querySelectorAll(".btn-listing").forEach(btn => {
    btn.addEventListener("click", () => showToast("📞 正在連接翊安顧問，稍後將有專人聯繫您！"));
  });

  setTimeout(triggerReveal, 50);
}

function initListingsFilter() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentAreaFilter = btn.dataset.area;
      renderListings(currentAreaFilter);
    });
  });
}

/* ============================================================
   VIDEO MODAL
   ============================================================ */
function initModal() {
  const overlay = document.getElementById("videoModal");
  document.getElementById("modalClose").addEventListener("click", closeVideoModal);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeVideoModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeVideoModal(); });
}

function openVideoModal(data) {
  if (!data) return;
  const overlay = document.getElementById("videoModal");
  const wrap    = document.getElementById("modalVideoWrap");
  const url     = data.youtubeUrl || "https://www.youtube.com";
  wrap.innerHTML = `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;
      justify-content:center;background:${data.gradient};color:#fff;gap:16px;padding:40px;text-align:center;">
      <div style="font-size:4rem">${data.emoji}</div>
      <h3 style="font-size:1.1rem;font-weight:700;line-height:1.5;max-width:500px">${data.title}</h3>
      <p style="font-size:0.88rem;opacity:0.8;max-width:420px;line-height:1.7">${data.desc}</p>
      <a href="${url}" target="_blank" style="background:rgba(255,255,255,0.9);color:#166534;
        border-radius:9999px;padding:12px 28px;font-weight:700;font-size:0.9rem;
        display:inline-flex;align-items:center;gap:8px;margin-top:8px;">
        <i class="fa-solid fa-play"></i> 前往觀看完整影片
      </a>
    </div>`;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeVideoModal() {
  document.getElementById("videoModal").classList.remove("active");
  document.body.style.overflow = "";
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
  const form    = document.getElementById("nlForm");
  const success = document.getElementById("nlSuccess");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn    = form.querySelector("button[type='submit']");
    const name   = document.getElementById("nlName").value.trim();
    const email  = document.getElementById("nlEmail").value.trim();
    const status = form.querySelector('input[name="status"]:checked');

    if (!name || !email) { showToast("⚠️ 請填寫姓名與電子信箱！", "warn"); return; }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 訂閱中...';
    btn.disabled  = true;

    try {
      await fetch("tables/newsletter_subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, status: status ? status.value : "未填寫",
          subscribed_at: new Date().toISOString() })
      });
    } catch {}

    form.style.display = "none";
    success.style.display = "flex";
    showToast("🎉 訂閱成功！歡迎加入翊安電子報家族！");
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type = "success") {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = msg;
  toast.style.cssText = `position:fixed;bottom:30px;left:50%;
    transform:translateX(-50%) translateY(60px);
    background:${type==="warn"?"#f59e0b":"linear-gradient(135deg,#22c55e,#16a34a)"};
    color:#fff;padding:14px 28px;border-radius:9999px;font-size:0.9rem;font-weight:600;
    font-family:'Noto Sans TC',sans-serif;box-shadow:0 8px 30px rgba(0,0,0,0.18);
    z-index:10000;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);white-space:nowrap;`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = "translateX(-50%) translateY(0)"; });
  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(60px)";
    toast.style.opacity   = "0";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
  window._revealObserver = obs;
}

function triggerReveal() {
  const obs = window._revealObserver;
  if (obs) document.querySelectorAll(".reveal:not(.visible)").forEach(el => obs.observe(el));
  document.querySelectorAll(".reveal").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("visible");
  });
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".about-card,.video-card,.listing-card,.nl-perks li")
          .forEach((el, i) => { el.style.transitionDelay = `${i*0.08}s`; el.classList.add("visible"); });
      }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll("section").forEach(s => obs.observe(s));
}

/* ============================================================
   SMOOTH ANCHOR
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const href = anchor.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
  });
});

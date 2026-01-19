
/* ========== MOBILE MENU ========== */
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ========== NEWS PAGINATION (keeps your existing behavior) ========== */
  const postsPerPage = 5;
  const container = document.getElementById("news-container");
  const pagination = document.getElementById("pagination");

  if (container && pagination) {
    const posts = Array.from(container.getElementsByClassName("news-box"));
    const totalPages = Math.ceil(posts.length / postsPerPage);
    let currentPage = 1;

    function showPage(page) {
      currentPage = page;

      posts.forEach((post, index) => {
        post.style.display =
          index >= (page - 1) * postsPerPage && index < page * postsPerPage
            ? "block"
            : "none";
      });

      renderPagination();
    }

    function renderPagination() {
      pagination.innerHTML = "";

      const prev = document.createElement("button");
      prev.textContent = "« Prev";
      prev.className = "page-btn";
      prev.disabled = currentPage === 1;
      prev.onclick = () => showPage(currentPage - 1);
      pagination.appendChild(prev);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = String(i);
        btn.className = "page-btn";
        if (i === currentPage) btn.classList.add("active");
        btn.onclick = () => showPage(i);
        pagination.appendChild(btn);
      }

      const next = document.createElement("button");
      next.textContent = "Next »";
      next.className = "page-btn";
      next.disabled = currentPage === totalPages;
      next.onclick = () => showPage(currentPage + 1);
      pagination.appendChild(next);
    }

    showPage(1);
  }

  /* ========== STATS: Start real-time updates (home page only) ========== */
  startRealtimeStats();
});

/* ========== NUMBER ANIMATION ========== */
function animateNumber(target, elementId, opts = {}) {
  const {
    duration = 1100,
    prefix = "",
    suffix = "",
    isCurrency = false,
    compact = true,
  } = opts;

  const el = document.getElementById(elementId);
  if (!el) return;

  const end = Number(target || 0);
  const startTime = performance.now();
  const startVal = 0;

  function format(value) {
    if (isCurrency) return prefix + formatUSD(value, compact) + suffix;
    return prefix + formatCompactNumber(value, compact) + suffix;
  }

  function tick(now) {
    const t = Math.min((now - startTime) / duration, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const current = startVal + (end - startVal) * eased;

    el.textContent = format(current);

    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = format(end);
  }

  requestAnimationFrame(tick);
}

function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
}

function formatCompactNumber(value, compact = true) {
  const n = Number(value || 0);
  if (!compact) return Math.round(n).toLocaleString();

  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return Math.round(n).toLocaleString();
}

function formatUSD(value, compact = true) {
  const n = Number(value || 0);
  // For tiny values, show 2 decimals
  if (Math.abs(n) < 1000) return "$" + n.toFixed(2).toLocaleString();
  return "$" + formatCompactNumber(n, compact);
}

/* =========================
   REAL-TIME TOKEN STATS
   Source: DexScreener API
   ========================= */

const TOKEN_MINT = "2De7eTCZSoQhH1R7gc7182y9pUqr7U7G6NYoYcZ4uctn";

// DexScreener “token pairs” endpoint (recommended for picking best liquidity pair)
const DEXSCREENER_TOKEN_PAIRS =
  `https://api.dexscreener.com/token-pairs/v1/solana/${TOKEN_MINT}`;

// Refresh cadence (ms)
const STATS_REFRESH_MS = 30000;

let _statsInterval = null;

function startRealtimeStats() {
  // Only run if the stat elements exist on the page
  const hasStats =
    document.getElementById("marketCap") ||
    document.getElementById("liquidity") ||
    document.getElementById("volume") ||
    document.getElementById("holdersCount");

  if (!hasStats) return;

  // Holders count is not available from DexScreener, so show placeholder
  setText("holdersCount", "—");

  // First load immediately
  updateDexScreenerStats();

  // Then refresh
  if (_statsInterval) clearInterval(_statsInterval);
  _statsInterval = setInterval(updateDexScreenerStats, STATS_REFRESH_MS);
}

async function updateDexScreenerStats() {
  try {
    const res = await fetch(DEXSCREENER_TOKEN_PAIRS, { cache: "no-store" });
    if (!res.ok) throw new Error(`DexScreener HTTP ${res.status}`);
    const pairs = await res.json();

    if (!Array.isArray(pairs) || pairs.length === 0) {
      // If your token has no tracked pair yet
      setText("marketCap", "—");
      setText("liquidity", "—");
      setText("volume", "—");
      return;
    }

    // Pick the most relevant pair: highest USD liquidity
    const best = pairs.reduce((bestSoFar, p) => {
      const liq = Number(p?.liquidity?.usd || 0);
      const bestLiq = Number(bestSoFar?.liquidity?.usd || 0);
      return liq > bestLiq ? p : bestSoFar;
    }, pairs[0]);

    
    const marketCap = Number(best?.fdv || 0);
    const liquidityUsd = Number(best?.liquidity?.usd || 0);
    const volume24h = Number(best?.volume?.h24 || 0);

    // Animate updates (nice UX)
    if (marketCap > 0) {
      animateNumber(marketCap, "marketCap", { isCurrency: true, duration: 900 });
    } else {
      setText("marketCap", "—");
    }

    if (liquidityUsd > 0) {
      animateNumber(liquidityUsd, "liquidity", { isCurrency: true, duration: 900 });
    } else {
      setText("liquidity", "—");
    }

    if (volume24h > 0) {
      animateNumber(volume24h, "volume", { isCurrency: true, duration: 900 });
    } else {
      setText("volume", "—");
    }

    setText("holdersCount", "—");

  } catch (err) {
    console.error("Failed to fetch DexScreener stats:", err);
  }
}

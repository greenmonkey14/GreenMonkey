document.addEventListener("DOMContentLoaded", () => {
  // ========== MOBILE MENU ==========
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen);
    });
  }

  // ========== NEWS PAGINATION ==========
  const postsPerPage = 5;
  const container = document.getElementById("news-container");
  const pagination = document.getElementById("pagination");

  if (!container || !pagination) return;

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
      btn.textContent = i;
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
});

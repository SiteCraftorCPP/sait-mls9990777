/**
 * Config — подставь реальные URL позже
 */
const PAYMENT_URL = "success.html";
const LESSONS_URL = "#lessons";

(function () {
  const header = document.getElementById("site-header");
  const hero = document.getElementById("hero");

  document.querySelectorAll(".js-pay").forEach((el) => {
    el.setAttribute("href", PAYMENT_URL);
  });

  document.querySelectorAll(".js-lessons").forEach((el) => {
    el.setAttribute("href", LESSONS_URL);
  });

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const revealEls = document.querySelectorAll(".reveal, .media-frame");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-visible"));
  }
})();

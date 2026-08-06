/**
 * Оплата через ЮKassa API на этом же сервере.
 */
const PAYMENT_API = "/api/payments/create";
const LESSONS_URL = "https://t.me/+JARHvPSqchhjZjBi";

(function () {
  const header = document.getElementById("site-header");
  const hero = document.getElementById("hero");

  document.querySelectorAll(".js-lessons").forEach((el) => {
    el.setAttribute("href", LESSONS_URL);
  });

  document.querySelectorAll(".js-pay").forEach((el) => {
    el.setAttribute("href", "#");
    el.addEventListener("click", async (event) => {
      event.preventDefault();
      if (el.classList.contains("is-loading")) {
        return;
      }
      const label = el.textContent;
      el.classList.add("is-loading");
      el.textContent = "Открываем оплату…";
      try {
        const response = await fetch(PAYMENT_API, { method: "POST" });
        const data = await response.json();
        if (!response.ok || !data.confirmation_url) {
          throw new Error("payment_unavailable");
        }
        window.location.href = data.confirmation_url;
      } catch (_error) {
        alert("Не удалось открыть оплату. Попробуйте позже.");
        el.classList.remove("is-loading");
        el.textContent = label;
      }
    });
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

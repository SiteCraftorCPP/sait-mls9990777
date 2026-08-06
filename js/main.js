/**
 * Оплата через ЮKassa API на этом же сервере.
 */
const PAYMENT_API = "/api/payments/create";
const LESSONS_URL = "https://t.me/+JARHvPSqchhjZjBi";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSavedEmail() {
  const saved = localStorage.getItem("course_email");
  if (saved && EMAIL_RE.test(saved)) {
    return saved;
  }
  return null;
}

function openPayModal() {
  const modal = document.getElementById("pay-modal");
  const input = document.getElementById("pay-modal-email");
  const error = document.getElementById("pay-modal-error");
  const submit = document.getElementById("pay-modal-submit");

  if (!modal || !input || !submit) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      modal.classList.remove("is-open");
      document.body.classList.remove("pay-modal-open");
      window.setTimeout(() => {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
      }, 320);
      document.removeEventListener("keydown", onKeyDown);
      resolve(value);
    };

    const showError = (visible) => {
      if (error) {
        error.hidden = !visible;
      }
      input.classList.toggle("is-invalid", visible);
    };

    const submitEmail = () => {
      const normalized = input.value.trim();
      if (!EMAIL_RE.test(normalized)) {
        showError(true);
        input.focus();
        return;
      }
      showError(false);
      localStorage.setItem("course_email", normalized);
      finish(normalized);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        finish(null);
      }
    };

    modal.querySelectorAll("[data-pay-close]").forEach((el) => {
      el.addEventListener(
        "click",
        () => finish(null),
        { once: true }
      );
    });

    submit.addEventListener("click", submitEmail, { once: true });
    input.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitEmail();
        }
      },
      { once: true }
    );

    input.value = getSavedEmail() || "";
    showError(false);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("pay-modal-open");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => input.focus(), 80);
  });
}

function askCustomerEmail() {
  const saved = getSavedEmail();
  if (saved) {
    return Promise.resolve(saved);
  }
  return openPayModal();
}

(function () {
  const header = document.getElementById("site-header");
  const hero = document.getElementById("hero");

  document.querySelectorAll(".js-lessons").forEach((el) => {
    el.setAttribute("href", LESSONS_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  document.querySelectorAll(".js-pay").forEach((el) => {
    el.setAttribute("href", "#");
    el.addEventListener("click", async (event) => {
      event.preventDefault();
      if (el.classList.contains("is-loading")) {
        return;
      }
      const label = el.textContent;
      const email = await askCustomerEmail();
      if (!email) {
        return;
      }
      el.classList.add("is-loading");
      el.textContent = "Открываем оплату…";
      try {
        const response = await fetch(PAYMENT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
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

const body = document.body;
const toggle = document.querySelector(".theme-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const glow = document.querySelector(".cursor-glow");
const contactForms = document.querySelectorAll(".contact-form");
const emailConfig = {
  serviceId: "service_3qz1y1o",
  templateId: "template_7opd22n",
  publicKey: "vSo8HL6MK3b-5ZM6E",
};

const showToast = (message, type = "success") => {
  const existingToast = document.querySelector(".form-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `form-toast ${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
};

body.classList.add("loading");

window.addEventListener("load", () => {
  setTimeout(() => {
    body.classList.add("loaded");
    body.classList.remove("loading");
  }, 650);
});

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
}

if (toggle) {
  toggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("portfolio-theme", body.classList.contains("dark") ? "dark" : "light");
  });
}

if (window.emailjs) {
  emailjs.init({
    publicKey: emailConfig.publicKey,
  });
}

const setEmailField = (form, fieldName, value) => {
  let field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) {
    field = document.createElement("input");
    field.type = "hidden";
    field.name = fieldName;
    form.appendChild(field);
  }
  field.value = value;
};

const syncEmailTemplateFields = (form) => {
  const name = form.querySelector('[name="name"]')?.value || "";
  const email = form.querySelector('[name="email"]')?.value || "";
  const message = form.querySelector('[name="message"]')?.value || "";

  setEmailField(form, "from_name", name);
  setEmailField(form, "from_email", email);
  setEmailField(form, "reply_to", email);
  setEmailField(form, "user_name", name);
  setEmailField(form, "user_email", email);
  setEmailField(form, "user_message", message);
};

const sections = [...navLinks]
  .map((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") ? document.querySelector(href) : null;
  })
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-25% 0px -58% 0px",
      threshold: [0.08, 0.18, 0.32],
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

const revealItems = document.querySelectorAll(".card, .glass-panel, .section-title, .hero-copy, .hero-photo, .avatar-card");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.13 }
);

revealItems.forEach((item) => {
  item.classList.add("reveal");
  revealObserver.observe(item);
});

window.addEventListener("pointermove", (event) => {
  if (!glow) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

window.addEventListener("pointerdown", (event) => {
  const burst = document.createElement("span");
  burst.className = "click-burst";
  burst.style.setProperty("--x", `${event.clientX}px`);
  burst.style.setProperty("--y", `${event.clientY}px`);
  document.body.appendChild(burst);
  burst.addEventListener("animationend", () => burst.remove(), { once: true });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 900) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((y / rect.height) - 0.5) * -8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

contactForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const originalText = button.textContent;

    if (!window.emailjs) {
      button.textContent = "Email service unavailable";
      showToast("Email service is unavailable. Please try again later.", "error");
      setTimeout(() => {
        button.textContent = originalText;
      }, 2200);
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";
    syncEmailTemplateFields(form);

    emailjs
      .sendForm(emailConfig.serviceId, emailConfig.templateId, form)
      .then(() => {
        button.textContent = "Message Sent";
        showToast("Message sent successfully.", "success");
        form.reset();
      })
      .catch(() => {
        button.textContent = "Send Failed";
        showToast("Message could not be sent. Please try again.", "error");
      })
      .finally(() => {
        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
        }, 2200);
      });
  });
});

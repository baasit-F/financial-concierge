// ===== Site settings — update these in one place =====
const SITE = {
  // Dedicated advertising phone number (still to be acquired). Digits only, US format.
  phone: "0000000000",
  // Where quote requests are emailed (via FormSubmit.co)
  leadEmail: "Bpryb718@outlook.com",
};

// Apply phone number everywhere it appears
(function applyPhone() {
  const d = SITE.phone.replace(/\D/g, "");
  if (d.length !== 10) return;
  const pretty = `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.href = `tel:+1${d}`;
    el.textContent = pretty;
  });
})();

// Redirect target for the non-AJAX fallback post
document.querySelector('input[name="_next"]').value = new URL("thank-you.html", window.location.href).href;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// ===== Quote form =====
const form = document.getElementById("quote-form");
const status = form.querySelector(".form-status");
const submitBtn = form.querySelector('button[type="submit"]');

function validate() {
  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const field = input.closest(".field");
    let valid = input.value.trim() !== "";
    if (valid && input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    if (valid && input.type === "tel") valid = input.value.replace(/\D/g, "").length >= 10;
    field.classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = "form-status";
  status.textContent = "";

  if (!validate()) {
    status.classList.add("error");
    status.textContent = "Please fill in your name, a valid email and a phone number.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${SITE.leadEmail}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === "false" || data.success === false) throw new Error(data.message || "Request failed");
    window.location.href = "thank-you.html";
  } catch (err) {
    // Fall back to a normal form post if the AJAX call is blocked
    form.submit();
  }
});

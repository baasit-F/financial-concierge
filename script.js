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
    el.textContent = el.textContent.replace(/\(\d{3}\) \d{3}-\d{4}/, pretty);
  });
  document.querySelectorAll("[data-phone-btn]").forEach((el) => (el.href = `tel:+1${d}`));
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

// ===== Coverage calculator =====
const money = (n) => "$" + Math.max(0, Math.round(n)).toLocaleString("en-US");
const num = (id) => Number(document.getElementById(id).value.replace(/[^\d.]/g, "")) || 0;
const calcIds = ["c-income", "c-years", "c-debt", "c-edu", "c-have"];
let estimate = 0;

function runCalc() {
  const years = num("c-years");
  document.getElementById("c-years-out").textContent = years;
  estimate = num("c-income") * years + num("c-debt") + num("c-edu") - num("c-have");
  estimate = Math.max(0, Math.round(estimate / 5000) * 5000);
  document.getElementById("c-result").textContent = money(estimate);
}
calcIds.forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", runCalc);
  if (el.type === "text") {
    el.addEventListener("blur", () => { el.value = num(id) ? num(id).toLocaleString("en-US") : ""; });
  }
});
runCalc();

document.getElementById("calc-cta").addEventListener("click", () => {
  document.getElementById("estimate-field").value = money(estimate);
  const family = document.querySelector('input[name="Interested In"][value^="Life Insurance"]');
  if (family) family.checked = true;
});

// ===== 2-step quote form =====
const form = document.getElementById("quote-form");
const steps = form.querySelectorAll(".step");
const bar = document.querySelector(".progress-bar");
const submitBtn = form.querySelector('button[type="submit"]');

function showStep(n) {
  steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(n)));
  bar.style.width = n === 1 ? "50%" : "90%";
}

form.querySelector("[data-next]").addEventListener("click", () => {
  const err = steps[0].querySelector(".step-error");
  if (!form.querySelector('input[name="Interested In"]:checked')) {
    err.textContent = "Please choose an option to continue.";
    return;
  }
  err.textContent = "";
  showStep(2);
  document.getElementById("first-name").focus({ preventScroll: true });
});
// Picking a tile moves straight to step 2
form.querySelectorAll('input[name="Interested In"]').forEach((r) =>
  r.addEventListener("change", () => setTimeout(() => form.querySelector("[data-next]").click(), 200))
);
form.querySelector("[data-back]").addEventListener("click", () => showStep(1));

function validateContact() {
  let ok = true;
  steps[1].querySelectorAll("[required]").forEach((input) => {
    let valid = input.value.trim() !== "";
    if (valid && input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    if (valid && input.type === "tel") valid = input.value.replace(/\D/g, "").length >= 10;
    input.closest(".field").classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = steps[1].querySelector(".step-error");
  err.textContent = "";
  if (!validateContact()) {
    err.textContent = "Please enter your name, a valid email and a phone number.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  bar.style.width = "100%";

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

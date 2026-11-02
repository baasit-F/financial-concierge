// ===== Simple rule-based chat assistant =====
// Explains coverage types, and walks visitors through the calculator or a quote request.
// Everything runs in the browser; quote requests go through the main form (FormSubmit).
(function () {
  const launcher = document.querySelector(".chat-launcher");
  const panel = document.getElementById("chat-panel");
  const log = panel.querySelector(".chat-log");
  const chips = panel.querySelector(".chat-chips");
  const inputForm = panel.querySelector(".chat-input");
  const input = inputForm.querySelector("input");

  const MAIN_MENU = [
    ["Why do I need life insurance?", "why"],
    ["What are living benefits?", "living"],
    ["Term vs. permanent", "types"],
    ["Group benefits for my business", "group"],
    ["Long-term care", "ltc"],
    ["Estimate my coverage", "calc"],
    ["Get a free quote", "quote"],
  ];

  const TOPICS = {
    why: {
      text: [
        "Life insurance replaces your income and pays off what you owe if something happens to you, so your family can stay in their home, keep up with bills and stay on track with goals like college.",
        "With living benefits, many policies can also help <b>you</b> while you're alive if you face a serious illness. And the younger and healthier you are when you apply, the lower your rate is likely to be.",
      ],
      next: [["What are living benefits?", "living"], ["How much do I need?", "calc"], ["Get a free quote", "quote"]],
    },
    living: {
      text: [
        "Living benefits let you use part of your death benefit <b>early</b> if you're diagnosed with a qualifying illness:",
        "• <b>Critical illness</b>: e.g. heart attack, stroke or cancer<br>• <b>Chronic illness</b>: unable to do 2 of 6 daily activities, like bathing or dressing<br>• <b>Terminal illness</b>: a limited life expectancy",
        "You decide how to use the money, whether that's medical bills, the mortgage or lost income. Whatever isn't used still goes to your beneficiaries. Riders vary by carrier and state, so Ben can show you which policies include them.",
      ],
      next: [["Get a quote with living benefits", "quote"], ["Term vs. permanent", "types"], ["Main menu", "menu"]],
    },
    types: {
      text: [
        "<b>Term life</b> covers you for a set period (10, 20 or 30 years). It's the most affordable way to get a lot of coverage while kids are young or the mortgage is big.",
        "<b>Permanent life</b> (whole or universal) lasts your whole life and can build cash value you can borrow against. It costs more, but it's useful for estate planning, final expenses and leaving a legacy.",
        "Many families combine both. Ben can compare options side by side for you.",
      ],
      next: [["Estimate my coverage", "calc"], ["Get a free quote", "quote"], ["Main menu", "menu"]],
    },
    group: {
      text: [
        "Good benefits help you hire and keep great people. Ben sets up group plans for businesses with as few as 2 employees: medical, dental, vision, group life, disability and voluntary benefits.",
        "He handles plan design, renewals, carrier negotiation and employee enrollment, so you can focus on running the business.",
      ],
      next: [["Request a benefits review", "quote-group"], ["Main menu", "menu"]],
    },
    ltc: {
      text: [
        "Long-term care pays for help with daily living, at home or in a facility. Those costs usually aren't covered by health insurance and can quickly drain savings.",
        "Ben is <b>Certified in Long-Term Care (CLTC)</b> and can walk you through traditional LTC policies and hybrid life + LTC plans.",
      ],
      next: [["Get an LTC quote", "quote-ltc"], ["What are living benefits?", "living"], ["Main menu", "menu"]],
    },
    ben: {
      text: [
        "Ben has helped families and businesses since 1984, which is 42 years. He's a <b>Life Member and Qualifying Member of the Million Dollar Round Table (MDRT)</b> and holds the <b>CLTC</b> and <b>LUTCF</b> designations.",
      ],
      next: [["Get a free quote", "quote"], ["Main menu", "menu"]],
    },
    menu: { text: ["What else can I help with?"], next: MAIN_MENU },
  };

  const KEYWORDS = [
    [/quote|price|cost|rate|apply|sign ?up|buy/i, "quote"],
    [/how much|calculat|estimate|need\b/i, "calc"],
    [/living|critical|chronic|terminal|accelerat|illness|cancer|stroke|heart/i, "living"],
    [/term|whole|permanent|universal|cash value|types?/i, "types"],
    [/group|employ|business|company|staff|team|health/i, "group"],
    [/long[- ]?term|ltc|nursing|care/i, "ltc"],
    [/who|ben\b|experience|mdrt|cltc|lutcf|about/i, "ben"],
    [/why|need it|worth|important/i, "why"],
    [/menu|help|start|options/i, "menu"],
  ];

  // ---------- rendering ----------
  function say(html, who = "bot") {
    const b = document.createElement("div");
    b.className = `msg msg-${who}`;
    b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }
  function botSay(lines, next) {
    setChips([]);
    lines.forEach((l, i) => setTimeout(() => say(l), 250 + i * 450));
    setTimeout(() => setChips(next || []), 250 + lines.length * 450);
  }
  function setChips(list) {
    chips.innerHTML = "";
    list.forEach(([label, action]) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "chip";
      c.textContent = label;
      c.addEventListener("click", () => { say(escapeHtml(label), "user"); handleAction(action); });
      chips.appendChild(c);
    });
  }
  const escapeHtml = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- guided flows ----------
  let flow = null; // { type, step, data }

  const parseMoney = (t) => {
    const m = String(t).toLowerCase().replace(/[$,\s]/g, "").match(/^(\d+(?:\.\d+)?)(k|m|mil|million|thousand)?$/);
    if (!m) return null;
    let n = parseFloat(m[1]);
    if (m[2] === "k" || m[2] === "thousand") n *= 1e3;
    if (m[2] && m[2].startsWith("m")) n *= 1e6;
    return n;
  };
  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");

  const CALC_STEPS = [
    ["income", "c-income", "What's your annual income? (e.g. 75,000 or 75k)"],
    ["years", "c-years", "How many years would your family need that income replaced? Many people choose until the kids are grown, often 10 to 20 years."],
    ["debt", "c-debt", "Roughly how much do you owe on your mortgage and other debts? (Type 0 if none.)"],
    ["edu", "c-edu", "Any future goals to fund, like college? Enter a total amount, or 0."],
    ["have", "c-have", "Finally, how much existing life insurance and savings do you have? (0 is fine.)"],
  ];

  function startCalc() {
    flow = { type: "calc", step: 0, data: {} };
    botSay(["Let's get a quick ballpark. I'll ask 5 short questions.", CALC_STEPS[0][2]]);
  }
  function calcAnswer(text) {
    const [key, , ] = CALC_STEPS[flow.step];
    let val = key === "years" ? parseInt(text, 10) : parseMoney(text);
    if (val === null || isNaN(val) || val < 0 || (key === "years" && (val < 1 || val > 40))) {
      botSay([key === "years" ? "Please enter a number of years, like 15." : "Please enter an amount, like 250,000 or 250k."]);
      return;
    }
    flow.data[key] = val;
    flow.step++;
    if (flow.step < CALC_STEPS.length) { botSay([CALC_STEPS[flow.step][2]]); return; }

    // Fill the on-page calculator so both stay in sync
    CALC_STEPS.forEach(([k, id]) => {
      const el = document.getElementById(id);
      let v = flow.data[k];
      if (k === "years") v = Math.min(30, Math.max(5, v));
      el.value = k === "years" ? v : v.toLocaleString("en-US");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const result = document.getElementById("c-result").textContent;
    flow = null;
    botSay(
      [`Your estimated need is about <b>${result}</b>.`, "This is a simple educational estimate, not a recommendation. Ben can fine-tune it for your family and find the best price."],
      [["Get a quote for this amount", "quote-calc"], ["Show me the calculator", "show-calc"], ["Main menu", "menu"]]
    );
  }

  const INTERESTS = [
    ["My family", "Life Insurance for my family"],
    ["My employees", "Group Health Benefits for my business"],
    ["My retirement & care", "Long-Term Care"],
    ["My business", "Business / Key-Person Life Insurance"],
  ];

  function startQuote(preset) {
    flow = { type: "quote", step: preset ? 1 : 0, data: { interest: preset } };
    if (preset) { botSay(["Great, I'll get that started. What's your first and last name?"]); return; }
    botSay(["Happy to help! It takes about a minute. What would you like to protect?"], INTERESTS.map(([l, v]) => [l, "interest:" + v]));
  }
  function quoteAnswer(text) {
    const d = flow.data;
    if (flow.step === 1) {
      const parts = text.trim().split(/\s+/);
      if (parts.length < 2) { botSay(["Please enter your first and last name."]); return; }
      d.first = parts[0]; d.last = parts.slice(1).join(" ");
      flow.step = 2; botSay([`Thanks, ${escapeHtml(d.first)}! What's the best email address for your quote?`]); return;
    }
    if (flow.step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) { botSay(["That email doesn't look quite right. Could you check it?"]); return; }
      d.email = text.trim();
      flow.step = 3; botSay(["And the best phone number to reach you?"]); return;
    }
    if (flow.step === 3) {
      if (text.replace(/\D/g, "").length < 10) { botSay(["Please enter a 10-digit phone number."]); return; }
      d.phone = text.trim();
      flow.step = 4;
      botSay(
        [`Here's what I'll send Ben:<br><b>${escapeHtml(d.first)} ${escapeHtml(d.last)}</b><br>${escapeHtml(d.email)}<br>${escapeHtml(d.phone)}<br><i>${escapeHtml(d.interest)}</i>`, "Ready to send?"],
        [["Yes, send my request", "send"], ["Start over", "quote"]]
      );
    }
  }
  function sendQuote() {
    const d = flow.data;
    const form = document.getElementById("quote-form");
    const radio = form.querySelector(`input[name="Interested In"][value="${d.interest}"]`);
    if (radio) radio.checked = true;
    document.getElementById("first-name").value = d.first;
    document.getElementById("last-name").value = d.last;
    document.getElementById("email").value = d.email;
    document.getElementById("phone").value = d.phone;
    const msg = form.querySelector('input[name="Message"]') || Object.assign(document.createElement("input"), { type: "hidden", name: "Message" });
    msg.value = "Submitted through the website chat assistant";
    form.appendChild(msg);
    flow = null;
    say("Sending now. Ben will personally reach out within one business day!");
    setChips([]);
    setTimeout(() => form.requestSubmit(), 600);
  }

  // ---------- routing ----------
  function handleAction(action) {
    if (action.startsWith("interest:")) { flow = { type: "quote", step: 1, data: { interest: action.slice(9) } }; botSay(["Great choice. What's your first and last name?"]); return; }
    switch (action) {
      case "calc": return startCalc();
      case "quote": return startQuote();
      case "quote-group": return startQuote("Group Health Benefits for my business");
      case "quote-ltc": return startQuote("Long-Term Care");
      case "quote-calc":
        document.getElementById("estimate-field").value = document.getElementById("c-result").textContent;
        return startQuote("Life Insurance for my family");
      case "show-calc":
        document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
        return botSay(["I've filled in the calculator below with your answers. Feel free to adjust it."], [["Get a quote for this amount", "quote-calc"], ["Main menu", "menu"]]);
      case "send": return flow && flow.type === "quote" && flow.step === 4 ? sendQuote() : startQuote();
      default: {
        const t = TOPICS[action] || TOPICS.menu;
        return botSay(t.text, t.next);
      }
    }
  }

  function handleText(text) {
    if (/^(cancel|stop|menu|start over)$/i.test(text.trim())) { flow = null; return handleAction("menu"); }
    if (flow && flow.type === "calc") return calcAnswer(text);
    if (flow && flow.type === "quote" && flow.step >= 1 && flow.step <= 3) return quoteAnswer(text);
    const hit = KEYWORDS.find(([re]) => re.test(text));
    if (hit) return handleAction(hit[1]);
    botSay(
      ["I'm a simple assistant, so I may not have the answer to that one. Ben can answer any question personally.", `Call <a href="${document.querySelector("[data-phone]").getAttribute("href")}">${document.querySelector("[data-phone]").textContent.replace(/^Call /, "")}</a> or pick a topic:`],
      MAIN_MENU
    );
  }

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    say(escapeHtml(text), "user");
    input.value = "";
    handleText(text);
  });

  // ---------- open / close ----------
  let started = false;
  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", open);
    launcher.classList.toggle("is-open", open);
    if (open && !started) {
      started = true;
      botSay(
        ["Hi! I'm Ben's assistant. I can explain your coverage options, estimate how much life insurance you need, or get your free quote started.", "<small>I share general information only, not personalized advice.</small>"],
        MAIN_MENU
      );
    }
    if (open) setTimeout(() => input.focus(), 50);
  }
  launcher.addEventListener("click", () => toggle(panel.hidden));
  panel.querySelector(".chat-close").addEventListener("click", () => toggle(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) toggle(false); });
})();

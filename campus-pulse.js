/* =====================================================================
   CAMPUS WHAT-IF LAB — Logic
   Three-step wizard: Event → Plan → Result.
   ===================================================================== */

(function () {
  "use strict";

  const DATA = window.PULSE_DATA;

  /* ---------- STATE ---------- */
  const state = {
    eventId: null,
    planId: null,
  };

  /* ---------- DOM HELPERS ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- STEP NAVIGATION ---------- */
  function goToStep(step) {
    // Hide all panels
    $("#stepEvent").hidden = step !== 1;
    $("#stepPlan").hidden = step !== 2;
    $("#stepResult").hidden = step !== 3;

    // Update progress bar
    $$(".lab-step").forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle("is-active", n === step);
      el.classList.toggle("is-done", n < step);
    });

    // Scroll to top of shell
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- STEP 1: EVENT RENDERING ---------- */
  function renderEvents() {
    const grid = $("#eventGrid");
    grid.innerHTML = DATA.events
      .map(
        (e) => `
      <button class="event-card" data-id="${e.id}">
        <div class="ec-head">
          <span class="ec-emoji">${e.emoji}</span>
          <span class="ec-risk" data-tone="${e.riskColor}">${e.risk}</span>
        </div>
        <div class="ec-name">${e.name}</div>
        <div class="ec-tag">${e.tag}</div>
      </button>
    `
      )
      .join("");

    $$("#eventGrid .event-card").forEach((card) => {
      card.addEventListener("click", () => selectEvent(card.dataset.id));
    });
  }

  function selectEvent(id) {
    state.eventId = id;

    $$("#eventGrid .event-card").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.id === id);
    });

    const event = DATA.events.find((e) => e.id === id);

    const brief = $("#eventBrief");
    brief.hidden = false;
    brief.innerHTML = `
      <div class="eb-label">Event briefing</div>
      <p class="eb-text">${event.briefing}</p>
    `;

    $("#toStep2").disabled = false;
  }

  /* ---------- STEP 2: PLANS ---------- */
  function renderPlans() {
    const event = DATA.events.find((e) => e.id === state.eventId);

    $("#planKicker").textContent = `${event.emoji}  ${event.name}`;

    const list = $("#planList");
    list.innerHTML = DATA.plans
      .map(
        (p) => `
      <button class="plan-card" data-id="${p.id}">
        <span class="pc-radio"></span>
        <div class="pc-body">
          <div class="pc-id">PLAN ${p.id}</div>
          <div class="pc-name">${p.name}</div>
          <p class="pc-desc">${p.description}</p>
        </div>
        <span class="pc-badge" data-tone="${p.tone}">${p.short}</span>
      </button>
    `
      )
      .join("");

    $$("#planList .plan-card").forEach((card) => {
      card.addEventListener("click", () => selectPlan(card.dataset.id));
    });

    $("#runSim").disabled = true;
  }

  function selectPlan(id) {
    state.planId = id;

    $$("#planList .plan-card").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.id === id);
    });

    $("#runSim").disabled = false;
  }

  /* ---------- STEP 3: RESULT ---------- */

  // Lower is "better" for these metrics
  const LOWER_IS_BETTER = ["crowd", "waiting", "transport", "cost"];
  // Higher is "better"
  const HIGHER_IS_BETTER = ["safety"];

  function computeScore(metrics) {
    // Convert raw values (0-100) into normalized "goodness" scores.
    // crowd, waiting, transport, cost → lower raw = higher goodness
    // safety → higher raw = higher goodness
    const crowdGoodness = 100 - metrics.crowd;
    const waitingGoodness = 100 - metrics.waiting;
    const transportGoodness = 100 - metrics.transport;
    const costGoodness = 100 - metrics.cost;
    const safetyGoodness = metrics.safety;

    const w = DATA.weights;
    const score =
      crowdGoodness * w.crowd +
      waitingGoodness * w.waiting +
      safetyGoodness * w.safety +
      transportGoodness * w.transport +
      costGoodness * w.cost;

    return Math.round(score);
  }

  function bestPlanFor(eventId) {
    const scores = DATA.plans.map((p) => {
      const metrics = DATA.outcomes[`${eventId}-${p.id}`];
      return { planId: p.id, score: computeScore(metrics), metrics };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores;
  }

  function renderResult() {
    const event = DATA.events.find((e) => e.id === state.eventId);

    $("#resultKicker").textContent = `${event.emoji}  ${event.name}`;
    $("#resultTitle").textContent = "Simulation outcome";

    const allScores = bestPlanFor(state.eventId);
    const winner = allScores[0];

    // ----- Best plan banner -----
    const winnerPlan = DATA.plans.find((p) => p.id === winner.planId);
    $("#bestPlanBanner").innerHTML = `
      <div class="bp-left">
        <div class="bp-icon">★</div>
        <div>
          <div class="bp-label">Recommended plan</div>
          <div class="bp-name">Plan ${winnerPlan.id} · ${winnerPlan.name}</div>
        </div>
      </div>
      <div class="bp-score">
        <b>${winner.score}</b>
        <span>Resilience score</span>
      </div>
    `;

    // ----- Comparison table -----
    const rows = [
      { key: "crowd",     label: "Crowd / congestion", unit: "%" },
      { key: "waiting",   label: "Waiting time",       unit: " min" },
      { key: "transport", label: "Transport pressure", unit: "%" },
      { key: "safety",    label: "Safety index",       unit: "" },
      { key: "cost",      label: "Resource cost",      unit: "" },
    ];

    // Find best/worst per row for coloring
    const perRowBest = {};
    const perRowWorst = {};
    rows.forEach((r) => {
      const values = DATA.plans.map((p) => DATA.outcomes[`${state.eventId}-${p.id}`][r.key]);
      const lowerBetter = LOWER_IS_BETTER.includes(r.key);
      const sorted = [...values].sort((a, b) => (lowerBetter ? a - b : b - a));
      perRowBest[r.key] = sorted[0];
      perRowWorst[r.key] = sorted[sorted.length - 1];
    });

    const tbody = $("#compareBody");
    tbody.innerHTML =
      rows
        .map((r) => {
          const cells = DATA.plans
            .map((p) => {
              const val = DATA.outcomes[`${state.eventId}-${p.id}`][r.key];
              let cls = "v-val";
              if (val === perRowBest[r.key]) cls += " is-best";
              else if (val === perRowWorst[r.key]) cls += " is-worst";
              else cls += " is-mid";

              const display = r.key === "waiting" ? val : val + (r.unit || "");
              return `<td><span class="${cls}">${display}</span></td>`;
            })
            .join("");
          return `<tr><td>${r.label}</td>${cells}</tr>`;
        })
        .join("") +
      `<tr class="row-score">
        <td>Resilience score / 100</td>
        ${allScores
          .sort((a, b) => a.planId.localeCompare(b.planId))
          .map((s) => {
            const isBest = s.planId === winner.planId;
            return `<td><span class="v-val ${isBest ? "is-best" : "is-mid"}">${s.score}</span></td>`;
          })
          .join("")}
      </tr>`;

    // Highlight winning column header
    $$("#compareTable thead th[data-plan]").forEach((th) => {
      th.classList.toggle("is-best", th.dataset.plan === winner.planId);
    });

    // ----- AI insight -----
    $("#aiInsightText").textContent = DATA.insights[state.eventId];

    goToStep(3);
  }

  /* ---------- RESET ---------- */
  function resetToStart() {
    state.eventId = null;
    state.planId = null;

    $$("#eventGrid .event-card").forEach((c) => c.classList.remove("is-active"));
    $("#eventBrief").hidden = true;
    $("#toStep2").disabled = true;

    $("#planList").innerHTML = "";
    $("#runSim").disabled = true;

    $("#compareBody").innerHTML = "";
    $("#bestPlanBanner").innerHTML = "";
    $("#aiInsightText").textContent = "";

    goToStep(1);
  }

  /* ---------- WIRE UP ---------- */
  function init() {
    renderEvents();

    $("#toStep2").addEventListener("click", () => {
      renderPlans();
      goToStep(2);
    });

    $$("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Number(btn.dataset.back)));
    });

    $("#runSim").addEventListener("click", renderResult);

    $("#newSim").addEventListener("click", resetToStart);
    $("#newSim2").addEventListener("click", resetToStart);

    $("#acceptPlan").addEventListener("click", () => {
      // In a real product this would commit the plan.
      // Here we just show a confirmation state.
      const btn = $("#acceptPlan");
      btn.textContent = "Plan accepted ✓";
      btn.disabled = true;
      btn.style.opacity = "0.7";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
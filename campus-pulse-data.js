/* =====================================================================
   CAMPUS PULSE — DATA
   Scenario definitions, response plans, and simulation parameters.
   All data is simulated. No backend, no live feed.
   ===================================================================== */

window.PULSE_DATA = {

  /* ---------- EVENTS ---------- */
  events: [
    {
      id: "canteen",
      emoji: "🍽",
      name: "Canteen Rush",
      tag: "Peak load",
      briefing:
        "Lunch hour surge expected. Canteen occupancy to exceed 90% within 8 minutes. Overflow likely to spill into Academic corridors.",
      risk: "High",
      riskColor: "bad",
      category: "crowd",
    },
    {
      id: "class",
      emoji: "🎓",
      name: "Class Rush",
      tag: "Period change",
      briefing:
        "Simultaneous class dismissal across two blocks. Corridors and stairwells will saturate for ~6 minutes before dispersing.",
      risk: "High",
      riskColor: "bad",
      category: "crowd",
    },
    {
      id: "rain",
      emoji: "🌧",
      name: "Heavy Rain",
      tag: "Weather event",
      briefing:
        "Sudden downpour across campus. Open walkways become unusable. Shelter zones and covered corridors absorb displaced movement.",
      risk: "Medium",
      riskColor: "warn",
      category: "environment",
    },
    {
      id: "medical",
      emoji: "🚨",
      name: "Medical Emergency",
      tag: "Priority",
      briefing:
        "Medical incident reported near Block C. Security and ambulance routing required immediately. Corridor clearance critical.",
      risk: "Critical",
      riskColor: "bad",
      category: "emergency",
    },
  ],

  /* ---------- RESPONSE PLANS ---------- */
  plans: [
    {
      id: "A",
      name: "No Action",
      short: "Baseline response",
      description:
        "Campus operates as usual. No additional routing, staffing, or guidance issued.",
      tone: "muted",
    },
    {
      id: "B",
      name: "Basic Response",
      short: "Manual intervention",
      description:
        "Staff informed, primary corridor reopened. Standard procedure applied without AI routing.",
      tone: "accent",
    },
    {
      id: "C",
      name: "AI-Optimized Response",
      short: "Coordinated routing",
      description:
        "AI re-routes traffic, deploys staff to hotspots, and pushes targeted student notifications in real time.",
      tone: "ok",
    },
  ],

  /* ---------- SIMULATION OUTCOMES PER (event, plan) ---------- */

  outcomes: {
    /* Canteen Rush */
    "canteen-A": {
      crowd: 82, waiting: 18, transport: 70, safety: 45, cost: 12,
      notes: "Overflow corridors, queue >15 min, no intervention."
    },
    "canteen-B": {
      crowd: 58, waiting: 10, transport: 55, safety: 68, cost: 45,
      notes: "Manual staffing reduces queue; corridors still congested."
    },
    "canteen-C": {
      crowd: 34, waiting: 4,  transport: 30, safety: 92, cost: 62,
      notes: "Rerouting and staggered release keep all zones under threshold."
    },

    /* Class Rush */
    "class-A": {
      crowd: 78, waiting: 14, transport: 55, safety: 50, cost: 10,
      notes: "Stairwell saturation, potential safety concern."
    },
    "class-B": {
      crowd: 55, waiting: 8,  transport: 42, safety: 72, cost: 38,
      notes: "Manual stagger helps; some bottleneck at Block A exits."
    },
    "class-C": {
      crowd: 30, waiting: 3,  transport: 22, safety: 95, cost: 55,
      notes: "Automatic release coordination empties all corridors <3 min."
    },

    /* Heavy Rain */
    "rain-A": {
      crowd: 68, waiting: 22, transport: 78, safety: 40, cost: 8,
      notes: "Students stranded, transport delays escalate."
    },
    "rain-B": {
      crowd: 48, waiting: 12, transport: 60, safety: 65, cost: 42,
      notes: "Covered walkways partially used; some exposure remains."
    },
    "rain-C": {
      crowd: 28, waiting: 5,  transport: 35, safety: 88, cost: 58,
      notes: "Shuttle service and awnings deployed; minimal exposure."
    },

    /* Medical Emergency */
    "medical-A": {
      crowd: 85, waiting: 25, transport: 88, safety: 35, cost: 15,
      notes: "Corridor blocked, ambulance delayed >4 min."
    },
    "medical-B": {
      crowd: 55, waiting: 12, transport: 55, safety: 72, cost: 45,
      notes: "Security clears route manually; partial delay persists."
    },
    "medical-C": {
      crowd: 22, waiting: 3,  transport: 18, safety: 98, cost: 60,
      notes: "Priority route cleared in 40 seconds; full corridor lockdown."
    },
  },

  /* ---------- AI INSIGHT TEMPLATES ---------- */
  insights: {
    canteen:
      "AI recommends Plan C because coordinated rerouting keeps corridor congestion below 40% and reduces queue time by 78%. Cost impact is moderate and justified by sustained safety gains.",
    class:
      "AI recommends Plan C because automatic stagger scheduling eliminates stairwell saturation entirely. The 15% cost premium over Plan B is offset by a 23-point resilience gain.",
    rain:
      "AI recommends Plan C because shuttle + awning deployment minimizes outdoor exposure and prevents transport cascade. Plan B leaves ~35% of students exposed.",
    medical:
      "AI recommends Plan C because corridor lockdown at T+0 saves critical seconds. Both A and B introduce delays incompatible with emergency protocol.",
  },

  /* ---------- WEIGHTS (must sum to 1.0) ---------- */
  weights: {
    crowd: 0.30,
    waiting: 0.25,
    safety: 0.20,
    transport: 0.15,
    cost: 0.10,
  },

};
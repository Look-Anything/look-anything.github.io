/* ==========================================================================
   LookAnything Project Page — Interactive Explorer, Leaderboard & Comparator
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. HoliGaze 9-Task / 5-Dimension Taxonomy Browser (Section 2.1 & 2.3)
     ------------------------------------------------------------------------ */
  const TAXONOMY = [
    {
      id: "GTL-T2P",
      dim: "target",
      meta: "openQA · Point L₂ ↓ · 15.1%",
      name: "Gaze Target Localization (Point)",
      desc: "Given a textual reference of the source person (plus box-referred GTL-B2P in training), regress the normalized 2D gaze target coordinate (x, y)."
    },
    {
      id: "GTL-T2B",
      dim: "target",
      meta: "openQA · Box mIoU ↑ · 17.2%",
      name: "Gaze Target Localization (Box)",
      desc: "Given a textual reference of the observer, localize the attended object instance with a normalized bounding box [x₁, y₁, x₂, y₂]."
    },
    {
      id: "GTD",
      dim: "target",
      meta: "MCQ + openQA · Acc / R-L / B-4 · 13.3%",
      name: "Gaze Target Description",
      desc: "Select or generate a fine-grained natural-language description of the specific entity being looked at by the referred observer."
    },
    {
      id: "GSL",
      dim: "source",
      meta: "openQA · Box mIoU ↑ · 11.9%",
      name: "Gaze Source Localization",
      desc: "Given a textual reference to a target entity, predict head bounding boxes for all observers currently attending to that target."
    },
    {
      id: "GSD",
      dim: "source",
      meta: "MCQ + openQA · Set-F1 / R-L / B-4 · 11.9%",
      name: "Gaze Source Description",
      desc: "Identify all observers looking at a specified target via multi-select MCQ or open-ended visual attribute descriptions."
    },
    {
      id: "GDO",
      dim: "spatial",
      meta: "MCQ · Acc ↑ · 10.0%",
      name: "Gaze Depth Orientation",
      desc: "Reason in 3D camera-centric space to judge whether the observer’s head is closer to or farther from the camera than the gaze target."
    },
    {
      id: "GDR",
      dim: "spatial",
      meta: "MCQ · Acc ↑ · 10.0%",
      name: "Gaze Direction Recognition",
      desc: "Classify the spatial gaze vector into four camera-relative directional quadrants (e.g., left-closer, left-farther, right-closer, right-farther)."
    },
    {
      id: "GCD",
      dim: "social",
      meta: "Binary MCQ · Acc ↑ · 5.6%",
      name: "Gaze Contact Detection",
      desc: "Determine whether a specified person in a multi-person scene is making direct mutual eye contact with the camera wearer / robot."
    },
    {
      id: "ARR",
      dim: "answer",
      meta: "openQA · Refusal F1 ↑ · 3.0%",
      name: "Ambiguous Reference Recognition",
      desc: "Refuse ill-posed queries when the referring expression matches multiple candidate entities in the visual scene."
    },
    {
      id: "PV",
      dim: "answer",
      meta: "openQA · Refusal F1 ↑ · 2.0%",
      name: "Presence Verification",
      desc: "Refuse unanswerable localization queries when the person’s attended gaze target lies outside the visible camera frame."
    }
  ];

  const BENCH_QUOTAS = [
    { name: "GTL-T2B", pct: 17.2, color: "#e11d48" },
    { name: "GTL-T2P", pct: 15.1, color: "#f43f5e" },
    { name: "GTD", pct: 13.3, color: "#fb7185" },
    { name: "GSL", pct: 11.9, color: "#2563eb" },
    { name: "GSD", pct: 11.9, color: "#3b82f6" },
    { name: "GDO", pct: 10.0, color: "#7c3aed" },
    { name: "GDR", pct: 10.0, color: "#8b5cf6" },
    { name: "GCD", pct: 5.6, color: "#d97706" },
    { name: "ARR", pct: 3.0, color: "#16a34a" },
    { name: "PV", pct: 2.0, color: "#22c55e" }
  ];

  function setupTaxonomyAndQuotas() {
    const grid = document.getElementById("taxonomy-grid");
    const pills = document.querySelectorAll("#taxonomy-tabs .tab-pill");
    if (grid) {
      const render = (dim) => {
        const items = dim === "all" ? TAXONOMY : TAXONOMY.filter((t) => t.dim === dim);
        grid.innerHTML = items.map((item) => `
          <div class="cap-item st-${item.dim}">
            <div class="cap-top">
              <span class="cap-id">${item.id}</span>
              <span class="cap-meta">${item.meta}</span>
            </div>
            <div class="cap-name">${item.name}</div>
            <div class="cap-desc">${item.desc}</div>
          </div>
        `).join("");
      };
      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          pills.forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          render(pill.dataset.dim);
        });
      });
      render("all");
    }

    const quotaBox = document.getElementById("quota-bars");
    if (quotaBox) {
      const maxPct = Math.max(...BENCH_QUOTAS.map((q) => q.pct));
      quotaBox.innerHTML = BENCH_QUOTAS.map((q) => `
        <div class="ctx-row">
          <div class="ctx-name">${q.name}</div>
          <div class="ctx-bar-wrap">
            <div class="ctx-bar-fill" style="width:${((q.pct / maxPct) * 100).toFixed(1)}%;background:${q.color}"></div>
          </div>
          <div class="ctx-val">${q.pct.toFixed(1)}%</div>
        </div>
      `).join("");
    }
  }

  /* ------------------------------------------------------------------------
     2. HoliGaze-Bench 34-Model Leaderboard (Table 2 & Appendix B.1.1)
     ------------------------------------------------------------------------ */
  const ALL_COLUMNS = [
    { idx: 0, group: "Avg.", sub: "Avg.", label: "openQA ↑", low: false, bar: true, barMax: 0.55 },
    { idx: 1, group: "Avg.", sub: "Avg.", label: "MCQ ↑", low: false, bar: true, barMax: 0.90 },
    { idx: 2, group: "GTL", sub: "T2P", label: "L₂ ↓", low: true },
    { idx: 3, group: "GTL", sub: "T2B", label: "mIoU ↑", low: false },
    { idx: 4, group: "GTD", sub: "MCQ", label: "Acc ↑", low: false },
    { idx: 5, group: "GTD", sub: "openQA", label: "R-L ↑", low: false },
    { idx: 6, group: "GTD", sub: "openQA", label: "B-4 ↑", low: false },
    { idx: 7, group: "GSL", sub: "openQA", label: "mIoU ↑", low: false },
    { idx: 8, group: "GSD", sub: "MCQ", label: "F1 ↑", low: false },
    { idx: 9, group: "GSD", sub: "openQA", label: "R-L ↑", low: false },
    { idx: 10, group: "GSD", sub: "openQA", label: "B-4 ↑", low: false },
    { idx: 11, group: "GDO", sub: "MCQ", label: "Acc ↑", low: false },
    { idx: 12, group: "GDR", sub: "MCQ", label: "Acc ↑", low: false },
    { idx: 13, group: "GCD", sub: "MCQ", label: "Acc ↑", low: false },
    { idx: 14, group: "ARR", sub: "openQA", label: "F1 ↑", low: false },
    { idx: 15, group: "PV", sub: "openQA", label: "F1 ↑", low: false }
  ];

  const VIEW_SUBSETS = {
    all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    grounding: [0, 1, 2, 3, 7],
    description: [0, 1, 4, 5, 6, 8, 9, 10],
    reasoning: [0, 1, 11, 12, 13, 14, 15]
  };

  const MODELS = [
    ["Gemini-2.5-Flash", "closed", [0.111, 0.537, 0.237, 0.032, 0.432, 0.152, 0.065, 0.074, 0.493, 0.267, 0.109, 0.557, 0.385, 0.816, 0.000, 0.111]],
    ["Gemini-2.5-Pro", "closed", [0.191, 0.644, 0.189, 0.085, 0.532, 0.159, 0.065, 0.197, 0.588, 0.227, 0.109, 0.792, 0.575, 0.731, 0.049, 0.529]],
    ["Gemini-3.7-Flash", "closed", [0.298, 0.770, 0.131, 0.038, 0.609, 0.237, 0.149, 0.047, 0.717, 0.276, 0.124, 0.901, 0.785, 0.840, 0.621, 0.630]],
    ["Gemini-3.1-Pro", "closed", [0.196, 0.746, 0.194, 0.029, 0.581, 0.137, 0.102, 0.040, 0.742, 0.204, 0.107, 0.875, 0.734, 0.800, 0.140, 0.642]],
    ["DeepSeek-V4-Flash", "closed", [0.181, 0.394, 0.341, 0.023, 0.258, 0.125, 0.115, 0.026, 0.314, 0.137, 0.067, 0.615, 0.292, 0.493, 0.000, 0.797]],
    ["GLM-5.3-Flash", "closed", [0.170, 0.639, 0.254, 0.090, 0.515, 0.175, 0.097, 0.247, 0.606, 0.277, 0.117, 0.770, 0.666, 0.640, 0.095, 0.180]],
    ["Grok-4.6", "closed", [0.250, 0.645, 0.241, 0.076, 0.505, 0.236, 0.153, 0.128, 0.586, 0.205, 0.092, 0.785, 0.642, 0.707, 0.404, 0.533]],
    ["Qwen3-Max", "closed", [0.192, 0.405, 0.342, 0.019, 0.271, 0.161, 0.096, 0.014, 0.306, 0.189, 0.086, 0.580, 0.274, 0.593, 0.000, 0.800]],
    ["GPT-5.6-Sol", "closed", [0.256, 0.641, 0.176, 0.116, 0.510, 0.257, 0.179, 0.248, 0.513, 0.267, 0.122, 0.785, 0.573, 0.824, 0.048, 0.672]],
    ["Qwen3-VL-2B", "general", [0.087, 0.465, 0.387, 0.040, 0.394, 0.210, 0.116, 0.081, 0.483, 0.128, 0.061, 0.550, 0.237, 0.660, 0.000, 0.011]],
    ["Qwen3.5-2B", "general", [0.142, 0.421, 0.372, 0.070, 0.377, 0.241, 0.153, 0.104, 0.340, 0.140, 0.045, 0.461, 0.209, 0.720, 0.182, 0.126]],
    ["InternVL3-2B", "general", [0.100, 0.453, 0.610, 0.020, 0.370, 0.212, 0.119, 0.045, 0.444, 0.235, 0.092, 0.532, 0.249, 0.671, 0.000, 0.000]],
    ["InternVL3.5-2B", "general", [0.113, 0.463, 0.536, 0.005, 0.434, 0.195, 0.123, 0.177, 0.495, 0.218, 0.081, 0.590, 0.196, 0.602, 0.000, 0.000]],
    ["RynnBrain-2B", "embodied", [0.146, 0.557, 0.369, 0.000, 0.494, 0.153, 0.115, 0.000, 0.540, 0.043, 0.053, 0.711, 0.334, 0.704, 0.000, 0.658]],
    ["Embodied-R1-3B", "embodied", [0.194, 0.469, 0.765, 0.004, 0.389, 0.136, 0.080, 0.022, 0.438, 0.160, 0.069, 0.546, 0.292, 0.682, 0.115, 0.777]],
    ["Qwen3-VL-4B", "general", [0.147, 0.550, 0.329, 0.058, 0.496, 0.223, 0.127, 0.121, 0.568, 0.223, 0.102, 0.545, 0.352, 0.789, 0.000, 0.233]],
    ["Qwen2.5-VL-7B", "general", [0.143, 0.506, 0.591, 0.008, 0.403, 0.142, 0.066, 0.038, 0.445, 0.174, 0.074, 0.522, 0.385, 0.773, 0.261, 0.244]],
    ["MiMo-Embodied-7B", "embodied", [0.114, 0.210, 0.859, 0.004, 0.120, 0.101, 0.042, 0.005, 0.001, 0.121, 0.031, 0.268, 0.044, 0.616, 0.000, 0.496]],
    ["Pelican-VL-7B", "embodied", [0.088, 0.532, 0.732, 0.000, 0.379, 0.189, 0.107, 0.000, 0.450, 0.128, 0.064, 0.721, 0.352, 0.758, 0.118, 0.012]],
    ["RoboBrain-2.0-7B", "embodied", [0.081, 0.561, 0.511, 0.004, 0.391, 0.184, 0.095, 0.002, 0.391, 0.180, 0.082, 0.757, 0.535, 0.731, 0.025, 0.000]],
    ["VeBrain-7B", "embodied", [0.226, 0.496, 0.476, 0.026, 0.399, 0.285, 0.148, 0.058, 0.508, 0.121, 0.052, 0.449, 0.362, 0.760, 0.157, 0.760]],
    ["InternVL3-8B", "general", [0.237, 0.548, 0.326, 0.044, 0.468, 0.200, 0.109, 0.179, 0.490, 0.264, 0.107, 0.551, 0.449, 0.780, 0.025, 0.777]],
    ["InternVL3.5-8B", "general", [0.207, 0.467, 0.227, 0.088, 0.452, 0.159, 0.108, 0.177, 0.304, 0.183, 0.088, 0.613, 0.241, 0.724, 0.000, 0.734]],
    ["Embodied-R1.5-8B", "embodied", [0.203, 0.617, 0.246, 0.068, 0.508, 0.215, 0.128, 0.241, 0.611, 0.164, 0.091, 0.725, 0.506, 0.736, 0.000, 0.583]],
    ["RoboBrain-2.5-8B", "embodied", [0.188, 0.569, 0.319, 0.049, 0.488, 0.132, 0.053, 0.237, 0.566, 0.210, 0.081, 0.589, 0.411, 0.793, 0.000, 0.603]],
    ["RynnBrain-9B", "embodied", [0.165, 0.322, 0.687, 0.007, 0.154, 0.091, 0.036, 0.068, 0.149, 0.131, 0.049, 0.527, 0.198, 0.580, 0.000, 0.779]],
    ["Qwen3.5-27B", "general", [0.227, 0.498, 0.173, 0.137, 0.339, 0.262, 0.167, 0.340, 0.060, 0.210, 0.095, 0.724, 0.576, 0.791, 0.049, 0.467]],
    ["Qwen3.6-27B", "general", [0.239, 0.487, 0.229, 0.112, 0.340, 0.270, 0.181, 0.395, 0.048, 0.211, 0.095, 0.724, 0.534, 0.789, 0.025, 0.498]],
    ["Qwen3.8-27B", "general", [0.232, 0.401, 0.223, 0.152, 0.159, 0.282, 0.179, 0.294, 0.032, 0.221, 0.085, 0.640, 0.365, 0.811, 0.025, 0.539]],
    ["Hy-Embodied-30B", "embodied", [0.062, 0.603, 0.262, 0.000, 0.434, 0.079, 0.100, 0.002, 0.542, 0.171, 0.079, 0.748, 0.500, 0.791, 0.000, 0.000]],
    ["Qwen3-VL-32B", "general", [0.228, 0.641, 0.255, 0.108, 0.569, 0.221, 0.135, 0.366, 0.667, 0.239, 0.103, 0.693, 0.482, 0.796, 0.000, 0.529]],
    ["InternVL3-38B", "general", [0.163, 0.655, 0.336, 0.092, 0.552, 0.185, 0.112, 0.253, 0.592, 0.259, 0.113, 0.755, 0.557, 0.818, 0.025, 0.197]],
    ["InternVL3.5-38B", "general", [0.178, 0.577, 0.694, 0.092, 0.462, 0.205, 0.098, 0.290, 0.478, 0.210, 0.088, 0.728, 0.429, 0.787, 0.000, 0.358]],
    ["LookAnything (2B)", "ours", [0.518, 0.852, 0.094, 0.333, 0.764, 0.459, 0.283, 0.610, 0.865, 0.466, 0.260, 0.924, 0.863, 0.847, 0.805, 0.932]]
  ].map(([name, category, scores], order) => ({ name, category, scores, order }));

  const CAT_LABELS = {
    ours: "Ours",
    closed: "Closed",
    general: "General",
    embodied: "Embodied"
  };

  function setupLeaderboard() {
    const thead = document.getElementById("lb-thead");
    const tbody = document.getElementById("lb-tbody");
    const countSpan = document.getElementById("lb-count-summary");
    const searchInput = document.getElementById("lb-search");
    const catChips = document.querySelectorAll("#lb-cat-filters .filter-chip");
    const viewTabs = document.querySelectorAll(".view-tab");
    if (!thead || !tbody) return;

    const state = {
      category: "all",
      query: "",
      view: "all",
      col: 0,
      bestFirst: true
    };

    function visibleModels() {
      const q = state.query.trim().toLowerCase();
      return MODELS.filter((m) => {
        const catOk =
          state.category === "all" ||
          m.category === state.category ||
          ((state.category === "general" || state.category === "open_all") && m.category === "ours") ||
          (state.category === "open_all" && (m.category === "general" || m.category === "embodied"));
        const qOk = !q || m.name.toLowerCase().includes(q);
        return catOk && qOk;
      });
    }

    function renderTable() {
      const colIndices = VIEW_SUBSETS[state.view] || VIEW_SUBSETS.all;
      if (!colIndices.includes(state.col)) {
        state.col = colIndices[0];
        state.bestFirst = true;
      }
      const cols = colIndices.map((idx) => ALL_COLUMNS[idx]);
      const rows = visibleModels();

      // Compute best & second-best in the currently visible model set
      const colRanks = {};
      cols.forEach((col) => {
        const uniq = Array.from(new Set(rows.map((r) => r.scores[col.idx].toFixed(3))))
          .map(Number)
          .sort((a, b) => (col.low ? a - b : b - a));
        colRanks[col.idx] = {
          best: uniq[0],
          second: uniq.length > 1 ? uniq[1] : null
        };
      });

      const sortCol = ALL_COLUMNS[state.col];
      rows.sort((a, b) => {
        const va = a.scores[state.col];
        const vb = b.scores[state.col];
        if (va !== vb) {
          const cmp = va < vb ? -1 : 1;
          const dir = sortCol.low ? 1 : -1;
          return cmp * dir * (state.bestFirst ? 1 : -1);
        }
        return a.order - b.order;
      });

      if (countSpan) {
        countSpan.textContent = `Showing ${rows.length} of ${MODELS.length} models`;
      }

      // Build grouped top header row
      const groups = [];
      cols.forEach((col) => {
        const prev = groups[groups.length - 1];
        if (prev && prev.name === col.group) prev.span += 1;
        else groups.push({ name: col.group, span: 1 });
      });

      thead.innerHTML = `
        <tr>
          <th class="col-rank" rowspan="2">#</th>
          <th class="col-model" rowspan="2">Model</th>
          ${groups.map((g) => `<th colspan="${g.span}">${g.name}</th>`).join("")}
        </tr>
        <tr>
          ${cols.map((col) => {
            const active = col.idx === state.col;
            const arrow = active ? (state.bestFirst ? " ▼" : " ▲") : "";
            return `<th class="${active ? "sorted" : ""}" data-col="${col.idx}">
              <span class="th-submode">${col.sub}</span>
              <span>${col.label}${arrow}</span>
            </th>`;
          }).join("")}
        </tr>
      `;

      thead.querySelectorAll("th[data-col]").forEach((th) => {
        th.addEventListener("click", () => {
          const idx = Number(th.dataset.col);
          if (state.col === idx) state.bestFirst = !state.bestFirst;
          else {
            state.col = idx;
            state.bestFirst = true;
          }
          renderTable();
        });
      });

      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 2}" style="text-align:center;padding:28px;color:var(--ink-muted)">No models match your search criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = rows.map((m, i) => {
        const cells = cols.map((col) => {
          const val = m.scores[col.idx];
          const formatted = val.toFixed(3);
          const rk = colRanks[col.idx];
          let cls = "";
          if (rows.length > 1 && Math.abs(val - rk.best) < 1e-6) cls = "val-best";
          else if (rows.length > 2 && rk.second !== null && Math.abs(val - rk.second) < 1e-6) cls = "val-second";

          if (col.bar) {
            const pct = Math.max(5, Math.min(100, (val / col.barMax) * 100));
            return `<td class="val-cell">
              <div class="overall-bar-cell">
                <div class="mini-bar"><div class="mini-bar-fill" style="width:${pct.toFixed(0)}%"></div></div>
                <span class="${cls}">${formatted}</span>
              </div>
            </td>`;
          }
          return `<td class="val-cell"><span class="${cls}">${formatted}</span></td>`;
        }).join("");

        return `
          <tr class="${m.category === "ours" ? "ours-row" : ""}">
            <td class="col-rank">${i + 1}</td>
            <td class="col-model">
              <div class="model-cell">
                <span class="cat-badge-mini cb-${m.category}">${CAT_LABELS[m.category]}</span>
                <span>${m.name}</span>
              </div>
            </td>
            ${cells}
          </tr>
        `;
      }).join("");
    }

    catChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        catChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.category = chip.dataset.cat;
        renderTable();
      });
    });

    viewTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        viewTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        state.view = tab.dataset.view;
        renderTable();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.query = e.target.value;
        renderTable();
      });
    }

    renderTable();
  }

  /* ------------------------------------------------------------------------
     3. Interactive Multi-Model Capability Profile Comparator (5 Dimensions)
     ------------------------------------------------------------------------ */
  const SERIES_COLORS = [
    "#c8333b", "#0072b2", "#009e73", "#d55e00", "#7c3aed",
    "#d97706", "#0f766e", "#4338ca"
  ];

  const PRESETS = {
    family4: ["LookAnything (2B)", "Gemini-3.7-Flash", "GPT-5.6-Sol", "Qwen3.8-27B", "Embodied-R1.5-8B"],
    backbone: ["LookAnything (2B)", "Qwen3-VL-2B", "Qwen3-VL-4B", "Qwen3-VL-32B"],
    embodied: ["LookAnything (2B)", "Embodied-R1.5-8B", "RoboBrain-2.5-8B", "VeBrain-7B", "Hy-Embodied-30B"],
    reset: ["LookAnything (2B)", "Gemini-3.7-Flash"]
  };

  // Compute 5 dimension scores in [0, 1] directly from Table 2 metrics
  function profileDims(m) {
    const s = m.scores;
    const t2pScore = Math.max(0, 1 - s[2]); // 1 - L2
    const targetDim = (t2pScore + s[3] + s[4] + s[5]) / 4; // T2P (1-L2), T2B mIoU, GTD Acc, GTD R-L
    const sourceDim = (s[7] + s[8] + s[9]) / 3; // GSL mIoU, GSD MCQ F1, GSD R-L
    const spatialDim = (s[11] + s[12]) / 2; // GDO Acc, GDR Acc
    const socialDim = s[13]; // GCD Acc
    const answerDim = (s[14] + s[15]) / 2; // ARR F1, PV F1
    return [targetDim, sourceDim, spatialDim, socialDim, answerDim];
  }

  function setupComparator() {
    const addSelect = document.getElementById("comp-add-select");
    const chipsBox = document.getElementById("comp-chips");
    const presetBtns = document.querySelectorAll(".preset-btn");
    const svgBox = document.getElementById("comp-svg-container");
    const takeawayBox = document.getElementById("comp-takeaway-list");
    if (!addSelect || !svgBox) return;

    let selected = [...PRESETS.family4];
    const axisLabels = ["Target", "Source", "Spatial", "Social (GCD)", "Answerability"];

    function refreshDropdown() {
      const groups = [
        { key: "ours", label: "Proposed Foundation Model" },
        { key: "closed", label: "Closed-Source MLLMs (9)" },
        { key: "general", label: "Open General-Purpose (14)" },
        { key: "embodied", label: "Open Embodied VLMs (10)" }
      ];
      let html = `<option value="">+ Add model to compare (${selected.length} selected)…</option>`;
      groups.forEach((g) => {
        const avail = MODELS.filter((m) => m.category === g.key && !selected.includes(m.name));
        if (avail.length) {
          html += `<optgroup label="${g.label}">`;
          html += avail.map((m) => `<option value="${m.name}">${m.name} (MCQ ${m.scores[1].toFixed(3)} · openQA ${m.scores[0].toFixed(3)})</option>`).join("");
          html += `</optgroup>`;
        }
      });
      addSelect.innerHTML = html;
      addSelect.value = "";
    }

    function render() {
      refreshDropdown();
      const chosen = selected
        .map((name, i) => ({
          model: MODELS.find((m) => m.name === name),
          color: SERIES_COLORS[i % SERIES_COLORS.length]
        }))
        .filter((x) => x.model);

      if (chipsBox) {
        const lockRemove = chosen.length <= 1;
        chipsBox.innerHTML = chosen.map(({ model, color }) => `
          <span class="comp-model-chip" style="border-color:${color}66">
            <span class="comp-chip-dot" style="background:${color}"></span>
            <span>${model.name}</span>
            <button type="button" class="comp-chip-remove" data-name="${model.name}" ${lockRemove ? "disabled" : ""} aria-label="Remove ${model.name}">×</button>
          </span>
        `).join("");
        chipsBox.querySelectorAll(".comp-chip-remove").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (selected.length <= 1) return;
            selected = selected.filter((n) => n !== btn.dataset.name);
            render();
          });
        });
      }

      // Render parallel capability profile SVG
      const W = 560, H = 250;
      const padL = 44, padR = 26, padT = 20, padB = 38;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const xAt = (i) => padL + (i / (axisLabels.length - 1)) * plotW;
      const yAt = (v) => padT + (1 - Math.max(0, Math.min(1, v))) * plotH;

      const gridLines = [0, 0.25, 0.5, 0.75, 1.0].map((g) => {
        const y = yAt(g);
        return `
          <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="${g === 0 ? "none" : "3,3"}" />
          <text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" font-family="JetBrains Mono, monospace" fill="#64748b">${g.toFixed(2)}</text>
        `;
      }).join("");

      const xLabels = axisLabels.map((lbl, i) => {
        const x = xAt(i);
        return `
          <line x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}" stroke="#f1f5f9" />
          <text x="${x}" y="${H - 12}" text-anchor="middle" font-size="11" font-weight="650" fill="#334155">${lbl}</text>
        `;
      }).join("");

      const seriesSvg = chosen.map(({ model, color }) => {
        const vals = profileDims(model);
        const pts = vals.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
        const isOurs = model.category === "ours";
        const dots = vals.map((v, i) => `
          <circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="${isOurs ? 4.8 : 3.6}" fill="${color}" stroke="#ffffff" stroke-width="1.5">
            <title>${model.name} · ${axisLabels[i]}: ${v.toFixed(3)}</title>
          </circle>
        `).join("");
        return `
          <polyline fill="none" stroke="${color}" stroke-width="${isOurs ? 3 : 2}" stroke-opacity="${isOurs ? 0.98 : 0.82}" points="${pts}" />
          ${dots}
        `;
      }).join("");

      svgBox.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" role="img" aria-label="Capability profile comparison across 5 HoliGaze dimensions">
          ${gridLines}
          ${xLabels}
          ${seriesSvg}
        </svg>
      `;

      if (takeawayBox) {
        takeawayBox.innerHTML = chosen.map(({ model, color }) => {
          const s = model.scores;
          return `
            <div class="comp-stat-row" style="border-left:3px solid ${color}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <strong style="color:var(--ink-strong)">${model.name}</strong>
                <span class="cat-badge-mini cb-${model.category}">${CAT_LABELS[model.category]}</span>
              </div>
              <div style="font-family:var(--font-mono);font-size:0.74rem;color:var(--ink-muted)">
                openQA <b>${s[0].toFixed(3)}</b> · MCQ <b>${s[1].toFixed(3)}</b> · T2P L₂ <b>${s[2].toFixed(3)}</b> · T2B <b>${s[3].toFixed(3)}</b> · GSL <b>${s[7].toFixed(3)}</b>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    addSelect.addEventListener("change", () => {
      if (addSelect.value && !selected.includes(addSelect.value)) {
        selected.push(addSelect.value);
        render();
      }
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = PRESETS[btn.dataset.preset];
        if (p) {
          selected = [...p];
          render();
        }
      });
    });

    render();
  }

  /* ------------------------------------------------------------------------
     4. Navigation, Lightbox, Videos & Copy BibTeX
     ------------------------------------------------------------------------ */
  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupLightbox() {
    const modal = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const cap = document.getElementById("lightbox-cap");
    const closeBtn = document.getElementById("lightbox-close");
    if (!modal || !img) return;

    const close = () => {
      modal.classList.remove("open");
      img.src = "";
    };

    document.querySelectorAll("[data-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const innerImg = btn.querySelector("img");
        const frame = btn.closest(".fig-frame");
        const figCap = frame ? frame.querySelector(".fig-caption") : null;
        img.src = btn.dataset.zoom;
        img.alt = innerImg ? innerImg.alt : "";
        if (cap) cap.textContent = figCap ? figCap.textContent.replace(/\s+/g, " ").trim() : (innerImg ? innerImg.alt : "");
        modal.classList.add("open");
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });
  }

  function attachVideo(video, button) {
    if (!video || !button) return;
    const show = () => { button.hidden = false; };
    const hide = () => { button.hidden = true; };
    button.addEventListener("click", () => {
      const p = video.play();
      if (p) p.catch(() => show());
    });
    video.addEventListener("play", hide);
    video.addEventListener("pause", () => {
      if (video.currentTime > 0 && !video.ended) return;
      show();
    });
    video.addEventListener("error", () => {
      const note = video.parentElement.querySelector(".media-error");
      if (note) note.classList.add("show");
      show();
    });
  }

  function setupVideos() {
    attachVideo(document.getElementById("hero-video"), document.getElementById("hero-play"));

    document.querySelectorAll("[data-switcher]").forEach((root) => {
      const video = root.querySelector("video");
      const play = root.querySelector(".play-btn");
      const caption = root.querySelector("p[data-caption]");
      const tabs = [...root.querySelectorAll("[role='tab']")];
      const select = (tab, autoplay) => {
        tabs.forEach((item) => {
          const on = item === tab;
          item.setAttribute("aria-selected", on ? "true" : "false");
          item.tabIndex = on ? 0 : -1;
        });
        video.pause();
        video.preload = "none";
        video.poster = tab.dataset.poster;
        video.src = tab.dataset.src;
        if (caption) caption.textContent = tab.dataset.caption;
        play.hidden = false;
        const note = root.querySelector(".media-error");
        if (note) note.classList.remove("show");
        if (autoplay) {
          const pending = video.play();
          if (pending) pending.catch(() => { play.hidden = false; });
        }
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(tab, video.currentTime > 0 && !video.paused));
        tab.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const next = e.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
          select(tabs[next], false);
        });
      });
      attachVideo(video, play);
      if (tabs.length) select(tabs[0], false);
    });
  }

  function setupCopyBibtex() {
    const btn = document.getElementById("copy-bibtex-btn");
    const pre = document.getElementById("bibtex-code");
    if (!btn || !pre) return;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent.trim());
        const prev = btn.textContent;
        btn.textContent = "Copied ✓";
        setTimeout(() => { btn.textContent = prev; }, 1800);
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }

  setupNav();
  setupTaxonomyAndQuotas();
  setupLeaderboard();
  setupComparator();
  setupVideos();
  setupLightbox();
  setupCopyBibtex();
})();

// ResearchHub AI - Main Application Controller

const app = {
  state: {
    currentUser: null,
    currentView: "dashboard",
    currentAITab: "topic",
    projects: [],
    tasks: [],
    papers: [],
    notifications: [],
    adminStats: {},
    activeProject: null,
    selectedExplorerDomain: "all",
    selectedTaskId: null,
    selectedReviewProjectId: null
  },

  async init() {
    try {
      // Default to student on first load
      const user = await api.switchRole("student");
      this.state.currentUser = user;
      await this.refreshData();
      this.setupEventListeners();
      this.navigate("dashboard");
    } catch (err) {
      console.error("Initialization error:", err);
    }
  },

  async refreshData() {
    try {
      const [projects, tasks, papers, stats, notifications] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getPapers(),
        api.getAdminStats(),
        api.getNotifications(this.state.currentUser ? this.state.currentUser.id : 1)
      ]);
      this.state.projects = projects;
      this.state.tasks = tasks;
      this.state.papers = papers;
      this.state.adminStats = stats;
      this.state.notifications = notifications;

      this.updateHeaderUI();
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  },

  updateHeaderUI() {
    const user = this.state.currentUser;
    if (!user) return;

    const userPill = document.getElementById("header-user-pill");
    if (userPill) {
      userPill.innerHTML = `
        <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'}" class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700"/>
        <div class="hidden sm:block text-left text-xs">
          <div class="font-bold text-white">${components.escapeHtml(user.name)}</div>
          <div class="text-[10px] text-slate-400 capitalize">${user.role.replace('_', ' ')}</div>
        </div>
      `;
    }

    // Role selector dropdown sync
    const roleSelector = document.getElementById("role-selector");
    if (roleSelector) {
      roleSelector.value = user.role;
    }

    // Notifications badge
    const unreadCount = this.state.notifications.filter(n => !n.is_read).length;
    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  },

  async switchRole(role) {
    try {
      const user = await api.switchRole(role);
      this.state.currentUser = user;
      await this.refreshData();
      this.navigate(this.state.currentView);
    } catch (err) {
      alert("Failed to switch role: " + err.message);
    }
  },

  navigate(viewName) {
    this.state.currentView = viewName;
    const content = document.getElementById("main-content");
    if (!content) return;

    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
        link.classList.remove("text-slate-400", "border-transparent");
      } else {
        link.classList.remove("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
        link.classList.add("text-slate-400", "border-transparent");
      }
    });

    switch (viewName) {
      case "dashboard":
        content.innerHTML = components.renderDashboard(
          this.state.currentUser,
          this.state.adminStats,
          this.state.projects,
          this.state.tasks
        );
        break;

      case "explorer":
        content.innerHTML = components.renderExplorer(
          this.state.projects,
          this.state.selectedExplorerDomain
        );
        break;

      case "ai-assistant":
        content.innerHTML = components.renderAIAssistant(this.state.currentAITab);
        break;

      case "library":
        content.innerHTML = components.renderLibrary(this.state.papers);
        break;

      case "pdf-analyzer":
        content.innerHTML = components.renderPDFAnalyzer();
        break;

      case "workspace":
        const proj = this.state.activeProject || this.state.projects[0];
        if (proj) {
          this.openWorkspace(proj.id);
        } else {
          content.innerHTML = `<div class="p-8 text-center text-slate-400">No project created yet. Click "+ New Project" to start.</div>`;
        }
        break;

      case "tasks":
        content.innerHTML = components.renderTasks(
          this.state.tasks,
          this.state.projects,
          this.state.activeProject ? this.state.activeProject.id : null
        );
        break;

      case "analytics":
        const targetProj = this.state.activeProject || this.state.projects[0];
        if (targetProj) {
          this.openAnalytics(targetProj.id);
        } else {
          content.innerHTML = `<div class="p-8 text-center text-slate-400">Select a project first to view ML Risk Analytics.</div>`;
        }
        break;

      case "admin":
        api.getUsers().then(users => {
          content.innerHTML = components.renderAdmin(this.state.adminStats, users);
        }).catch(() => {
          content.innerHTML = components.renderAdmin(this.state.adminStats, []);
        });
        break;

      default:
        content.innerHTML = components.renderDashboard(
          this.state.currentUser,
          this.state.adminStats,
          this.state.projects,
          this.state.tasks
        );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  async filterExplorer(domain) {
    this.state.selectedExplorerDomain = domain;
    const filtered = await api.getProjects({ domain: domain === "all" ? null : domain });
    const content = document.getElementById("main-content");
    content.innerHTML = components.renderExplorer(filtered, domain);
  },

  setAITab(tabName) {
    this.state.currentAITab = tabName;
    const content = document.getElementById("main-content");
    content.innerHTML = components.renderAIAssistant(tabName);
  },

  // Feature 1 Execution
  async executeTopicRecommendation() {
    const field = document.getElementById("ai-topic-field").value;
    const interest = document.getElementById("ai-topic-interest").value;
    const skillsRaw = document.getElementById("ai-topic-skills").value;
    const skills = skillsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const resultsDiv = document.getElementById("ai-topic-results");
    resultsDiv.innerHTML = `<div class="p-8 text-center text-indigo-400 font-semibold animate-pulse">Running TF-IDF Cosine Embedding and Skill Alignment...</div>`;

    try {
      const recommendations = await api.recommendTopics(field, interest, skills, field);
      if (!recommendations || recommendations.length === 0) {
        resultsDiv.innerHTML = `<div class="p-6 text-center text-slate-400">No matching topics found. Try broader keywords.</div>`;
        return;
      }

      resultsDiv.innerHTML = `
        <div class="space-y-4 fade-in">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ranked Recommendations (${recommendations.length} Matches Found)
          </div>
          ${recommendations.map((t, idx) => `
            <div class="glass-panel p-5 space-y-3 border-l-4 border-indigo-500 hover:border-indigo-400 transition">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-indigo text-xs">#${idx + 1} ${t.domain}</span>
                  <span class="badge badge-sky text-xs">${t.difficulty}</span>
                </div>
                <div class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Match Confidence: ${t.confidence_score}%
                </div>
              </div>

              <h4 class="text-lg font-bold text-white">${components.escapeHtml(t.title)}</h4>
              <p class="text-xs text-slate-300 leading-relaxed">${components.escapeHtml(t.rationale)}</p>

              <div class="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1.5 border border-slate-800">
                <div class="text-indigo-300 font-semibold">Suggested Methodology:</div>
                <div class="text-slate-300">${components.escapeHtml(t.sample_methodology)}</div>
                
                <div class="pt-1.5 flex flex-wrap items-center gap-1.5">
                  <span class="text-slate-400">Benchmark Datasets:</span>
                  ${t.suggested_datasets.map(d => `<span class="badge badge-slate text-[10px] bg-slate-800 text-slate-300">${d}</span>`).join('')}
                </div>
              </div>

              <div class="pt-2 flex justify-end">
                <button onclick="app.quickCreateProjectFromTopic('${encodeURIComponent(t.title)}', '${encodeURIComponent(t.domain)}', '${encodeURIComponent(t.rationale)}')" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition">
                  Create Project from Topic →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      resultsDiv.innerHTML = `<div class="p-6 text-rose-400 text-xs">Error: ${err.message}</div>`;
    }
  },

  // Feature 6 Execution
  async executeMethodologyRecommendation() {
    const q = document.getElementById("ai-method-q").value;
    const domain = document.getElementById("ai-method-domain").value;
    const dt = document.getElementById("ai-method-datatype").value;
    const hw = document.getElementById("ai-method-hw").value;

    const resultsDiv = document.getElementById("ai-method-results");
    resultsDiv.innerHTML = `<div class="p-8 text-center text-indigo-400 font-semibold animate-pulse">Synthesizing State-of-the-Art Architecture...</div>`;

    try {
      const res = await api.recommendMethodology(q, domain, dt, hw);
      resultsDiv.innerHTML = `
        <div class="glass-panel p-6 space-y-5 fade-in border-l-4 border-emerald-500">
          <div>
            <span class="badge badge-emerald text-xs mb-2">${res.algorithm_category}</span>
            <h3 class="text-xl font-bold text-white">${res.recommended_model}</h3>
            <p class="text-xs text-slate-300 mt-2 leading-relaxed">${components.escapeHtml(res.rationale)}</p>
          </div>

          <!-- Pipeline Steps -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">5-Step Implementation Pipeline</h4>
            <div class="space-y-1.5">
              ${res.pipeline_steps.map((s, i) => `
                <div class="p-2.5 bg-slate-900/60 rounded-lg text-xs text-slate-300 flex items-start gap-2 border border-slate-800">
                  <span class="font-bold text-indigo-400">Phase ${i+1}:</span>
                  <span>${components.escapeHtml(s)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Metrics and Frameworks -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
              <span class="text-slate-400 font-semibold block mb-1">Recommended Metrics</span>
              <div class="flex flex-wrap gap-1">
                ${res.suggested_metrics.map(m => `<span class="badge badge-indigo text-[10px]">${m}</span>`).join('')}
              </div>
            </div>
            <div class="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
              <span class="text-slate-400 font-semibold block mb-1">Frameworks & Libraries</span>
              <div class="flex flex-wrap gap-1">
                ${res.code_frameworks.map(cf => `<span class="badge badge-sky text-[10px]">${cf}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      resultsDiv.innerHTML = `<div class="p-6 text-rose-400 text-xs">Error: ${err.message}</div>`;
    }
  },

  // Feature 3 Execution
  async executeGapAnalysis() {
    const topic = document.getElementById("ai-gap-topic").value;
    const domain = document.getElementById("ai-gap-domain").value;
    const kw = document.getElementById("ai-gap-keywords").value.split(",").map(s => s.trim()).filter(Boolean);

    const resultsDiv = document.getElementById("ai-gap-results");
    resultsDiv.innerHTML = `<div class="p-8 text-center text-indigo-400 font-semibold animate-pulse">Cross-referencing Literature Boundaries & Failure Modes...</div>`;

    try {
      const gaps = await api.analyzeGaps(topic, domain, kw);
      resultsDiv.innerHTML = `
        <div class="space-y-4 fade-in">
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Synthesized Academic Gaps (${gaps.length} Discovered Opportunities)
          </div>
          ${gaps.map(g => `
            <div class="glass-panel p-5 space-y-3 border-l-4 border-amber-500">
              <div class="flex items-center justify-between">
                <span class="badge badge-amber text-xs">${g.category}</span>
                <span class="text-xs text-indigo-400 font-semibold">${g.potential_novelty}</span>
              </div>

              <h4 class="text-base font-bold text-white">${components.escapeHtml(g.gap_title)}</h4>
              <p class="text-xs text-slate-300 leading-relaxed">${components.escapeHtml(g.description)}</p>

              <div class="p-3 bg-slate-900/60 rounded-lg text-xs space-y-1 border border-slate-800">
                <span class="text-emerald-400 font-semibold">Recommended Research Direction:</span>
                <p class="text-slate-300">${components.escapeHtml(g.recommended_direction)}</p>
              </div>

              <div class="text-[11px] text-slate-500 italic">
                * Note: ${g.verification_note}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      resultsDiv.innerHTML = `<div class="p-6 text-rose-400 text-xs">Error: ${err.message}</div>`;
    }
  },

  // Feature 4 Execution: PDF Upload and NLP Structured Summary
  async executePDFAnalysis() {
    const title = document.getElementById("pdf-paper-title").value;
    const domain = document.getElementById("pdf-paper-domain").value;
    const fileInput = document.getElementById("pdf-file-input");
    const rawText = document.getElementById("pdf-raw-text").value;

    const resultsDiv = document.getElementById("pdf-summary-results");
    resultsDiv.innerHTML = `<div class="p-8 text-center text-indigo-400 font-semibold animate-pulse">Running NLP Sentence Centroid & Structured Extraction Pipeline...</div>`;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("domain", domain);
      formData.append("user_id", this.state.currentUser ? this.state.currentUser.id : 1);

      if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
      } else {
        formData.append("raw_text", rawText);
      }

      const res = await api.uploadPaper(formData);
      const s = res.summary;

      resultsDiv.innerHTML = `
        <div class="glass-panel p-6 space-y-5 fade-in border-l-4 border-indigo-500">
          <div class="flex items-center justify-between">
            <span class="badge badge-indigo text-xs">${domain}</span>
            <span class="badge badge-emerald text-xs">Extraction Confidence: ${s.summary_confidence}%</span>
          </div>

          <h3 class="text-xl font-bold text-white">${components.escapeHtml(s.title)}</h3>

          <!-- Section 1: Abstract -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">1. Executive Abstract Summary</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.abstract_summary)}</p>
          </div>

          <!-- Section 2: Objectives -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Primary Research Objectives</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.research_objectives)}</p>
          </div>

          <!-- Section 3: Methodology -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">3. Proposed Methodology & Pipeline</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.methodology)}</p>
          </div>

          <!-- Section 4: Results -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">4. Experimental Results & Metrics</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.results)}</p>
          </div>

          <!-- Section 5: Limitations -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-rose-400 uppercase tracking-wider">5. Recognized Limitations</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.limitations)}</p>
          </div>

          <!-- Section 6: Future Work -->
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider">6. Future Directions & Open Questions</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(s.future_work)}</p>
          </div>

          <!-- Keywords -->
          <div class="pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
            <span class="text-xs text-slate-400 font-semibold">Extracted Keywords:</span>
            ${(s.extracted_keywords || []).map(k => `<span class="badge badge-slate text-[10px] bg-slate-800 text-slate-300">${k}</span>`).join('')}
          </div>
        </div>
      `;

      await this.refreshData();
    } catch (err) {
      resultsDiv.innerHTML = `<div class="p-6 text-rose-400 text-xs">Error: ${err.message}</div>`;
    }
  },

  async openWorkspace(projectId) {
    try {
      const proj = await api.getProjectDetail(projectId);
      this.state.activeProject = proj;
      const content = document.getElementById("main-content");
      content.innerHTML = components.renderWorkspace(proj);
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.dataset.view === "workspace") {
          link.classList.add("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
          link.classList.remove("text-slate-400", "border-transparent");
        } else {
          link.classList.remove("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
          link.classList.add("text-slate-400", "border-transparent");
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Failed to load workspace: " + err.message);
    }
  },

  async saveProjectProposal(projectId) {
    const problem = document.getElementById("prop-problem").value;
    const objectives = document.getElementById("prop-objectives").value;
    const methodology = document.getElementById("prop-methodology").value;
    const outcomes = document.getElementById("prop-outcomes").value;
    const budget = parseFloat(document.getElementById("prop-budget").value) || 0.0;

    try {
      await api.saveProposal(projectId, {
        project_id: projectId,
        problem_statement: problem,
        objectives: objectives,
        methodology: methodology,
        expected_outcomes: outcomes,
        budget: budget
      });
      alert("Proposal submitted for supervisor review!");
      await this.openWorkspace(projectId);
    } catch (err) {
      alert("Failed to save proposal: " + err.message);
    }
  },

  async sendDiscussion(projectId) {
    const input = document.getElementById("discuss-input");
    const msg = input.value.trim();
    if (!msg) return;

    try {
      await api.postDiscussion(projectId, msg, this.state.currentUser ? this.state.currentUser.id : 1);
      input.value = "";
      await this.openWorkspace(projectId);
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  },

  async openAnalytics(projectId) {
    try {
      const proj = await api.getProjectDetail(projectId);
      const pred = await api.predictProgress(projectId);
      const content = document.getElementById("main-content");
      content.innerHTML = components.renderAnalytics(proj, pred);
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.dataset.view === "analytics") {
          link.classList.add("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
          link.classList.remove("text-slate-400", "border-transparent");
        } else {
          link.classList.remove("bg-indigo-600/20", "text-indigo-400", "border-indigo-500");
          link.classList.add("text-slate-400", "border-transparent");
        }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Failed to run ML analytics: " + err.message);
    }
  },

  async searchLibrary() {
    const query = document.getElementById("library-search-input").value.trim();
    const listDiv = document.getElementById("library-papers-list");
    listDiv.innerHTML = `<div class="p-8 text-center text-indigo-400 font-semibold animate-pulse">Running Dense Semantic Vector Match...</div>`;

    try {
      const results = await api.getPapers(null, query);
      const content = document.getElementById("main-content");
      content.innerHTML = components.renderLibrary(results);
    } catch (err) {
      listDiv.innerHTML = `<div class="p-6 text-rose-400 text-xs">Error: ${err.message}</div>`;
    }
  },

  async openPaperDetail(paperId) {
    try {
      const paper = await api.getPaperDetail(paperId);
      const modal = document.getElementById("paper-detail-modal");
      const body = document.getElementById("paper-detail-body");

      body.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="badge badge-indigo text-xs">${components.escapeHtml(paper.domain)}</span>
            <span class="text-xs text-slate-400">${components.escapeHtml(paper.venue || 'ArXiv')} (${paper.publication_year})</span>
          </div>
          <h2 class="text-xl font-bold text-white">${components.escapeHtml(paper.title)}</h2>
          <p class="text-xs text-indigo-300 font-medium">${components.escapeHtml(paper.authors)}</p>
          
          <div class="space-y-1">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Abstract</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">${components.escapeHtml(paper.abstract)}</p>
          </div>

          <!-- Similar Papers via Vector Search -->
          <div class="space-y-2 pt-2">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Similar Papers (Vector Recommendation)</h4>
            <div class="space-y-2">
              ${(paper.similar_papers || []).map(sp => `
                <div class="p-2.5 bg-slate-900/60 rounded-lg text-xs border border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500/50" onclick="app.openPaperDetail(${sp.id})">
                  <div class="space-y-0.5 max-w-[80%]">
                    <div class="text-white font-medium truncate">${components.escapeHtml(sp.title)}</div>
                    <div class="text-[11px] text-slate-400">${components.escapeHtml(sp.authors.split(',')[0])} et al.</div>
                  </div>
                  <span class="badge badge-emerald text-[10px]">Match ${sp.match_score}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      modal.classList.remove("hidden");
    } catch (err) {
      alert("Failed to fetch paper details: " + err.message);
    }
  },

  async filterTasksByProject(projectId) {
    const filteredTasks = await api.getTasks(projectId || null);
    const content = document.getElementById("main-content");
    content.innerHTML = components.renderTasks(filteredTasks, this.state.projects, projectId);
  },

  async updateTaskStatus(taskId, newStatus) {
    try {
      await api.updateTask(taskId, { status: newStatus });
      await this.refreshData();
      if (this.state.currentView === "tasks") {
        this.navigate("tasks");
      }
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  },

  async deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.deleteTask(taskId);
      await this.refreshData();
      this.navigate("tasks");
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  },

  async quickCreateProjectFromTopic(title, domain, rationale) {
    try {
      await api.createProject({
        title: decodeURIComponent(title),
        domain: decodeURIComponent(domain),
        abstract: decodeURIComponent(rationale),
        supervisor_id: 3 // Dr. Evelyn Vance
      }, this.state.currentUser ? this.state.currentUser.id : 1);
      alert("Project created successfully from recommended topic!");
      await this.refreshData();
      this.navigate("explorer");
    } catch (err) {
      alert("Failed to create project: " + err.message);
    }
  },

  showModal(name) {
    if (name === "new-task") {
      const projSelect = document.getElementById("new-task-project");
      if (projSelect && this.state.projects && this.state.projects.length > 0) {
        projSelect.innerHTML = this.state.projects.map(p => `
          <option value="${p.id}" ${this.state.activeProject && this.state.activeProject.id === p.id ? 'selected' : ''}>${components.escapeHtml(p.title)}</option>
        `).join('');
      }
    }
    const modal = document.getElementById(`${name}-modal`);
    if (modal) modal.classList.remove("hidden");
  },

  closeModal(name) {
    const modal = document.getElementById(`${name}-modal`);
    if (modal) modal.classList.add("hidden");
  },

  showSupervisorReviewModal(projectId) {
    this.state.selectedReviewProjectId = projectId;
    this.showModal("supervisor-review");
  },

  async submitSupervisorReview() {
    const feedback = document.getElementById("review-feedback").value;
    const score = parseFloat(document.getElementById("review-score").value) || 85.0;
    const actionItems = document.getElementById("review-actions").value;
    const newStatus = document.getElementById("review-status-select").value;

    try {
      await api.submitReview({
        project_id: this.state.selectedReviewProjectId,
        feedback,
        score,
        action_items: actionItems,
        new_project_status: newStatus
      }, this.state.currentUser ? this.state.currentUser.id : 3);
      alert("Supervisor review posted successfully!");
      this.closeModal("supervisor-review");
      await this.openWorkspace(this.state.selectedReviewProjectId);
    } catch (err) {
      alert("Failed to submit review: " + err.message);
    }
  },

  async createNewProjectSubmit() {
    const titleInput = document.getElementById("new-proj-title");
    const domainInput = document.getElementById("new-proj-domain");
    const abstInput = document.getElementById("new-proj-abstract");
    const deadlineInput = document.getElementById("new-proj-deadline");

    const title = titleInput.value.trim();
    const domain = domainInput.value;
    const abst = abstInput.value.trim();
    const deadline = deadlineInput.value;

    if (!title) {
      alert("Please enter a project title.");
      return;
    }

    try {
      await api.createProject({
        title,
        domain,
        abstract: abst,
        target_completion_date: deadline,
        supervisor_id: 3
      }, this.state.currentUser ? this.state.currentUser.id : 1);
      alert("New research project created!");
      titleInput.value = "";
      abstInput.value = "";
      this.closeModal("new-project");
      await this.refreshData();
      this.navigate("explorer");
    } catch (err) {
      alert("Failed to create project: " + err.message);
    }
  },

  async createNewTaskSubmit() {
    const projSelect = document.getElementById("new-task-project");
    const titleInput = document.getElementById("new-task-title");
    const descInput = document.getElementById("new-task-desc");
    const prioInput = document.getElementById("new-task-priority");
    const dueInput = document.getElementById("new-task-due");
    const hoursInput = document.getElementById("new-task-hours");

    const projectId = parseInt(projSelect.value);
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const prio = prioInput.value;
    const due = dueInput.value;
    const hours = parseFloat(hoursInput.value) || 10.0;

    if (!title) {
      alert("Please enter a task title.");
      return;
    }

    try {
      await api.createTask({
        project_id: projectId,
        title,
        description: desc,
        priority: prio,
        due_date: due,
        estimated_hours: hours,
        assigned_to: this.state.currentUser ? this.state.currentUser.id : 1
      });
      alert("New task created!");
      titleInput.value = "";
      descInput.value = "";
      this.closeModal("new-task");
      await this.refreshData();
      this.navigate("tasks");
    } catch (err) {
      alert("Failed to create task: " + err.message);
    }
  },

  async changeUserRole(userId, newRole) {
    try {
      await api.updateUserRole(userId, newRole);
      alert(`User role successfully updated to ${newRole}`);
      await this.refreshData();
      const users = await api.getUsers();
      const content = document.getElementById("main-content");
      if (this.state.currentView === "admin") {
        content.innerHTML = components.renderAdmin(this.state.adminStats, users);
      }
    } catch (err) {
      alert("Failed to update user role: " + err.message);
    }
  },

  toggleNotifications() {
    const dropdown = document.getElementById("notif-dropdown");
    if (!dropdown) return;
    dropdown.classList.toggle("hidden");

    if (!dropdown.classList.contains("hidden")) {
      const list = document.getElementById("notif-list");
      list.innerHTML = this.state.notifications.map(n => `
        <div onclick="app.handleNotificationClick(${n.id}, '${n.link_url || ''}')" class="p-3 border-b border-slate-800 text-xs hover:bg-slate-800/60 transition cursor-pointer ${n.is_read ? 'opacity-60' : 'bg-indigo-950/20'}">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-white">${components.escapeHtml(n.title)}</span>
            ${!n.is_read ? '<span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>' : ''}
          </div>
          <div class="text-slate-300 mt-1">${components.escapeHtml(n.message)}</div>
          <div class="text-[10px] text-slate-500 mt-1.5">${n.created_at ? n.created_at.slice(0, 16) : ''}</div>
        </div>
      `).join('') || '<div class="p-4 text-center text-xs text-slate-500">No notifications.</div>';
    }
  },

  async handleNotificationClick(notifId, linkUrl) {
    try {
      await api.markNotificationRead(notifId);
      const notif = this.state.notifications.find(n => n.id === notifId);
      if (notif) notif.is_read = 1;
      this.updateHeaderUI();
      const dropdown = document.getElementById("notif-dropdown");
      if (dropdown) dropdown.classList.add("hidden");

      if (linkUrl) {
        if (linkUrl.includes("workspace")) {
          this.navigate("workspace");
        } else if (linkUrl.includes("tasks")) {
          this.navigate("tasks");
        } else if (linkUrl.includes("explorer")) {
          this.navigate("explorer");
        }
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  },

  setupEventListeners() {
    // Global esc closes modals
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(m => m.classList.add("hidden"));
        const notif = document.getElementById("notif-dropdown");
        if (notif) notif.classList.add("hidden");
      }
    });
  }
};

// Auto start
window.addEventListener("DOMContentLoaded", () => {
  app.init();
});


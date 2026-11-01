// ResearchHub AI - Components & Views Renderer

const components = {
  // Utility for safe HTML escaping
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // Role Badge Helper
  getRoleBadge(role) {
    switch (role) {
      case "student": return `<span class="badge badge-sky">🎓 Student Researcher</span>`;
      case "supervisor": return `<span class="badge badge-indigo">👨‍🏫 Supervisor / Faculty</span>`;
      case "dept_admin": return `<span class="badge badge-emerald">🏛️ Dept Admin</span>`;
      case "super_admin": return `<span class="badge badge-amber">⚡ Super Admin</span>`;
      default: return `<span class="badge badge-sky">${role}</span>`;
    }
  },

  // Risk Badge Helper
  getRiskBadge(risk) {
    switch (risk) {
      case "ON_TRACK": return `<span class="badge badge-emerald"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block"></span>On Track</span>`;
      case "MODERATE_RISK": return `<span class="badge badge-amber"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 inline-block"></span>Moderate Risk</span>`;
      case "HIGH_RISK":
      case "CRITICAL_RISK": return `<span class="badge badge-rose"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 inline-block"></span>Critical Risk</span>`;
      default: return `<span class="badge badge-sky">${risk}</span>`;
    }
  },

  // Status Badge Helper
  getStatusBadge(status) {
    switch (status) {
      case "in_progress": return `<span class="badge badge-indigo">In Progress</span>`;
      case "approved": return `<span class="badge badge-emerald">Approved</span>`;
      case "proposal_pending": return `<span class="badge badge-amber">Proposal Pending</span>`;
      case "review_required": return `<span class="badge badge-rose">Review Required</span>`;
      case "completed": return `<span class="badge badge-emerald">Completed</span>`;
      default: return `<span class="badge badge-sky">${status}</span>`;
    }
  },

  // 1. Dashboard View
  renderDashboard(user, stats, projects, tasks) {
    const activeProject = projects.find(p => p.status === 'in_progress') || projects[0] || null;
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

    return `
      <div class="space-y-6 fade-in">
        <!-- Welcome Hero -->
        <div class="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="z-10">
            <div class="flex items-center gap-2 mb-2">
              ${this.getRoleBadge(user.role)}
              <span class="text-xs text-slate-400 font-medium">${user.department_name || 'School of Computer Engineering'}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome back, ${this.escapeHtml(user.name)}</h1>
            <p class="text-slate-400 text-sm mt-1 max-w-2xl">
              ${user.role === 'student' ? 'Track your active research milestones, explore AI topic recommendations, and get real-time supervisor reviews.' : 
                user.role === 'supervisor' ? 'Monitor supervised student research milestones, evaluate pending proposals, and assess deadline risks.' : 
                'Department-wide research monitoring, ethical reviews, and university milestone telemetry.'}
            </p>
          </div>
          <div class="flex items-center gap-3 z-10">
            <button onclick="app.navigate('ai-assistant')" class="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              AI Research Assistant
            </button>
            <button onclick="app.showModal('new-project')" class="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition">
              + New Project
            </button>
          </div>
          <!-- Background Glow -->
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Projects</span>
              <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </span>
            </div>
            <div class="text-2xl font-bold text-white">${projects.length}</div>
            <div class="text-xs text-slate-400 mt-1">Across 4 research domains</div>
          </div>

          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Tasks Progress</span>
              <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </span>
            </div>
            <div class="text-2xl font-bold text-white">${completedTasksCount} / ${tasks.length}</div>
            <div class="text-xs text-emerald-400 mt-1">${tasks.length ? Math.round((completedTasksCount/tasks.length)*100) : 0}% milestone velocity</div>
          </div>

          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Research Papers</span>
              <span class="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </span>
            </div>
            <div class="text-2xl font-bold text-white">${stats.total_papers || 12}</div>
            <div class="text-xs text-slate-400 mt-1">Indexed in Vector Search</div>
          </div>

          <div class="glass-panel p-5">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>ML Health Engine</span>
              <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </span>
            </div>
            <div class="text-2xl font-bold text-emerald-400">Random Forest</div>
            <div class="text-xs text-slate-400 mt-1">Risk Predictor Active</div>
          </div>
        </div>

        <!-- Active Project Highlight Card -->
        ${activeProject ? `
          <div class="glass-panel p-6 border-l-4 border-indigo-500">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="badge badge-indigo">${this.escapeHtml(activeProject.domain)}</span>
                  ${this.getStatusBadge(activeProject.status)}
                  ${this.getRiskBadge(activeProject.risk_level)}
                </div>
                <h2 class="text-xl font-bold text-white">${this.escapeHtml(activeProject.title)}</h2>
                <p class="text-slate-400 text-xs mt-1">
                  Supervisor: <span class="text-slate-200 font-medium">${this.escapeHtml(activeProject.supervisor_name || 'Dr. Evelyn Vance')}</span> · 
                  Deadline: <span class="text-slate-200">${activeProject.target_completion_date || '2026-12-15'}</span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="app.openWorkspace(${activeProject.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow">
                  Open Workspace
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button onclick="app.openAnalytics(${activeProject.id})" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition">
                  ML Risk Analysis
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-slate-400 font-medium">
                <span>Milestone Progress</span>
                <span class="text-indigo-400 font-semibold">${activeProject.progress_percent}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div class="bg-indigo-500 h-2.5 rounded-full progress-fill" style="width: ${activeProject.progress_percent}%"></div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Two Column Layout: Recent Projects & Upcoming Tasks -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Projects -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                University Research Projects
              </h3>
              <button onclick="app.navigate('explorer')" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View All →</button>
            </div>
            <div class="divide-y divide-slate-800">
              ${projects.slice(0, 4).map(p => `
                <div class="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition cursor-pointer" onclick="app.openWorkspace(${p.id})">
                  <div class="space-y-1 max-w-[70%]">
                    <div class="text-sm font-medium text-white truncate">${this.escapeHtml(p.title)}</div>
                    <div class="flex items-center gap-2 text-xs text-slate-400">
                      <span>${this.escapeHtml(p.domain)}</span> · 
                      <span>${p.creator_name || 'Researcher'}</span>
                    </div>
                  </div>
                  <div>
                    ${this.getStatusBadge(p.status)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Pending Tasks & Deadlines -->
          <div class="glass-panel p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Upcoming Milestone Tasks
              </h3>
              <button onclick="app.navigate('tasks')" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Kanban Board →</button>
            </div>
            <div class="divide-y divide-slate-800">
              ${tasks.slice(0, 4).map(t => `
                <div class="py-3 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition">
                  <div class="space-y-1 max-w-[70%]">
                    <div class="text-sm font-medium ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'} truncate">${this.escapeHtml(t.title)}</div>
                    <div class="text-xs text-slate-400">Due: ${t.due_date || 'Scheduled'} · Priority: <span class="text-amber-400 font-semibold uppercase">${t.priority}</span></div>
                  </div>
                  <div>
                    <span class="badge ${t.status === 'completed' ? 'badge-emerald' : t.status === 'in_progress' ? 'badge-indigo' : 'badge-amber'}">${t.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 2. Research Explorer
  renderExplorer(projects, selectedDomain = "all") {
    const domains = ["all", "Computer Vision", "Natural Language Processing", "Healthcare AI", "Cybersecurity AI", "Robotics & AI"];
    
    return `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">Research Explorer</h1>
            <p class="text-slate-400 text-sm">Discover university research projects, collaborations, and theses across all departments.</p>
          </div>
          <button onclick="app.showModal('new-project')" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Create Research Project
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          ${domains.map(d => `
            <button onclick="app.filterExplorer('${d}')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${selectedDomain.toLowerCase() === d.toLowerCase() ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}">
              ${d === 'all' ? 'All Domains' : d}
            </button>
          `).join('')}
        </div>

        <!-- Project Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${projects.map(p => `
            <div class="glass-panel p-5 flex flex-col justify-between hover:border-indigo-500/50 transition">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="badge badge-indigo text-xs">${this.escapeHtml(p.domain)}</span>
                  ${this.getRiskBadge(p.risk_level)}
                </div>
                <h3 class="text-lg font-bold text-white line-clamp-2 hover:text-indigo-400 cursor-pointer" onclick="app.openWorkspace(${p.id})">
                  ${this.escapeHtml(p.title)}
                </h3>
                <p class="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                  ${this.escapeHtml(p.abstract || 'No abstract provided yet.')}
                </p>
              </div>

              <div class="mt-5 pt-4 border-t border-slate-800 space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>Lead: <strong class="text-slate-200">${this.escapeHtml(p.creator_name || 'Alex')}</strong></span>
                  <span>Supervisor: <strong class="text-slate-200">${this.escapeHtml(p.supervisor_name || 'Dr. Vance')}</strong></span>
                </div>
                
                <div class="space-y-1">
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span class="font-semibold text-indigo-400">${p.progress_percent}%</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-indigo-500 h-1.5 rounded-full" style="width: ${p.progress_percent}%"></div>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-2">
                  <button onclick="app.openWorkspace(${p.id})" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700">
                    Workspace
                  </button>
                  <button onclick="app.openAnalytics(${p.id})" class="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold transition border border-indigo-500/30">
                    ML Risk
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 3. AI Research Assistant (Topic, Methodology, Gap)
  renderAIAssistant(activeTab = "topic") {
    return `
      <div class="space-y-6 fade-in">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </span>
            AI Research Assistant
          </h1>
          <p class="text-slate-400 text-sm mt-1">Multi-modal Machine Learning assistance for topic discovery, methodology formulation, and research gap identification.</p>
        </div>

        <!-- Sub Tabs -->
        <div class="flex border-b border-slate-800 gap-4">
          <button onclick="app.setAITab('topic')" class="pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'topic' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Feature 1: Topic Recommendation
          </button>
          <button onclick="app.setAITab('methodology')" class="pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'methodology' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Feature 6: Methodology Recommender
          </button>
          <button onclick="app.setAITab('gap')" class="pb-3 text-sm font-semibold transition border-b-2 ${activeTab === 'gap' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}">
            Feature 3: Research Gap Assistant
          </button>
        </div>

        <!-- Tab 1: Topic Recommendation Form -->
        ${activeTab === 'topic' ? `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-panel p-6 space-y-4 lg:col-span-1">
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                Your Research Profile
              </h3>
              
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Academic Field</label>
                <select id="ai-topic-field" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Natural Language Processing">Natural Language Processing (NLP)</option>
                  <option value="Healthcare AI">Healthcare & Biomedical AI</option>
                  <option value="Cybersecurity AI">Cybersecurity & Network Security</option>
                  <option value="Robotics & AI">Robotics & Autonomous Systems</option>
                  <option value="Software Engineering">Software Engineering & Web Systems</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Specific Research Interest</label>
                <input id="ai-topic-interest" type="text" value="Traffic Management & Congestion Detection" placeholder="e.g. Sepsis early warning, RAG hallucination" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Current Technical Skills (comma-separated)</label>
                <input id="ai-topic-skills" type="text" value="Python, CNN, YOLO, OpenCV" placeholder="e.g. PyTorch, Transformers, XGBoost" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>

              <button onclick="app.executeTopicRecommendation()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                Run ML Topic Matching
              </button>
            </div>

            <div class="lg:col-span-2 space-y-4" id="ai-topic-results">
              <div class="glass-panel p-8 text-center text-slate-400">
                Click <strong>"Run ML Topic Matching"</strong> to evaluate semantic similarity against the university research topics corpus using Sentence/TF-IDF Cosine Embedding.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Tab 2: Methodology Recommender Form -->
        ${activeTab === 'methodology' ? `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-panel p-6 space-y-4 lg:col-span-1">
              <h3 class="font-bold text-white text-base">Methodology Configurator</h3>
              
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Research Question / Goal</label>
                <textarea id="ai-method-q" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">Detect vehicles and pedestrian flow in edge CCTV feeds under low illumination</textarea>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
                <select id="ai-method-domain" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Healthcare AI">Healthcare & Medicine</option>
                  <option value="Cybersecurity AI">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Data Modality</label>
                <select id="ai-method-datatype" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="images">Images / Video Frames</option>
                  <option value="text">Text / Academic Papers</option>
                  <option value="tabular">Tabular / Clinical EHR Records</option>
                  <option value="graph">Graph / Network Provenance</option>
                  <option value="time-series">Time-Series Signals</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Hardware Constraint</label>
                <select id="ai-method-hw" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="edge_device">Edge Device (Jetson / Raspberry Pi / Mobile)</option>
                  <option value="standard">Standard Laptop / Google Colab Free</option>
                  <option value="high_gpu">High-End GPU Workstation (A100 / RTX 4090)</option>
                </select>
              </div>

              <button onclick="app.executeMethodologyRecommendation()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow">
                Generate ML Architecture
              </button>
            </div>

            <div class="lg:col-span-2 space-y-4" id="ai-method-results">
              <div class="glass-panel p-8 text-center text-slate-400">
                Click <strong>"Generate ML Architecture"</strong> to receive an end-to-end algorithmic recommendation, baselines, metrics, and pipeline steps.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Tab 3: Research Gap Assistant -->
        ${activeTab === 'gap' ? `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-panel p-6 space-y-4 lg:col-span-1">
              <h3 class="font-bold text-white text-base">Research Gap Discoverer</h3>
              
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Target Research Topic</label>
                <input id="ai-gap-topic" type="text" value="Real-Time Traffic Congestion Detection" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
                <select id="ai-gap-domain" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Healthcare AI">Healthcare AI</option>
                  <option value="Cybersecurity AI">Cybersecurity AI</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Key Focus Terms (optional)</label>
                <input id="ai-gap-keywords" type="text" value="YOLO, Edge IoT, Adverse Weather, Occlusion" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>

              <button onclick="app.executeGapAnalysis()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow">
                Analyze Underexplored Gaps
              </button>
            </div>

            <div class="lg:col-span-2 space-y-4" id="ai-gap-results">
              <div class="glass-panel p-8 text-center text-slate-400">
                Click <strong>"Analyze Underexplored Gaps"</strong> to synthesize candidate academic gaps across methodologies, datasets, and deployment bottlenecks.
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // 4. Research Library
  renderLibrary(papers) {
    return `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">Research Library</h1>
            <p class="text-slate-400 text-sm">Indexed academic papers with semantic vector search, citation metrics, and structured NLP summaries.</p>
          </div>
          <button onclick="app.navigate('pdf-analyzer')" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            Upload & Summarize Paper
          </button>
        </div>

        <!-- Semantic Search Box -->
        <div class="glass-panel p-4 flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input id="library-search-input" type="text" placeholder="Search papers semantically (e.g., 'Transformer attention mechanisms', 'YOLO real-time detection')..." class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" onkeydown="if(event.key==='Enter') app.searchLibrary()"/>
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <button onclick="app.searchLibrary()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition">
            Semantic Search
          </button>
        </div>

        <!-- Papers List -->
        <div class="space-y-4" id="library-papers-list">
          ${papers.map(p => `
            <div class="glass-panel p-5 hover:border-indigo-500/50 transition">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="badge badge-indigo text-xs">${this.escapeHtml(p.domain)}</span>
                  <span class="text-xs text-slate-400">${this.escapeHtml(p.venue || 'ArXiv')} (${p.publication_year})</span>
                  ${p.match_score ? `<span class="badge badge-emerald text-xs">Vector Match: ${p.match_score}%</span>` : ''}
                </div>
                <div class="text-xs text-slate-400">
                  Citations: <strong class="text-white">${p.citations_count ? p.citations_count.toLocaleString() : 'N/A'}</strong>
                </div>
              </div>

              <h3 class="text-lg font-bold text-white hover:text-indigo-400 cursor-pointer" onclick="app.openPaperDetail(${p.id})">
                ${this.escapeHtml(p.title)}
              </h3>
              <p class="text-xs text-indigo-300 font-medium mt-0.5">${this.escapeHtml(p.authors)}</p>
              
              <p class="text-slate-400 text-sm mt-2.5 line-clamp-3 leading-relaxed">
                ${this.escapeHtml(p.abstract)}
              </p>

              <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  ${p.doi_or_url ? `
                    <a href="${p.doi_or_url}" target="_blank" class="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                      <span>Original Paper</span>
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  ` : ''}
                </div>
                <button onclick="app.openPaperDetail(${p.id})" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition">
                  Structured Summary & Similar Papers →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 5. PDF & Document Analyzer
  renderPDFAnalyzer() {
    return `
      <div class="space-y-6 fade-in">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </span>
            PDF & Research Paper Analyzer (NLP)
          </h1>
          <p class="text-slate-400 text-sm mt-1">Upload a research paper PDF or paste raw text to extract a 6-section academic breakdown: Abstract, Objectives, Methodology, Results, Limitations, and Future Work.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Upload Form -->
          <div class="glass-panel p-6 space-y-4 lg:col-span-1">
            <h3 class="font-bold text-white text-base">Document Input</h3>
            
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Paper Title</label>
              <input id="pdf-paper-title" type="text" value="Attention Is All You Need" placeholder="Paper title" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
              <select id="pdf-paper-domain" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                <option value="Natural Language Processing">Natural Language Processing</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="Healthcare AI">Healthcare AI</option>
                <option value="Cybersecurity AI">Cybersecurity AI</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Upload PDF File</label>
              <input id="pdf-file-input" type="file" accept=".pdf,.txt,.doc,.docx" class="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"/>
            </div>

            <div class="text-center text-xs text-slate-500 font-semibold">— OR PASTE TEXT —</div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Raw Abstract or Document Excerpt</label>
              <textarea id="pdf-raw-text" rows="5" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="Paste paper text here...">The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs. However, a limitation is quadratic memory complexity with respect to sequence length, which poses challenges for long context documents.</textarea>
            </div>

            <button onclick="app.executePDFAnalysis()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/></svg>
              Extract & Summarize
            </button>
          </div>

          <!-- Analysis Output -->
          <div class="lg:col-span-2 space-y-4" id="pdf-summary-results">
            <div class="glass-panel p-8 text-center text-slate-400">
              Upload a PDF or click <strong>"Extract & Summarize"</strong> to run the NLP summarization engine.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 6. Research Workspace
  renderWorkspace(project) {
    const p = project;
    const proposal = p.proposal || {};
    const reviews = p.reviews || [];
    const members = p.members || [];
    const discussions = p.discussions || [];

    return `
      <div class="space-y-6 fade-in">
        <!-- Project Banner -->
        <div class="glass-panel p-6 border-l-4 border-indigo-500">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-indigo">${this.escapeHtml(p.domain)}</span>
                ${this.getStatusBadge(p.status)}
                ${this.getRiskBadge(p.risk_level)}
              </div>
              <h1 class="text-2xl font-bold text-white">${this.escapeHtml(p.title)}</h1>
              <p class="text-slate-400 text-sm mt-1 max-w-3xl">${this.escapeHtml(p.abstract || '')}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.openAnalytics(${p.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                ML Risk Analytics
              </button>
              <button onclick="app.showSupervisorReviewModal(${p.id})" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition">
                + Add Review
              </button>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-slate-400">Assigned Supervisor</span>
              <div class="text-white font-semibold mt-0.5">${this.escapeHtml(p.supervisor_name || 'Dr. Evelyn Vance')}</div>
            </div>
            <div>
              <span class="text-slate-400">Department</span>
              <div class="text-white font-semibold mt-0.5">${this.escapeHtml(p.department_name || 'Computer Science')}</div>
            </div>
            <div>
              <span class="text-slate-400">Target Deadline</span>
              <div class="text-white font-semibold mt-0.5">${p.target_completion_date || '2026-12-15'}</div>
            </div>
            <div>
              <span class="text-slate-400">Progress</span>
              <div class="text-indigo-400 font-bold mt-0.5">${p.progress_percent}%</div>
            </div>
          </div>
        </div>

        <!-- Workspace Tabs: Proposal, Team, Discussions, Reviews -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Research Proposal & Methodology Form -->
          <div class="glass-panel p-6 lg:col-span-2 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Research Proposal & Specifications
              </h3>
              <span class="badge ${proposal.status === 'approved' ? 'badge-emerald' : 'badge-amber'}">
                ${proposal.status ? proposal.status.toUpperCase() : 'PENDING APPROVAL'}
              </span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Problem Statement</label>
              <textarea id="prop-problem" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">${this.escapeHtml(proposal.problem_statement || '')}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Research Objectives (Numbered)</label>
              <textarea id="prop-objectives" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">${this.escapeHtml(proposal.objectives || '')}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Proposed Methodology & Architecture</label>
              <textarea id="prop-methodology" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">${this.escapeHtml(proposal.methodology || '')}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Expected Deliverables / Outcomes</label>
                <input id="prop-outcomes" type="text" value="${this.escapeHtml(proposal.expected_outcomes || '')}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Grant / Equipment Budget ($)</label>
                <input id="prop-budget" type="number" value="${proposal.budget || 0}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"/>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button onclick="app.saveProjectProposal(${p.id})" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow">
                Save & Submit for Supervisor Review
              </button>
            </div>
          </div>

          <!-- Right Column: Supervisor Feedback & Team Chat -->
          <div class="space-y-6">
            <!-- Supervisor Reviews Box -->
            <div class="glass-panel p-5 space-y-3">
              <h3 class="font-bold text-white text-sm flex items-center justify-between">
                <span>Supervisor Evaluations</span>
                <span class="text-xs text-indigo-400 font-semibold">${reviews.length} feedback logs</span>
              </h3>
              
              <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                ${reviews.length === 0 ? '<p class="text-xs text-slate-500">No supervisor evaluations submitted yet.</p>' : 
                  reviews.map(r => `
                    <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-indigo-300">${this.escapeHtml(r.supervisor_name)}</span>
                        <span class="font-bold text-emerald-400">${r.score}/100</span>
                      </div>
                      <p class="text-slate-300">${this.escapeHtml(r.feedback)}</p>
                      ${r.action_items ? `<div class="text-amber-400/90 text-[11px] font-medium">Action Items: ${this.escapeHtml(r.action_items)}</div>` : ''}
                    </div>
                  `).join('')}
              </div>
            </div>

            <!-- Discussion & Mentorship Stream -->
            <div class="glass-panel p-5 space-y-3">
              <h3 class="font-bold text-white text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Supervisor & Team Discussion
              </h3>

              <div class="space-y-2.5 max-h-56 overflow-y-auto pr-1" id="workspace-discussions">
                ${discussions.length === 0 ? '<p class="text-xs text-slate-500">No messages yet. Send a note to your supervisor below.</p>' : 
                  discussions.map(d => `
                    <div class="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-slate-200">${this.escapeHtml(d.sender_name)}</span>
                        <span class="text-[10px] text-slate-500">${d.created_at ? d.created_at.slice(11, 16) : ''}</span>
                      </div>
                      <p class="text-slate-300">${this.escapeHtml(d.message)}</p>
                    </div>
                  `).join('')}
              </div>

              <div class="flex gap-2 pt-1">
                <input id="discuss-input" type="text" placeholder="Post a message or question..." class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" onkeydown="if(event.key==='Enter') app.sendDiscussion(${p.id})"/>
                <button onclick="app.sendDiscussion(${p.id})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 7. Kanban Tasks Board
  renderTasks(tasks, projects, selectedProjectId = null) {
    const columns = [
      { id: "todo", title: "To Do", badge: "badge-amber" },
      { id: "in_progress", title: "In Progress", badge: "badge-indigo" },
      { id: "review", title: "Under Review", badge: "badge-sky" },
      { id: "completed", title: "Completed", badge: "badge-emerald" }
    ];

    return `
      <div class="space-y-6 fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">Task Management & Kanban</h1>
            <p class="text-slate-400 text-sm">Organize research milestones, experiments, and thesis deliverables.</p>
          </div>
          <div class="flex items-center gap-3">
            <select id="task-filter-project" onchange="app.filterTasksByProject(this.value)" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
              <option value="">All Projects</option>
              ${projects.map(p => `
                <option value="${p.id}" ${selectedProjectId == p.id ? 'selected' : ''}>${this.escapeHtml(p.title)}</option>
              `).join('')}
            </select>
            <button onclick="app.showModal('new-task')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow">
              + Add Milestone Task
            </button>
          </div>
        </div>

        <!-- Kanban Board Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return `
              <div class="kanban-col p-4 flex flex-col">
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 class="font-bold text-sm text-white flex items-center gap-2">
                    <span>${col.title}</span>
                    <span class="badge ${col.badge} text-[10px] py-0.5 px-2">${colTasks.length}</span>
                  </h3>
                </div>

                <div class="space-y-3 flex-1 overflow-y-auto">
                  ${colTasks.map(t => `
                    <div class="glass-panel p-3.5 space-y-2 hover:border-indigo-500/50 transition">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-indigo-400 font-semibold truncate max-w-[60%]">${this.escapeHtml(t.project_title || 'Project')}</span>
                        <span class="uppercase font-bold ${t.priority === 'high' ? 'text-rose-400' : t.priority === 'critical' ? 'text-red-500' : 'text-amber-400'}">${t.priority}</span>
                      </div>
                      
                      <h4 class="text-sm font-semibold text-white">${this.escapeHtml(t.title)}</h4>
                      ${t.description ? `<p class="text-xs text-slate-400 line-clamp-2">${this.escapeHtml(t.description)}</p>` : ''}

                      <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Due: ${t.due_date || 'None'}</span>
                        <span>${t.estimated_hours}h</span>
                      </div>

                      <!-- Action Transitions -->
                      <div class="pt-2 flex items-center justify-between gap-1 border-t border-slate-800/60">
                        <select onchange="app.updateTaskStatus(${t.id}, this.value)" class="bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 py-1 px-1.5">
                          <option value="todo" ${t.status==='todo'?'selected':''}>To Do</option>
                          <option value="in_progress" ${t.status==='in_progress'?'selected':''}>In Progress</option>
                          <option value="review" ${t.status==='review'?'selected':''}>Review</option>
                          <option value="completed" ${t.status==='completed'?'selected':''}>Completed</option>
                        </select>
                        <button onclick="app.deleteTask(${t.id})" class="text-slate-500 hover:text-rose-400 p-1" title="Delete Task">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // 8. ML Research Analytics & Deadline Risk Prediction
  renderAnalytics(project, prediction) {
    const pred = prediction;
    const isCritical = pred.risk_level === 'CRITICAL_RISK' || pred.risk_level === 'HIGH_RISK';
    const isMod = pred.risk_level === 'MODERATE_RISK';

    return `
      <div class="space-y-6 fade-in">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-indigo">${this.escapeHtml(project.domain)}</span>
              ${this.getStatusBadge(project.status)}
            </div>
            <h1 class="text-2xl font-bold text-white">${this.escapeHtml(project.title)} — ML Progress Prediction</h1>
            <p class="text-slate-400 text-sm mt-0.5">Trained Random Forest Classifier evaluating deadline risk, velocity lag, and completion forecast.</p>
          </div>
          <button onclick="app.openWorkspace(${project.id})" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold">
            ← Back to Workspace
          </button>
        </div>

        <!-- Gauge & Probability Top Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Risk Gauge Card -->
          <div class="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-2 border-t-4 ${isCritical ? 'border-rose-500' : isMod ? 'border-amber-500' : 'border-emerald-500'}">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Project Risk Score</span>
            <div class="text-4xl font-extrabold ${isCritical ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400'}">
              ${pred.risk_score}%
            </div>
            <div>${this.getRiskBadge(pred.risk_level)}</div>
            <p class="text-xs text-slate-400 max-w-xs pt-1">
              ${isCritical ? 'Significant schedule slip detected. Urgent mitigation required to meet submission deadline.' : 
                isMod ? 'Moderate risk detected due to minor task lag or unreviewed milestone.' : 
                'Project delivery tempo is healthy and aligned with target thesis defense.'}
            </p>
          </div>

          <!-- On-Time Probability -->
          <div class="glass-panel p-6 flex flex-col justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Time Completion Probability</span>
              <div class="text-3xl font-bold text-white mt-2">${pred.completion_probability}%</div>
              <p class="text-xs text-slate-400 mt-1">Based on task completion velocity and historical milestone performance.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 text-xs">
              <span class="text-slate-400">Projected Schedule Delay:</span>
              <strong class="text-white ml-1">${pred.estimated_days_delay} days</strong>
            </div>
          </div>

          <!-- Timeline Health -->
          <div class="glass-panel p-6 flex flex-col justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Days to Final Submission</span>
              <div class="text-3xl font-bold text-indigo-400 mt-2">${pred.days_remaining_to_deadline} Days</div>
              <p class="text-xs text-slate-400 mt-1">Scheduled Defense: ${project.target_completion_date || '2026-12-15'}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800 text-xs">
              <span class="text-slate-400">Current Velocity:</span>
              <strong class="text-emerald-400 ml-1">Active Sprints</strong>
            </div>
          </div>
        </div>

        <!-- Explainability: Risk Factors & Actionable Mitigations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Risk Factors -->
          <div class="glass-panel p-6 space-y-4">
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              ML Explainability: Diagnosed Risk Factors
            </h3>
            <ul class="space-y-2.5">
              ${pred.risk_factors.map(rf => `
                <li class="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span class="text-amber-400 font-bold">•</span>
                  <span>${this.escapeHtml(rf)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Actionable Mitigations -->
          <div class="glass-panel p-6 space-y-4">
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Recommended Recovery Plan
            </h3>
            <ul class="space-y-2.5">
              ${pred.actionable_mitigations.map(am => `
                <li class="flex items-start gap-2.5 text-xs text-slate-300 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span>${this.escapeHtml(am)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Random Forest Feature Importance Breakdown -->
        <div class="glass-panel p-6 space-y-4">
          <h3 class="font-bold text-white text-base">Random Forest Model Feature Importances</h3>
          <div class="space-y-3">
            ${Object.entries(pred.feature_importance || {}).map(([feat, imp]) => {
              const pct = Math.round(imp * 100);
              return `
                <div class="space-y-1">
                  <div class="flex justify-between text-xs text-slate-400 font-medium">
                    <span class="capitalize">${feat.replace(/_/g, ' ')}</span>
                    <span class="text-indigo-400 font-semibold">${pct}% weight</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: ${pct * 2}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 9. Admin Panel View
  renderAdmin(stats, users = []) {
    return `
      <div class="space-y-6 fade-in">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </span>
            University Administration & Research Governance
          </h1>
          <p class="text-slate-400 text-sm mt-1">Institutional telemetry, student-supervisor allocation, and department research audit.</p>
        </div>

        <!-- Institutional Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5">
            <span class="text-xs text-slate-400 font-semibold uppercase">Total Students</span>
            <div class="text-2xl font-bold text-white mt-1">${stats.students_count || 2}</div>
            <span class="text-xs text-slate-500">Enrolled researchers</span>
          </div>

          <div class="glass-panel p-5">
            <span class="text-xs text-slate-400 font-semibold uppercase">Faculty Supervisors</span>
            <div class="text-2xl font-bold text-white mt-1">${stats.supervisors_count || 2}</div>
            <span class="text-xs text-slate-500">Active research mentors</span>
          </div>

          <div class="glass-panel p-5">
            <span class="text-xs text-slate-400 font-semibold uppercase">Total Projects</span>
            <div class="text-2xl font-bold text-indigo-400 mt-1">${stats.total_projects || 5}</div>
            <span class="text-xs text-slate-500">Across 4 departments</span>
          </div>

          <div class="glass-panel p-5">
            <span class="text-xs text-slate-400 font-semibold uppercase">Indexed Papers</span>
            <div class="text-2xl font-bold text-emerald-400 mt-1">${stats.total_papers || 12}</div>
            <span class="text-xs text-slate-500">In vector catalog</span>
          </div>
        </div>

        <!-- Department Projects Breakdown & User Management -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="glass-panel p-6 space-y-4 lg:col-span-1">
            <h3 class="font-bold text-white text-base">Department Allocations</h3>
            <div class="divide-y divide-slate-800">
              ${(stats.department_breakdown || []).map(d => `
                <div class="py-3 flex items-center justify-between text-sm">
                  <span class="font-medium text-slate-200">${this.escapeHtml(d.name)}</span>
                  <span class="badge badge-indigo">${d.project_count} Projects</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- User Role Management Table -->
          <div class="glass-panel p-6 space-y-4 lg:col-span-2">
            <h3 class="font-bold text-white text-base flex items-center justify-between">
              <span>User Role & Permissions Management</span>
              <span class="text-xs text-slate-400">${users.length} Registered Accounts</span>
            </h3>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-800 text-slate-400">
                    <th class="pb-2.5">User</th>
                    <th class="pb-2.5">Department</th>
                    <th class="pb-2.5">Designation</th>
                    <th class="pb-2.5">Role Authorization</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  ${users.map(u => `
                    <tr class="hover:bg-slate-800/30 transition">
                      <td class="py-2.5 font-medium text-white flex items-center gap-2">
                        <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}" class="w-6 h-6 rounded-full bg-slate-800"/>
                        <div>
                          <div>${this.escapeHtml(u.name)}</div>
                          <div class="text-[10px] text-slate-500">${this.escapeHtml(u.email)}</div>
                        </div>
                      </td>
                      <td class="py-2.5 text-slate-300">${this.escapeHtml(u.department_name || 'CSE')}</td>
                      <td class="py-2.5 text-slate-400">${this.escapeHtml(u.designation || '')}</td>
                      <td class="py-2.5">
                        <select onchange="app.changeUserRole(${u.id}, this.value)" class="bg-slate-900 border border-slate-700 rounded text-[11px] text-indigo-400 py-1 px-1.5 focus:outline-none focus:border-indigo-500">
                          <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                          <option value="supervisor" ${u.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                          <option value="dept_admin" ${u.role === 'dept_admin' ? 'selected' : ''}>Dept Admin</option>
                          <option value="super_admin" ${u.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};


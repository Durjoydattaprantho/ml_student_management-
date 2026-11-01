// ResearchHub AI API Client
const API_BASE = "";

const api = {
  async switchRole(role) {
    const res = await fetch(`${API_BASE}/api/auth/switch-role/${role}`);
    if (!res.ok) throw new Error("Failed to switch role");
    return await res.json();
  },

  async getUsers(role = null) {
    const url = role ? `${API_BASE}/api/auth/users?role=${role}` : `${API_BASE}/api/auth/users`;
    const res = await fetch(url);
    return await res.json();
  },

  async getDepartments() {
    const res = await fetch(`${API_BASE}/api/auth/departments`);
    return await res.json();
  },

  async getProjects(filters = {}) {
    const params = new URLSearchParams();
    if (filters.domain) params.append("domain", filters.domain);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.user_id) params.append("user_id", filters.user_id);
    const res = await fetch(`${API_BASE}/api/projects?${params.toString()}`);
    return await res.json();
  },

  async getProjectDetail(id) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`);
    if (!res.ok) throw new Error("Project not found");
    return await res.json();
  },

  async createProject(data, userId = 1) {
    const res = await fetch(`${API_BASE}/api/projects?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateProject(id, data) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async saveProposal(projectId, data) {
    const res = await fetch(`${API_BASE}/api/projects/${projectId}/proposal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async postDiscussion(projectId, message, userId = 1) {
    const res = await fetch(`${API_BASE}/api/projects/${projectId}/discussions?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, message })
    });
    return await res.json();
  },

  async getTasks(projectId = null) {
    const url = projectId ? `${API_BASE}/api/tasks?project_id=${projectId}` : `${API_BASE}/api/tasks`;
    const res = await fetch(url);
    return await res.json();
  },

  async createTask(data) {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateTask(id, data) {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
    return await res.json();
  },

  async submitReview(data, supervisorId = 3) {
    const res = await fetch(`${API_BASE}/api/reviews?supervisor_id=${supervisorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getPapers(domain = null, search = null) {
    const params = new URLSearchParams();
    if (domain) params.append("domain", domain);
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/api/papers?${params.toString()}`);
    return await res.json();
  },

  async getPaperDetail(id) {
    const res = await fetch(`${API_BASE}/api/papers/${id}`);
    return await res.json();
  },

  async uploadPaper(formData) {
    const res = await fetch(`${API_BASE}/api/papers/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    return await res.json();
  },

  // Machine Learning Feature Endpoints
  async recommendTopics(field, interest, skills, preferredDomain) {
    const res = await fetch(`${API_BASE}/api/ai/topic-recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, interest, skills, preferred_domain: preferredDomain })
    });
    return await res.json();
  },

  async recommendMethodology(researchQuestion, domain, dataType, hardwareConstraint) {
    const res = await fetch(`${API_BASE}/api/ai/methodology-recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        research_question: researchQuestion,
        domain,
        data_type: dataType,
        hardware_constraint: hardwareConstraint
      })
    });
    return await res.json();
  },

  async analyzeGaps(topic, domain, keywords) {
    const res = await fetch(`${API_BASE}/api/ai/gap-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, domain, keywords })
    });
    return await res.json();
  },

  async predictProgress(projectId) {
    const res = await fetch(`${API_BASE}/api/ai/predict-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId })
    });
    return await res.json();
  },

  async summarizePaperText(text, title = "Academic Paper") {
    const res = await fetch(`${API_BASE}/api/ai/summarize-paper?title=${encodeURIComponent(title)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(text)
    });
    return await res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/api/admin/stats`);
    return await res.json();
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role?role=${role}`, {
      method: "POST"
    });
    return await res.json();
  },

  async getNotifications(userId = 1) {
    const res = await fetch(`${API_BASE}/api/notifications?user_id=${userId}`);
    return await res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: "POST" });
    return await res.json();
  }
};


const BASE_URL = "/feedback_portal/backend/";

let currentUser = localStorage.getItem("currentUser") || null;
let isAdmin = localStorage.getItem("userRole") === "admin";

const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboardPage = document.getElementById("dashboardPage");
const adminDashboardPage = document.getElementById("adminDashboardPage");
const analyticsPage = document.getElementById("analyticsPage");
const currentUserEl = document.getElementById("currentUser");
const issuesList = document.getElementById("issuesList");
const issueForm = document.getElementById("issueForm");
const issueTitleInput = document.getElementById("issueTitle");
const issueDescInput = document.getElementById("issueDesc");
const issueImageInput = document.getElementById("issueImage");
const issueCategoryInput = document.getElementById("issueCategory");
const adminIssuesList = document.getElementById("adminIssuesList");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchIssuesInput = document.getElementById("searchIssues");
const adminLogoutBtn = document.getElementById("adminLogout");

const tutorialBtn = document.getElementById("tutorialBtn");
const emergencyBtn = document.getElementById("emergencyBtn");

const pages = document.querySelectorAll(".page");
adminLogoutBtn?.addEventListener("click", logout);

const ADMIN_USER = "admin";
const ADMIN_PASS = "123";

function toggleFloatingButtons(show) {
    if (!tutorialBtn || !emergencyBtn) return;
    if (show) {
        tutorialBtn.classList.remove("hidden");
        emergencyBtn.classList.remove("hidden");
        tutorialBtn.classList.add("anim-in");
        emergencyBtn.classList.add("anim-in");
    } else {
        tutorialBtn.classList.add("hidden");
        emergencyBtn.classList.add("hidden");
    }
}

function initializeBarangays() {
    const brgySelect = document.getElementById("issueBarangay");
    if (!brgySelect) return;
    
    brgySelect.innerHTML = '<option value="" disabled selected>Select Barangay</option>';
    for (let i = 1; i <= 201; i++) {
        const opt = document.createElement("option");
        opt.value = `Barangay ${i}`;
        opt.textContent = `Barangay ${i}`;
        brgySelect.appendChild(opt);
    }
}

function populateStreets() {
    const brgySelect = document.getElementById("issueBarangay");
    const streetSelect = document.getElementById("issueStreet");
    if (!brgySelect || !streetSelect) return;

    const selectedBrgy = brgySelect.value;
    const pasayStreets = {
        "Barangay 183": ["Villamor Airbase", "Piczon St", "Andrews Ave", "Sales Road"],
        "Barangay 76": ["SM Mall of Asia", "Diokno Blvd", "Coral Way", "J.W. Diokno"],
        "Barangay 178": ["Maricaban St", "Apelo Cruz", "P. Santos"],
        "Default": ["Main Street", "Interior Road", "Side Alley"]
    };

    streetSelect.innerHTML = '<option value="" disabled selected>Select Street</option>';
    streetSelect.disabled = false;
    const streets = pasayStreets[selectedBrgy] || pasayStreets["Default"];
    streets.forEach(street => {
        const opt = document.createElement("option");
        opt.value = street;
        opt.textContent = street;
        streetSelect.appendChild(opt);
    });
}

function openImageModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    if (modal && modalImg) {
        modalImg.src = src;
        modal.classList.remove("hidden");
    }
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) modal.classList.add("hidden");
}

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800; 
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.7)); 
            };
        };
    });
}

function formatChatMessage(m, senderClass) {
    let contentHtml = "";
    if (m.text && m.text.startsWith("data:image")) {
        contentHtml = `<img src="${m.text}" class="chat-proof-img" onclick="openImageModal('${m.text}')" alt="Proof Image" style="cursor:pointer; max-width:100%; border-radius:8px; border:2px solid #FFCC00; margin-top:5px;">`;
    } else {
        contentHtml = `<span>${m.text}</span>`;
    }
    return `
        <div class="chat-message ${senderClass}">
            <strong>${m.sender}:</strong>
            <div class="message-content">${contentHtml}</div>
            <small style="display:block; font-size:0.7rem; opacity:0.7;">${new Date(m.timestamp).toLocaleString()}</small>
        </div>
    `;
}

function animateIn(el) {
    el.classList.remove("hidden");
    el.classList.remove("anim-out");
    el.classList.add("anim-in");
    const handler = () => {
        el.classList.remove("anim-in");
        el.removeEventListener("animationend", handler);
    };
    el.addEventListener("animationend", handler);
}

async function animateOut(el) {
    return new Promise((resolve) => {
        el.classList.add("anim-out");
        const handler = () => {
            el.classList.remove("anim-out");
            el.classList.add("hidden");
            el.removeEventListener("animationend", handler);
            resolve();
        };
        el.addEventListener("animationend", handler);
    });
}

async function switchPage(toEl) {
    const visible = Array.from(pages).find(p => !p.classList.contains("hidden") && p !== toEl);
    if (visible) await animateOut(visible);
    animateIn(toEl);
}

function showLogin() { 
    clearForms(); 
    switchPage(loginPage); 
    toggleFloatingButtons(true); 
}

function showRegister() { 
    clearForms(); 
    switchPage(registerPage); 
    toggleFloatingButtons(true); 
}

function showDashboard() {
    clearForms();
    if (currentUserEl) currentUserEl.textContent = currentUser;
    switchPage(dashboardPage);
    initializeBarangays(); 
    loadUserIssues();
    toggleFloatingButtons(true); 
}

function showAdminDashboard() {
    clearForms();
    switchPage(adminDashboardPage);
    loadAllIssues();
    toggleFloatingButtons(false); 
}

function logout() {
    clearForms();
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    switchPage(loginPage);
    toggleFloatingButtons(true);
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return alert(message);
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translateY(-10px) scale(0.98)";
    }, 3000);
    setTimeout(() => { if(t.parentNode) container.removeChild(t); }, 3500);
}

function generateTrackingNumber() {
    return "PID-" + Date.now().toString().slice(-6);
}

function clearForms() {
    document.querySelectorAll("#loginForm input, #registerForm input, #issueForm input, #issueForm textarea").forEach(el => {
        if (el.type !== "button" && el.type !== "submit" && el.type !== "file") {
            el.value = "";
        }
        if (el.type === "file") el.value = null;
    });
}

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const gender = document.getElementById("regGender").value;
    const password = document.getElementById("regPassword").value;
    try {
        const res = await fetch(BASE_URL + "register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, gender, password }),
        });
        const data = await res.json();
        showToast(data.message, data.success ? "success" : "error");
        if (data.success) showLogin();
    } catch (err) {
        showToast("Registration error", "error");
    }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem("userRole", "admin");
        currentUser = "Admin";
        isAdmin = true;
        showToast("Admin logged in", "success");
        showAdminDashboard();
        return;
    }

    try {
        const res = await fetch(BASE_URL + "login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user.username;
            localStorage.setItem("currentUser", currentUser);
            localStorage.setItem("userRole", "user");
            showToast("Logged in — welcome " + currentUser + "!", "success"); 
            showDashboard();
        } else {
            showToast(data.message || "Login failed", "error"); 
        }
    } catch (err) {
        showToast("Server connection error", "error");
    }
});

issueForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const brgyValue = document.getElementById("issueBarangay")?.value;
    const streetValue = document.getElementById("issueStreet")?.value;
    if (!brgyValue || !streetValue) {
        showToast("Please select a Barangay and Street.", "error");
        return;
    }
    const imageFile = issueImageInput.files[0];
    let imageUrl = null;
    try {
        if (imageFile) imageUrl = await compressImage(imageFile);
        const res = await fetch(BASE_URL + "add_issue.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tracking_id: generateTrackingNumber(),
                user: currentUser,
                title: issueTitleInput.value,
                desc: issueDescInput.value,
                category: issueCategoryInput.value,
                barangay: brgyValue,
                street: streetValue,
                image: imageUrl,
            }),
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Submitted! Tracking: ${data.tracking_id}`, "success");
            issueForm.reset();
            if(document.getElementById("issueStreet")) document.getElementById("issueStreet").disabled = true;
            loadUserIssues();
        } else {
            showToast("Error: " + data.message, "error");
        }
    } catch (err) {
        showToast("Submission failed", "error");
    }
});

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

async function loadUserIssues() {
    if(!issuesList) return;
    issuesList.innerHTML = '<div class="loader"></div>';
    try {
        const res = await fetch(BASE_URL + "get_user_issues.php?user=" + encodeURIComponent(currentUser));
        const issues = await res.json();
        issuesList.innerHTML = "";
        if (!issues || issues.length === 0) {
            issuesList.innerHTML = "<p>No reports found.</p>";
            return;
        }
        issues.forEach((issue) => {
            const div = document.createElement("div");
            div.classList.add("issue-card");
            const fullImgPath = issue.image_path ? BASE_URL + issue.image_path : null;
            let imageHtml = fullImgPath ? `<img src="${fullImgPath}" alt="Issue" onclick="openImageModal('${fullImgPath}')" style="cursor:zoom-in;">` : "";
            let chatHtml = (issue.messages || []).map((m) => formatChatMessage(m, m.sender === currentUser ? "chat-user" : "chat-admin")).join("");
            div.innerHTML = `
                ${imageHtml}
                <h4>${issue.title} <small>[${issue.tracking_id}]</small></h4>
                <p><strong>Location:</strong> ${issue.barangay}, ${issue.street}</p>
                <p><strong>Category:</strong> ${issue.category}</p>
                <p>${issue.description}</p>
                <p>Status: <span class="status-badge status-${issue.status.replace(/\s/g, "")}">${issue.status}</span></p>
                <div class="chat-box">${chatHtml || "<p>No messages yet.</p>"}</div>
                <div class="chat-input-container">
                    <textarea placeholder="Type a message..." class="chat-input"></textarea>
                    <button class="btn-chat" data-id="${issue.tracking_id}">Send</button>
                </div>
            `;
            issuesList.appendChild(div);
            cardObserver.observe(div);
        });
        attachChatListeners(loadUserIssues);
    } catch (err) {
        issuesList.innerHTML = "<p>Failed to load issues.</p>";
    }
}

async function loadAllIssues() {
    if(!adminIssuesList) return;
    adminIssuesList.innerHTML = '<div class="loader"></div>';
    try {
        const res = await fetch(BASE_URL + "get_all_issues.php");
        let issues = await res.json();
        const filterStatus = statusFilter.value || "all";
        const filterCategory = categoryFilter.value || "all";
        const searchQuery = searchIssuesInput.value?.toLowerCase() || "";
        issues = issues.filter((issue) => {
            const matchStatus = filterStatus === "all" || issue.status === filterStatus;
            const matchCategory = filterCategory === "all" || issue.category === filterCategory;
            const matchSearch = issue.tracking_id.toLowerCase().includes(searchQuery);
            return matchStatus && matchCategory && matchSearch;
        });
        adminIssuesList.innerHTML = "";
        if (!issues || issues.length === 0) {
            adminIssuesList.innerHTML = "<p>No issues found.</p>";
            return;
        }
        issues.forEach((issue) => {
            const div = document.createElement("div");
            div.classList.add("issue-card");
            const fullImgPath = issue.image_path ? BASE_URL + issue.image_path : null;
            let imageHtml = fullImgPath ? `<img src="${fullImgPath}" alt="Issue" onclick="openImageModal('${fullImgPath}')" style="cursor:zoom-in;">` : "";
            let chatHtml = (issue.messages || []).map((m) => formatChatMessage(m, m.sender === "Admin" ? "chat-admin" : "chat-user")).join("");
            div.innerHTML = `
                ${imageHtml}
                <h4>${issue.title} <small>[${issue.tracking_id}]</small></h4>
                <p><strong>Location:</strong> <span style="color:#006633; font-weight:bold;">${issue.barangay}</span>, ${issue.street}</p>
                <p><strong>Category:</strong> ${issue.category}</p>
                <p><strong>User:</strong> ${issue.user}</p>
                <p>${issue.description}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${issue.status.replace(/\s/g, "")}">${issue.status}</span></p>
                <div class="chat-box">${chatHtml || "<p>No messages yet.</p>"}</div>
                <div class="admin-chat-area">
                    <textarea placeholder="Type a reply..." class="chat-input"></textarea>
                    <div id="status-msg-${issue.tracking_id}" style="font-size: 0.8rem; color: #27ae60; margin-bottom: 5px;"></div>
                    <div class="chat-controls">
                        <input type="file" class="admin-proof-file hidden" id="proof-${issue.tracking_id}" accept="image/*">
                        <button class="btn-attachment" onclick="document.getElementById('proof-${issue.tracking_id}').click()" title="Attach Proof">📎</button>
                        <button class="btn-chat" data-id="${issue.tracking_id}">Reply</button>
                    </div>
                </div>
                <div class="admin-controls">
                    <label>Update Status:</label>
                    <select class="status-select" data-id="${issue.tracking_id}">
                        <option value="Pending" ${issue.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="In Progress" ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Resolved" ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                    <button class="btn-danger delete-btn" data-id="${issue.tracking_id}">Delete</button>
                </div>
            `;
            adminIssuesList.appendChild(div);
            cardObserver.observe(div);
        });
        attachChatListeners(loadAllIssues);
        attachAdminActionListeners();
    } catch (err) {
        adminIssuesList.innerHTML = "<p>Failed to load issues.</p>";
    }
}

function attachChatListeners(refreshCallback) {
    document.querySelectorAll(".admin-proof-file").forEach((fileInput) => {
        fileInput.onchange = (e) => {
            const issueId = e.target.id.replace('proof-', '');
            const statusMsg = document.getElementById(`status-msg-${issueId}`);
            if (e.target.files.length > 0) {
                statusMsg.textContent = "Image ready to send";
            } else {
                statusMsg.textContent = "";
            }
        };
    });
    document.querySelectorAll(".btn-chat").forEach((btn) => {
        btn.onclick = async (e) => {
            const issueId = e.target.dataset.id;
            const container = e.target.closest('.admin-chat-area') || e.target.closest('.chat-input-container');
            const input = container.querySelector('.chat-input');
            const fileInput = container.querySelector('.admin-proof-file');
            const statusMsg = document.getElementById(`status-msg-${issueId}`);
            const text = input.value.trim();
            if (text) await sendMessage(issueId, text, isAdmin ? "Admin" : currentUser);
            if (fileInput && fileInput.files[0]) {
                const compressedImg = await compressImage(fileInput.files[0]);
                await sendMessage(issueId, compressedImg, isAdmin ? "Admin" : currentUser);
                fileInput.value = ""; 
                if (statusMsg) statusMsg.textContent = "";
            }
            if (text || (fileInput && fileInput.files[0])) {
                input.value = "";
                refreshCallback();
            }
        };
    });
}

function attachAdminActionListeners() {
    document.querySelectorAll(".status-select").forEach((select) => {
        select.onchange = async (e) => {
            const id = e.target.dataset.id;
            await updateIssueStatus(id, e.target.value);
            loadAllIssues();
        };
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.onclick = async (e) => {
            const id = e.target.dataset.id;
            if (confirm("Delete this issue?")) {
                await deleteIssue(id);
                loadAllIssues();
            }
        };
    });
}

async function sendMessage(tracking_id, text, sender) {
    await fetch(BASE_URL + "add_message.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id, sender, text }),
    });
}

async function updateIssueStatus(tracking_id, status) {
    await fetch(BASE_URL + "update_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id, status }),
    });
}

async function deleteIssue(tracking_id) {
    await fetch(BASE_URL + "delete_issue.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id }),
    });
}

function loadAnalytics(issues) {
    if (!Array.isArray(issues)) return;
    const total = issues.length;
    const pending = issues.filter(i => i.status === "Pending").length;
    const inProgress = issues.filter(i => i.status === "In Progress").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;

    document.getElementById("totalIssuesCard").textContent = `Total Feedback: ${total}`;
    document.getElementById("pendingIssuesCard").textContent = `Pending: ${pending}`;
    document.getElementById("progressIssuesCard").textContent = `In Progress: ${inProgress}`;
    document.getElementById("resolvedIssuesCard").textContent = `Resolved: ${resolved}`;

    const chartLabels = ["Garbage Collection", "Traffic & Stoplights", "Road Maintenance", "Street Lighting", "Public Safety", "Others"];
    const counts = { "Garbage Collection": 0, "Traffic & Stoplights": 0, "Road Maintenance": 0, "Street Lighting": 0, "Public Safety": 0, "Others": 0 };
    issues.forEach(i => {
        const cat = i.category || "Others";
        if (counts.hasOwnProperty(cat)) counts[cat]++;
        else counts["Others"]++;
    });
    const ctx = document.getElementById("issuesByCategoryChart");
    if (!ctx) return;
    if (window.categoryChart) window.categoryChart.destroy();
    window.categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartLabels,
            datasets: [{
                label: "Number of Feedback",
                data: chartLabels.map(l => counts[l]),
                backgroundColor: ["#27ae60", "#e67e22", "#2980b9", "#f1c40f", "#e74c3c", "#95a5a6"],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin") {
        currentUser = "Admin";
        isAdmin = true;
        showAdminDashboard();
    } else if (userRole === "user" && currentUser) {
        showDashboard();
    } else {
        showLogin();
    }

    statusFilter?.addEventListener("change", loadAllIssues);
    categoryFilter?.addEventListener("change", loadAllIssues);
    searchIssuesInput?.addEventListener("input", loadAllIssues);
    document.getElementById("issueBarangay")?.addEventListener("change", populateStreets);

    document.getElementById("viewAnalyticsBtn")?.addEventListener("click", async () => {
        adminDashboardPage.classList.add("hidden");
        analyticsPage.classList.remove("hidden");
        toggleFloatingButtons(false);
        try {
            const res = await fetch(BASE_URL + "get_all_issues.php");
            const issues = await res.json();
            loadAnalytics(issues);
        } catch { showToast("Failed to load analytics", "error"); }
    });

    document.getElementById("backToIssuesBtn")?.addEventListener("click", () => {
        analyticsPage.classList.add("hidden");
        adminDashboardPage.classList.remove("hidden");
        toggleFloatingButtons(false);
    });

    document.getElementById("exportCSV")?.addEventListener("click", () => {
        window.location.href = BASE_URL + "export_issues.php";
    });
});

function toggleEmergencyModal(show) {
    const modal = document.getElementById('emergencyModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

window.onclick = function(event) {
    const modal = document.getElementById('emergencyModal');
    const imgModal = document.getElementById('imageModal');
    if (event.target == modal) toggleEmergencyModal(false);
    if (event.target == imgModal) closeImageModal();
}

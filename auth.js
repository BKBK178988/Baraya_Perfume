// Simple client-side auth (localStorage-based) for demo purposes
// WARNING: This is NOT secure for production. Use a server-side auth + DB in real apps.

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    // update header UI if present
    updateAuthUI();
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

function registerUser({name, email, password, address, phone}) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return { ok: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }
    const user = { name, email, password, address, phone };
    users.push(user);
    saveUsers(users);
    setCurrentUser({ name, email, address, phone });
    return { ok: true, user };
}

function loginUser(email, password) {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    setCurrentUser({ name: found.name, email: found.email, address: found.address, phone: found.phone });
    return { ok: true, user: found };
}

function logoutUser() {
    clearCurrentUser();
    if (window.toast) window.toast.info('ออกจากระบบเรียบร้อยแล้ว');
}

// Update header area (if present in page)
function updateAuthUI() {
    const container = document.getElementById('auth-area');
    if (!container) return;
    const user = getCurrentUser();
    if (user) {
        container.innerHTML = `
            <span style="margin-right:12px; font-weight:600; color: #fff">สวัสดี, ${escapeHtml(user.name)}</span>
            <button id="logoutBtn" class="cart-button" style="background: rgba(255,255,255,0.12);">ออกจากระบบ</button>
        `;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            logoutUser();
            // if on auth page, refresh
            if (window.location.pathname.endsWith('auth.html')) location.reload();
        });
    } else {
        container.innerHTML = `
            <a href="auth.html" style="color:white; text-decoration:none; font-weight:600;">เข้าสู่ระบบ / สมัครสมาชิก</a>
        `;
    }
}

// Utility: simple escaping to avoid injecting html from stored names
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/\'/g, "&#039;");
}

// expose functions
window.auth = {
    getUsers,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    setCurrentUser
};

// initialize UI if page has auth area
document.addEventListener('DOMContentLoaded', updateAuthUI);

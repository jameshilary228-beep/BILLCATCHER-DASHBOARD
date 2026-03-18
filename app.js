const { Client, Account, Databases, ID, Query } = Appwrite;

// --- 1. CONFIGURATION ---
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('69b87582000bce154511');

const account = new Account(client);
const databases = new Databases(client);

const dbId = 'billcatcherdp';
const collId = 'longs';
let isLogin = true;
let limit = localStorage.getItem('bc_limit') || 50000;
let rawData = [];

// --- 2. UI HELPERS ---
function notify(msg, color = "#6366f1") {
    const t = document.getElementById('toast');
    if(!t) return;
    t.innerText = msg; t.style.background = color;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// THE ICON LOGIC IS BACK HERE!
function togglePass() {
    const p = document.getElementById('pwd');
    const e = document.getElementById('eye');
    if (p.type === 'password') {
        p.type = 'text';
        e.classList.remove('fa-eye');
        e.classList.add('fa-eye-slash');
    } else {
        p.type = 'password';
        e.classList.remove('fa-eye-slash');
        e.classList.add('fa-eye');
    }
}

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Partner Login" : "Register Business";
    document.getElementById('auth-btn').innerText = isLogin ? "Enter Dashboard" : "Register & Enter";
    document.getElementById('toggle-text').innerText = isLogin ? "New Company? Create SaaS Account" : "Already have account? Login";
}

// --- 3. AUTH & FORGOT PASSWORD ---
async function handleAuth() {
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('pwd').value;
    if(!email || !pwd) return notify("Enter details first!", "#ef4444");

    const authBtn = document.getElementById('auth-btn');
    authBtn.disabled = true;

    try {
        notify("Syncing identity...");
        if(isLogin) {
            await account.createEmailSession(email, pwd);
        } else {
            await account.create(ID.unique(), email, pwd);
            await account.createEmailSession(email, pwd);
        }
        notify("Welcome back!", "#10b981");
        startApp();
    } catch (err) {
        authBtn.disabled = false;
        notify(err.message, "#ef4444");
    }
}

function forgotPass() {
    notify("Connecting to support...");
    setTimeout(() => {
        const myNumber = "2348000000000"; // CHANGE TO YOUR NUMBER
        const userEmail = document.getElementById('email').value || "Customer";
        const text = `Hello Support, I am ${userEmail}. I need help resetting my BillCatcher password.`;
        window.open(`https://wa.me/${myNumber}?text=${encodeURIComponent(text)}`, "_blank");
    }, 1000);
}

// --- 4. DATA LOGIC ---
async function startApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    fetchData();
}

async function saveBill() {
    try {
        const user = await account.get();
        const data = {
            Staff: document.getElementById('staff').value,
            item: document.getElementById('item').value,
            amount: Number(document.getElementById('amt').value),
            currency: document.getElementById('curr').value,
            userId: user.$id // This matches the Capital 'I'
        };
        await databases.createDocument(dbId, collId, ID.unique(), data);
        notify("Bill Saved!", "#10b981");
        showPage('dash'); 
        fetchData();
        document.getElementById('staff').value = "";
        document.getElementById('item').value = "";
        document.getElementById('amt').value = "";
    } catch (err) { 
        notify(err.message, "#ef4444"); 
    }
}

async function fetchData() {
    try {
        const user = await account.get();
        const res = await databases.listDocuments(dbId, collId, [
            Query.equal('userId', user.$id),
            Query.orderDesc('$createdAt')
        ]);
        
        rawData = res.documents;
        let grandTotal = 0; let weeklyTotal = 0; let monthlyTotal = 0; let html = "";
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        startOfWeek.setHours(0,0,0,0);

        res.documents.forEach(doc => {
            const billDate = new Date(doc.$createdAt);
            const amt = Number(doc.amount);
            grandTotal += amt;
            if (billDate >= startOfMonth) monthlyTotal += amt;
            if (billDate >= startOfWeek) weeklyTotal += amt;
            
            const dString = billDate.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
            html += `<div class="log-item">
                <div><b>${doc.currency}${amt.toLocaleString()}</b><br>
                <small style="color:#94a3b8">${doc.item} | ${doc.Staff} | ${dString}</small></div>
                <button onclick="deleteBill('${doc.$id}')" style="background:none; border:none; color:#ef4444; font-size:1.3rem;">&times;</button>
            </div>`;
        });

        document.getElementById('total-val').innerText = `₦ ${grandTotal.toLocaleString()}`;
        document.getElementById('weekly-val').innerText = `₦ ${weeklyTotal.toLocaleString()}`;
        document.getElementById('monthly-val').innerText = `₦ ${monthlyTotal.toLocaleString()}`;
        
        const badge = document.getElementById('status-badge');
        const progress = document.getElementById('budget-progress');
        let percent = (grandTotal / limit) * 100;
        progress.style.width = (percent > 100 ? 100 : percent) + "%";

        if (grandTotal > limit) {
            badge.innerText = "OVER BUDGET"; badge.style.color = "#ef4444";
            progress.style.background = "#ef4444";
        } else {
            badge.innerText = "SAFE BALANCE"; badge.style.color = "#10b981";
            progress.style.background = "#10b981";
        }

        document.getElementById('limit-info').innerText = `Limit: ₦${Number(limit).toLocaleString()}`;
        document.getElementById('logs-list').innerHTML = html || "No records in vault.";
    } catch (err) { console.error(err); }
}

async function deleteBill(id) {
    if(!confirm("Delete this record permanently?")) return;
    try { 
        await databases.deleteDocument(dbId, collId, id); 
        notify("Purged!"); 
        fetchData(); 
    } catch (err) { notify(err.message, "#ef4444"); }
}

// --- 5. NAVIGATION ---
function openModal() { document.getElementById('budget-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('budget-modal').classList.add('hidden'); }

function updateLimit() {
    const val = document.getElementById('new-limit').value;
    if(val) {
        limit = val;
        localStorage.setItem('bc_limit', val);
        fetchData();
        closeModal();
        notify("New Limit Set!");
    }
}

function showPage(p) {
    document.getElementById('dash-page').classList.toggle('hidden', p !== 'dash');
    document.getElementById('log-page').classList.toggle('hidden', p !== 'log');
}

function logout() { 
    account.deleteSession('current').then(() => location.reload()); 
}

account.get().then(startApp).catch(() => {});


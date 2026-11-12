// =====================================================
// SMART PHARMACY
// COMPLETE MAIN APPLICATION
// Powered by ATIK TECHNOLOGIES
// =====================================================

import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    doc,
    collection,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    runTransaction,
    increment
} from "./firebase.js";

import {
    createEmployee,
    deactivateEmployee
} from "./functions.js";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentUser = null;
let pharmacyData = null;

let cart = [];
let purchaseCart = [];

let stockCache = [];
let customerCache = [];
let supplierCache = [];
let employeeCache = [];

let currentLanguage =
    localStorage.getItem("smartPharmacyLanguage") || "bn";

let isLoading = false;

const $ = id => document.getElementById(id);

const currency = amount =>
    "৳ " + Number(amount || 0).toFixed(2);

const today = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 10);
};

const dateValue = value => {
    if (!value) return "";

    if (value.toDate) {
        return value.toDate().toISOString().slice(0, 10);
    }

    return String(value).slice(0, 10);
};

const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);


// =====================================================
// LANGUAGE DICTIONARY
// =====================================================

const translations = {

bn: {

loading: "লোড হচ্ছে...",
authSubtitle: "আপনার ফার্মেসি পরিচালনার স্মার্ট সমাধান",

loginTitle: "লগইন করুন",
loginSubtitle: "আপনার অ্যাকাউন্টে প্রবেশ করুন",
email: "ইমেইল",
password: "পাসওয়ার্ড",
emailPlaceholder: "আপনার ইমেইল লিখুন",
passwordPlaceholder: "পাসওয়ার্ড লিখুন",
loginBtn: "লগইন",
forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
noAccount: "অ্যাকাউন্ট নেই?",
registerNow: "রেজিস্ট্রেশন করুন",

registerTitle: "ফার্মেসি রেজিস্ট্রেশন",
registerSubtitle: "আপনার ফার্মেসির অ্যাকাউন্ট তৈরি করুন",
shopName: "ফার্মেসির নাম",
shopNamePlaceholder: "ফার্মেসির নাম লিখুন",
ownerName: "মালিকের নাম",
ownerNamePlaceholder: "মালিকের নাম লিখুন",
mobile: "মোবাইল নম্বর",
mobilePlaceholder: "মোবাইল নম্বর লিখুন",
address: "ঠিকানা",
addressPlaceholder: "ফার্মেসির ঠিকানা লিখুন",
confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
confirmPasswordPlaceholder: "আবার পাসওয়ার্ড লিখুন",
createPasswordPlaceholder: "পাসওয়ার্ড তৈরি করুন",
createAccount: "অ্যাকাউন্ট তৈরি করুন",
alreadyAccount: "আগে থেকেই অ্যাকাউন্ট আছে?",
loginNow: "লগইন করুন",

logout: "লগআউট",
owner: "মালিক:",
mainMenu: "প্রধান মেনু",

dashboard: "ড্যাশবোর্ড",
stock: "স্টক ব্যবস্থাপনা",
sales: "বিক্রয়",
purchase: "ক্রয়",
suppliers: "সরবরাহকারী",
customers: "কাস্টমার",
employees: "কর্মচারী",
incomeExpense: "আয় ও ব্যয়",
reports: "রিপোর্ট",
support: "সাপোর্ট",
settings: "সেটিংস",

dashboardSubtitle: "আপনার ফার্মেসির সার্বিক অবস্থা",
todaySales: "আজকের বিক্রয়",
totalPurchase: "মোট ক্রয়",
todayProfit: "আজকের লাভ",
lowStock: "কম স্টক",
expiryAlert: "মেয়াদ শেষের সতর্কতা",
employeeCount: "কর্মচারী",
invoiceCount: "মোট ইনভয়েস",
customerDue: "কাস্টমার বকেয়া",
recentSales: "সাম্প্রতিক বিক্রয়",
invoice: "ইনভয়েস",
date: "তারিখ",
amount: "পরিমাণ",
status: "অবস্থা",
noData: "কোনো তথ্য নেই",
importantAlerts: "গুরুত্বপূর্ণ সতর্কতা",
noAlerts: "বর্তমানে কোনো সতর্কতা নেই।",

stockSubtitle: "ওষুধের স্টক যোগ ও পরিচালনা করুন",
addMedicine: "নতুন ওষুধ যোগ করুন",
medicineName: "ওষুধের নাম",
manufacturer: "প্রস্তুতকারক কোম্পানি",
boxQuantity: "বক্স/কার্টনের সংখ্যা",
piecesPerBox: "প্রতি বক্সে পিস",
totalPieces: "মোট পিস",
purchasePrice: "প্রতি পিস ক্রয়মূল্য",
sellingPrice: "প্রতি পিস বিক্রয়মূল্য",
rackNumber: "র‍্যাক নম্বর",
batchNumber: "ব্যাচ নম্বর",
expiryDate: "মেয়াদ শেষের তারিখ",
saveStock: "স্টক সংরক্ষণ করুন",
stockList: "স্টক তালিকা",
searchMedicine: "ওষুধ খুঁজুন",
availablePieces: "স্টক",

salesSubtitle: "ওষুধ বিক্রয় ও ইনভয়েস তৈরি করুন",
salesCart: "বিক্রয়ের তালিকা",
quantity: "পরিমাণ (পিস)",
unitPrice: "প্রতি পিস মূল্য",
total: "মোট",
action: "অ্যাকশন",
emptyCart: "বিক্রয়ের তালিকা খালি",
grandTotal: "সর্বমোট:",
customer: "কাস্টমার",
walkInCustomer: "সাধারণ কাস্টমার",
discount: "ছাড়",
amountPaid: "পরিশোধিত টাকা",
completeSale: "বিক্রয় সম্পন্ন করুন",

purchaseSubtitle: "সরবরাহকারীর কাছ থেকে ওষুধ ক্রয় করুন",
newPurchase: "নতুন ক্রয়",
supplier: "সরবরাহকারী",
purchaseDate: "ক্রয়ের তারিখ",
purchaseItems: "ক্রয়ের পণ্য",
savePurchase: "ক্রয় সংরক্ষণ করুন",
purchaseHistory: "ক্রয়ের ইতিহাস",
due: "বকেয়া",

addSupplier: "নতুন সরবরাহকারী",
supplierName: "সরবরাহকারীর নাম",
openingDue: "প্রারম্ভিক বকেয়া",
saveSupplier: "সংরক্ষণ করুন",
supplierList: "সরবরাহকারী তালিকা",

addCustomer: "নতুন কাস্টমার",
customerName: "কাস্টমারের নাম",
note: "নোট",
saveCustomer: "সংরক্ষণ করুন",
customerList: "কাস্টমার তালিকা",

addEmployee: "নতুন কর্মচারী",
employeeName: "কর্মচারীর নাম",
role: "পদবি",
staff: "স্টাফ",
manager: "ম্যানেজার",
createEmployee: "কর্মচারী অ্যাকাউন্ট তৈরি করুন",
employeeSecurityNote: "কর্মচারীর অ্যাকাউন্ট নিরাপদ Backend-এর মাধ্যমে তৈরি হবে।",
employeeList: "কর্মচারী তালিকা",

addTransaction: "নতুন লেনদেন",
transactionType: "লেনদেনের ধরন",
income: "আয়",
expense: "ব্যয়",
category: "ক্যাটাগরি",
description: "বিবরণ",
saveTransaction: "সংরক্ষণ করুন",
transactionHistory: "লেনদেনের ইতিহাস",

reportFilter: "রিপোর্ট নির্বাচন",
fromDate: "শুরুর তারিখ",
toDate: "শেষের তারিখ",
reportType: "রিপোর্টের ধরন",
profit: "লাভ",
generateReport: "রিপোর্ট তৈরি করুন",
print: "প্রিন্ট",
exportCSV: "CSV ডাউনলোড",
reportResult: "রিপোর্ট ফলাফল",

needHelp: "আপনার কি সাহায্য প্রয়োজন?",
subject: "বিষয়",
message: "বিস্তারিত",
submitRequest: "সাপোর্ট অনুরোধ পাঠান",
supportHistory: "সাপোর্ট অনুরোধের ইতিহাস",

pharmacySettings: "ফার্মেসির সেটিংস",
lowStockThreshold: "কম স্টকের সীমা",
expiryAlertDays: "মেয়াদ সতর্কতার দিন",
saveSettings: "সেটিংস সংরক্ষণ করুন",
accountSecurity: "অ্যাকাউন্ট নিরাপত্তা",
resetPassword: "পাসওয়ার্ড রিসেট করুন",

backupRestore: "ব্যাকআপ ও রিস্টোর",
backupDescription: "আপনার ফার্মেসির তথ্যের ব্যাকআপ ও পুনরুদ্ধার ব্যবস্থা।",
createBackup: "ব্যাকআপ তৈরি করুন",
restoreBackup: "ব্যাকআপ রিস্টোর করুন"

},

en: {

loading: "Loading...",
authSubtitle: "Smart solution for managing your pharmacy",

loginTitle: "Login",
loginSubtitle: "Sign in to your account",
email: "Email",
password: "Password",
emailPlaceholder: "Enter your email",
passwordPlaceholder: "Enter your password",
loginBtn: "Login",
forgotPassword: "Forgot password?",
noAccount: "Don't have an account?",
registerNow: "Register",

registerTitle: "Pharmacy Registration",
registerSubtitle: "Create your pharmacy account",
shopName: "Pharmacy Name",
shopNamePlaceholder: "Enter pharmacy name",
ownerName: "Owner Name",
ownerNamePlaceholder: "Enter owner name",
mobile: "Mobile Number",
mobilePlaceholder: "Enter mobile number",
address: "Address",
addressPlaceholder: "Enter pharmacy address",
confirmPassword: "Confirm Password",
confirmPasswordPlaceholder: "Enter password again",
createPasswordPlaceholder: "Create password",
createAccount: "Create Account",
alreadyAccount: "Already have an account?",
loginNow: "Login",

logout: "Logout",
owner: "Owner:",
mainMenu: "Main Menu",

dashboard: "Dashboard",
stock: "Stock Management",
sales: "Sales",
purchase: "Purchase",
suppliers: "Suppliers",
customers: "Customers",
employees: "Employees",
incomeExpense: "Income & Expense",
reports: "Reports",
support: "Support",
settings: "Settings",

dashboardSubtitle: "Overview of your pharmacy",
todaySales: "Today's Sales",
totalPurchase: "Total Purchases",
todayProfit: "Today's Profit",
lowStock: "Low Stock",
expiryAlert: "Expiry Alerts",
employeeCount: "Employees",
invoiceCount: "Total Invoices",
customerDue: "Customer Due",
recentSales: "Recent Sales",
invoice: "Invoice",
date: "Date",
amount: "Amount",
status: "Status",
noData: "No data available",
importantAlerts: "Important Alerts",
noAlerts: "No current alerts.",

stockSubtitle: "Add and manage medicine stock",
addMedicine: "Add New Medicine",
medicineName: "Medicine Name",
manufacturer: "Manufacturer",
boxQuantity: "Box/Carton Quantity",
piecesPerBox: "Pieces Per Box",
totalPieces: "Total Pieces",
purchasePrice: "Purchase Price Per Piece",
sellingPrice: "Selling Price Per Piece",
rackNumber: "Rack Number",
batchNumber: "Batch Number",
expiryDate: "Expiry Date",
saveStock: "Save Stock",
stockList: "Stock List",
searchMedicine: "Search Medicine",
availablePieces: "Available Stock",

salesSubtitle: "Sell medicines and create invoices",
salesCart: "Sales Cart",
quantity: "Quantity (Pieces)",
unitPrice: "Unit Price",
total: "Total",
action: "Action",
emptyCart: "Sales cart is empty",
grandTotal: "Grand Total:",
customer: "Customer",
walkInCustomer: "Walk-in Customer",
discount: "Discount",
amountPaid: "Amount Paid",
completeSale: "Complete Sale",

purchaseSubtitle: "Purchase medicines from suppliers",
newPurchase: "New Purchase",
supplier: "Supplier",
purchaseDate: "Purchase Date",
purchaseItems: "Purchase Items",
savePurchase: "Save Purchase",
purchaseHistory: "Purchase History",
due: "Due",

addSupplier: "Add Supplier",
supplierName: "Supplier Name",
openingDue: "Opening Due",
saveSupplier: "Save Supplier",
supplierList: "Supplier List",

addCustomer: "Add Customer",
customerName: "Customer Name",
note: "Note",
saveCustomer: "Save Customer",
customerList: "Customer List",

addEmployee: "Add Employee",
employeeName: "Employee Name",
role: "Role",
staff: "Staff",
manager: "Manager",
createEmployee: "Create Employee Account",
employeeSecurityNote: "Employee accounts must be created through a secure backend.",
employeeList: "Employee List",

addTransaction: "New Transaction",
transactionType: "Transaction Type",
income: "Income",
expense: "Expense",
category: "Category",
description: "Description",
saveTransaction: "Save Transaction",
transactionHistory: "Transaction History",

reportFilter: "Report Filter",
fromDate: "From Date",
toDate: "To Date",
reportType: "Report Type",
profit: "Profit",
generateReport: "Generate Report",
print: "Print",
exportCSV: "Download CSV",
reportResult: "Report Result",

needHelp: "Do you need help?",
subject: "Subject",
message: "Details",
submitRequest: "Submit Support Request",
supportHistory: "Support Request History",

pharmacySettings: "Pharmacy Settings",
lowStockThreshold: "Low Stock Threshold",
expiryAlertDays: "Expiry Alert Days",
saveSettings: "Save Settings",
accountSecurity: "Account Security",
resetPassword: "Reset Password",

backupRestore: "Backup & Restore",
backupDescription: "Backup and recovery of pharmacy data.",
createBackup: "Create Backup",
restoreBackup: "Restore Backup"

}

};


// =====================================================
// LANGUAGE ENGINE
// =====================================================

function translatePage() {

    const dictionary = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.dataset.i18n;

        if (dictionary[key]) {
            element.textContent = dictionary[key];
        }

    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {

        const key = element.dataset.i18nPlaceholder;

        if (dictionary[key]) {
            element.placeholder = dictionary[key];
        }

    });

    const buttonText =
        currentLanguage === "bn" ? "English" : "বাংলা";

    if ($("languageBtn")) {
        $("languageBtn").textContent = buttonText;
    }

    if ($("languageBtnApp")) {
        $("languageBtnApp").textContent = buttonText;
    }

    localStorage.setItem(
        "smartPharmacyLanguage",
        currentLanguage
    );

}


function toggleLanguage() {

    currentLanguage =
        currentLanguage === "bn" ? "en" : "bn";

    translatePage();

    renderCart();

}


$("languageBtn")?.addEventListener("click", toggleLanguage);

$("languageBtnApp")?.addEventListener("click", toggleLanguage);


// =====================================================
// MESSAGE SYSTEM
// =====================================================

function showMessage(message, type = "success") {

    const box = $("appMessage");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;

    box.className = "message-box show " + type;

    setTimeout(() => {
        box.classList.remove("show");
    }, 4000);

}


function showAuthMessage(message, type = "error") {

    const box = $("authMessage");

    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;

    box.className = "message-box show " + type;

}


// =====================================================
// FRIENDLY ERROR HANDLER
// =====================================================

function getFriendlyError(error) {

    const code = error?.code || "";

    const messages = {

        "auth/email-already-in-use":
            ["এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।",
             "An account already exists with this email."],

        "auth/invalid-email":
            ["ইমেইল ঠিক নয়।",
             "Invalid email address."],

        "auth/weak-password":
            ["পাসওয়ার্ড আরও শক্তিশালী করুন।",
             "Please use a stronger password."],

        "auth/invalid-credential":
            ["ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
             "Invalid email or password."],

        "auth/user-not-found":
            ["এই অ্যাকাউন্ট পাওয়া যায়নি।",
             "Account not found."],

        "auth/wrong-password":
            ["পাসওয়ার্ড সঠিক নয়।",
             "Incorrect password."],

        "permission-denied":
            ["এই কাজের অনুমতি নেই।",
             "You do not have permission."],

        "unavailable":
            ["ইন্টারনেট সংযোগ পরীক্ষা করুন।",
             "Please check your internet connection."]

    };

    if (messages[code]) {
        return messages[code][currentLanguage === "bn" ? 0 : 1];
    }

    return error?.message || (
        currentLanguage === "bn"
            ? "একটি সমস্যা হয়েছে।"
            : "An error occurred."
    );

}


// =====================================================
// AUTHENTICATION UI
// =====================================================

function showLogin() {

    $("loginForm")?.classList.remove("hidden");
    $("registerForm")?.classList.add("hidden");

}


function showRegister() {

    $("registerForm")?.classList.remove("hidden");
    $("loginForm")?.classList.add("hidden");

}


// HTML-এ বিকল্প ID থাকলেও কাজ করবে
$("showRegisterBtn")?.addEventListener("click", showRegister);

$("showLoginBtn")?.addEventListener("click", showLogin);


// =====================================================
// PHARMACY REGISTRATION
// =====================================================

$("registerForm")?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (isLoading) return;

        const shopName = $("shopName")?.value.trim();
        const ownerName = $("ownerName")?.value.trim();
        const mobile = $("ownerMobile")?.value.trim();
        const address = $("ownerAddress")?.value.trim();
        const email = $("ownerEmail")?.value.trim().toLowerCase();
        const password = $("registerPassword")?.value;
        const confirmPassword = $("confirmPassword")?.value;

        if (!shopName || !ownerName || !mobile || !email || !password) {
            showAuthMessage(
                currentLanguage === "bn"
                    ? "সব প্রয়োজনীয় তথ্য পূরণ করুন।"
                    : "Please complete all required fields."
            );
            return;
        }

        if (password !== confirmPassword) {
            showAuthMessage(
                currentLanguage === "bn"
                    ? "দুটি পাসওয়ার্ড মিলছে না।"
                    : "Passwords do not match."
            );
            return;
        }

        if (password.length < 8) {
            showAuthMessage(
                currentLanguage === "bn"
                    ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
                    : "Password must contain at least 8 characters."
            );
            return;
        }

        isLoading = true;

        try {

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const uid = result.user.uid;

            const batchData = {
                shopName,
                ownerName,
                mobile,
                address,
                email,
                ownerId: uid,
                ownerUid: uid,
                createdAt: serverTimestamp(),
                settings: {
                    lowStockThreshold: 10,
                    expiryAlertDays: 30
                }
            };

            await setDoc(
                doc(db, "pharmacies", uid),
                batchData
            );

            await setDoc(
                doc(db, "users", uid),
                {
                    uid,
                    name: ownerName,
                    mobile,
                    email,
                    role: "owner",
                    pharmacyId: uid,
                    active: true,
                    createdAt: serverTimestamp()
                }
            );

            showAuthMessage(
                currentLanguage === "bn"
                    ? "রেজিস্ট্রেশন সফল হয়েছে।"
                    : "Registration successful.",
                "success"
            );

        } catch (error) {

            showAuthMessage(getFriendlyError(error));

        } finally {

            isLoading = false;

        }

    }
);


// =====================================================
// LOGIN
// =====================================================

$("loginForm")?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (isLoading) return;

        const email = $("loginEmail")?.value.trim();
        const password = $("loginPassword")?.value;

        if (!email || !password) {
            showAuthMessage(
                currentLanguage === "bn"
                    ? "ইমেইল ও পাসওয়ার্ড লিখুন।"
                    : "Enter email and password."
            );
            return;
        }

        isLoading = true;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            showAuthMessage(getFriendlyError(error));

        } finally {

            isLoading = false;

        }

    }
);


// =====================================================
// PASSWORD RESET
// =====================================================

$("forgotPasswordBtn")?.addEventListener(
    "click",
    async () => {

        const email = $("loginEmail")?.value.trim();

        if (!email) {
            showAuthMessage(
                currentLanguage === "bn"
                    ? "প্রথমে ইমেইল লিখুন।"
                    : "Enter your email first."
            );
            return;
        }

        try {

            await sendPasswordResetEmail(auth, email);

            showAuthMessage(
                currentLanguage === "bn"
                    ? "পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।"
                    : "Password reset link sent to your email.",
                "success"
            );

        } catch (error) {

            showAuthMessage(getFriendlyError(error));

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

$("logoutBtn")?.addEventListener(
    "click",
    async () => {

        const confirmed = confirm(
            currentLanguage === "bn"
                ? "আপনি কি লগআউট করতে চান?"
                : "Do you want to logout?"
        );

        if (!confirmed) return;

        try {
            await signOut(auth);
        } catch (error) {
            showMessage(getFriendlyError(error), "error");
        }

    }
);


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(auth, async user => {

    $("loadingScreen")?.classList.add("hidden");

    if (user) {

        currentUser = user;

        $("authSection")?.classList.add("hidden");
        $("appSection")?.classList.remove("hidden");

        await loadPharmacy();

    } else {

        currentUser = null;
        pharmacyData = null;

        $("appSection")?.classList.add("hidden");
        $("authSection")?.classList.remove("hidden");

        showLogin();

    }

    translatePage();

});


// =====================================================
// LOAD PHARMACY
// =====================================================

async function loadPharmacy() {

    if (!currentUser) return;

    try {

        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            await signOut(auth);
            throw new Error(
                currentLanguage === "bn"
                    ? "ব্যবহারকারীর তথ্য পাওয়া যায়নি।"
                    : "User profile not found."
            );
        }

        const userData = userSnapshot.data();

        if (userData.active !== true) {
            await signOut(auth);
            throw new Error(
                currentLanguage === "bn"
                    ? "আপনার অ্যাকাউন্ট নিষ্ক্রিয়।"
                    : "Your account is inactive."
            );
        }

        const pharmacyId = userData.pharmacyId;

        if (!pharmacyId) {
            throw new Error("Pharmacy ID missing.");
        }

        const pharmacyRef = doc(db, "pharmacies", pharmacyId);
        const snapshot = await getDoc(pharmacyRef);

        if (!snapshot.exists()) {
            throw new Error(
                currentLanguage === "bn"
                    ? "ফার্মেসির তথ্য পাওয়া যায়নি।"
                    : "Pharmacy information not found."
            );
        }

        pharmacyData = snapshot.data();

        // Keep the signed-in user's pharmacy ID
        currentUser.pharmacyId = pharmacyId;

        $("displayShopName").textContent =
            pharmacyData.shopName || "";

        $("displayOwnerName").textContent =
            pharmacyData.ownerName || "";

        $("displayMobile").textContent =
            pharmacyData.mobile || "";

        $("displayAddress").textContent =
            pharmacyData.address || "";

        if ($("settingsShopName")) {
            $("settingsShopName").value =
                pharmacyData.shopName || "";
        }

        if ($("settingsMobile")) {
            $("settingsMobile").value =
                pharmacyData.mobile || "";
        }

        if ($("settingsAddress")) {
            $("settingsAddress").value =
                pharmacyData.address || "";
        }

        if ($("lowStockThreshold")) {
            $("lowStockThreshold").value =
                pharmacyData.settings?.lowStockThreshold ?? 10;
        }

        if ($("expiryAlertDays")) {
            $("expiryAlertDays").value =
                pharmacyData.settings?.expiryAlertDays ?? 30;
        }

        await loadStock();
        await loadCustomers();
        await loadSuppliers();

        // Part 2 will add loadEmployees()
        await updateDashboard();

    } catch (error) {

        console.error("Load pharmacy error:", error);

        showMessage(getFriendlyError(error), "error");

    }

}


// =====================================================
// FIRESTORE COLLECTION HELPER
// =====================================================

function shopCollection(name) {

    if (!currentUser?.pharmacyId) {
        throw new Error("Pharmacy is not loaded.");
    }

    return collection(
        db,
        "pharmacies",
        currentUser.pharmacyId,
        name
    );

}


// =====================================================
// NAVIGATION
// =====================================================

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        const pageId = button.dataset.page;

        document.querySelectorAll(".page-section")
            .forEach(page => page.classList.add("hidden"));

        $(pageId)?.classList.remove("hidden");

        document.querySelectorAll(".nav-item")
            .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        if (pageId === "dashboardPage") {
            updateDashboard();
        }

        if (pageId === "employeesPage") {
            loadEmployees();
        }

    });

});

// =====================================================
// PART 2: STOCK MANAGEMENT
// =====================================================

// স্টক লোড
async function loadStock() {

    if (!currentUser) return;

    const snapshot = await getDocs(shopCollection("stock"));

    stockCache = [];

    snapshot.forEach(item => {
        stockCache.push({
            id: item.id,
            ...item.data()
        });
    });

    renderStock();
}


// নতুন ওষুধ যোগ
$("stockForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        const medicineName = $("medicineName").value.trim();
        const company = $("medicineCompany").value.trim();

        const boxQuantity = Number($("boxQuantity").value || 0);
        const piecesPerBox = Number($("piecesPerBox").value || 0);

        const totalPieces = Number($("totalPieces").value);

        const purchasePrice = Number($("purchasePrice").value);
        const sellingPrice = Number($("sellingPrice").value);

        const rackNumber = $("rackNumber").value.trim();
        const batchNumber = $("batchNumber").value.trim();
        const expiryDate = $("expiryDate").value;

        if (
            !medicineName ||
            !totalPieces ||
            !purchasePrice ||
            !sellingPrice ||
            !expiryDate
        ) {
            throw new Error(
                "ওষুধের প্রয়োজনীয় তথ্য পূরণ করুন।"
            );
        }

        if (
            totalPieces <= 0 ||
            purchasePrice <= 0 ||
            sellingPrice <= 0
        ) {
            throw new Error(
                "পরিমাণ ও মূল্য শূন্যের বেশি হতে হবে।"
            );
        }

        if (sellingPrice < purchasePrice) {
            const confirmLoss = confirm(
                "বিক্রয়মূল্য ক্রয়মূল্যের চেয়ে কম। আপনি কি নিশ্চিত?"
            );

            if (!confirmLoss) return;
        }

        if (boxQuantity > 0 && piecesPerBox > 0) {

            const calculatedPieces =
                boxQuantity * piecesPerBox;

            if (calculatedPieces !== totalPieces) {
                throw new Error(
                    "বক্সের হিসাব ও মোট পিসের পরিমাণ মিলছে না।"
                );
            }

        }

        if (expiryDate < today()) {
            throw new Error(
                "ইতিমধ্যে মেয়াদ শেষ হওয়া ওষুধ যোগ করা যাবে না।"
            );
        }

        await addDoc(shopCollection("stock"), {

            medicineName,
            company,

            boxQuantity,
            piecesPerBox,
            totalPieces,

            availablePieces: totalPieces,

            purchasePrice,
            sellingPrice,

            rackNumber,
            batchNumber,
            expiryDate,

            createdAt: serverTimestamp(),

            createdBy: currentUser.uid

        });

        $("stockForm").reset();

        showMessage("ওষুধের স্টক সফলভাবে যোগ হয়েছে।");

        await loadStock();
        await updateDashboard();

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


// স্টক তালিকা দেখানো
function renderStock(searchText = "") {

    const tbody = $("stockTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const search = searchText.toLowerCase();

    const filtered = stockCache.filter(item => {

        return (
            (item.medicineName || "").toLowerCase().includes(search) ||
            (item.company || "").toLowerCase().includes(search) ||
            (item.batchNumber || "").toLowerCase().includes(search)
        );

    });

    filtered.forEach(item => {

        const tr = document.createElement("tr");

        const cells = [

            item.medicineName || "-",
            item.company || "-",
            item.batchNumber || "-",
            item.availablePieces || 0,
            currency(item.purchasePrice),
            currency(item.sellingPrice),
            item.rackNumber || "-",
            dateValue(item.expiryDate)

        ];

        cells.forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);

        });

        const action = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger";

        deleteButton.addEventListener("click", async () => {

            if (
                !confirm(
                    "এই স্টক রেকর্ড মুছে ফেলতে চান? বিক্রয়ের ইতিহাস মুছে যাবে না।"
                )
            ) return;

            try {

                if (Number(item.availablePieces || 0) < Number(item.totalPieces || 0)) {
                    throw new Error(
                        "এই ব্যাচ থেকে বিক্রয় হয়েছে। সরাসরি মুছে ফেলা যাবে না।"
                    );
                }

                await deleteDoc(
                    doc(
                        db,
                        "pharmacies",
                        currentUser.pharmacyId,
                        "stock",
                        item.id
                    )
                );

                showMessage("স্টক রেকর্ড মুছে ফেলা হয়েছে।");

                await loadStock();
                await updateDashboard();

            } catch (error) {

                showMessage(getFriendlyError(error), "error");

            }

        });

        action.appendChild(deleteButton);
        tr.appendChild(action);

        tbody.appendChild(tr);

    });

    if (filtered.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="9">কোনো ওষুধ পাওয়া যায়নি।</td></tr>';

    }

}


// স্টক সার্চ
$("stockListSearch")?.addEventListener("input", event => {

    renderStock(event.target.value);

});


// =====================================================
// PART 2: CUSTOMER MANAGEMENT
// =====================================================

async function loadCustomers() {

    const snapshot = await getDocs(shopCollection("customers"));

    customerCache = [];

    snapshot.forEach(item => {

        customerCache.push({
            id: item.id,
            ...item.data()
        });

    });

    renderCustomers();

    renderCustomerOptions();

}


$("customerForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        const name = $("customerName").value.trim();
        const mobile = $("customerMobile").value.trim();
        const address = $("customerAddress").value.trim();
        const note = $("customerNote").value.trim();

        if (!name) {
            throw new Error("কাস্টমারের নাম লিখুন।");
        }

        await addDoc(shopCollection("customers"), {

            name,
            mobile,
            address,
            note,

            totalDue: 0,

            createdAt: serverTimestamp()

        });

        $("customerForm").reset();

        showMessage("কাস্টমার যোগ হয়েছে।");

        await loadCustomers();

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


function renderCustomers() {

    const tbody = $("customerTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    customerCache.forEach(customer => {

        const tr = document.createElement("tr");

        const values = [
            customer.name || "-",
            customer.mobile || "-",
            customer.address || "-",
            currency(customer.totalDue || 0)
        ];

        values.forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    if (customerCache.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="4">কোনো কাস্টমার নেই।</td></tr>';

    }

}


function renderCustomerOptions() {

    const select = $("saleCustomer");

    if (!select) return;

    select.innerHTML =
        '<option value="">সাধারণ কাস্টমার</option>';

    customerCache.forEach(customer => {

        const option = document.createElement("option");

        option.value = customer.id;
        option.textContent = customer.name;

        select.appendChild(option);

    });

}


// =====================================================
// PART 2: SUPPLIER MANAGEMENT
// =====================================================

async function loadSuppliers() {

    const snapshot = await getDocs(shopCollection("suppliers"));

    supplierCache = [];

    snapshot.forEach(item => {

        supplierCache.push({
            id: item.id,
            ...item.data()
        });

    });

    renderSuppliers();

    renderSupplierOptions();

}


$("supplierForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        const name = $("supplierName").value.trim();
        const mobile = $("supplierMobile").value.trim();
        const address = $("supplierAddress").value.trim();

        const openingDue = Number(
            $("supplierOpeningDue").value || 0
        );

        if (!name) {
            throw new Error("সরবরাহকারীর নাম লিখুন।");
        }

        if (openingDue < 0) {
            throw new Error("বকেয়া ঋণাত্মক হতে পারে না।");
        }

        await addDoc(shopCollection("suppliers"), {

            name,
            mobile,
            address,

            totalDue: openingDue,

            createdAt: serverTimestamp()

        });

        $("supplierForm").reset();

        showMessage("সরবরাহকারী যোগ হয়েছে।");

        await loadSuppliers();

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


function renderSuppliers() {

    const tbody = $("supplierTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    supplierCache.forEach(supplier => {

        const tr = document.createElement("tr");

        const values = [

            supplier.name || "-",
            supplier.mobile || "-",
            supplier.address || "-",
            currency(supplier.totalDue || 0)

        ];

        values.forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    if (supplierCache.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="4">কোনো সরবরাহকারী নেই।</td></tr>';

    }

}


function renderSupplierOptions() {

    const select = $("purchaseSupplier");

    if (!select) return;

    select.innerHTML =
        '<option value="">সরবরাহকারী নির্বাচন করুন</option>';

    supplierCache.forEach(supplier => {

        const option = document.createElement("option");

        option.value = supplier.id;
        option.textContent = supplier.name;

        select.appendChild(option);

    });

}


// =====================================================
// PART 2: EMPLOYEE MANAGEMENT
// =====================================================

async function loadEmployees() {

    if (!currentUser) return;

    if (currentUser.role !== "owner") return;

    const snapshot = await getDocs(shopCollection("employees"));

    employeeCache = [];

    snapshot.forEach(item => {

        employeeCache.push({
            id: item.id,
            ...item.data()
        });

    });

    renderEmployees();

}


function renderEmployees() {

    const tbody = $("employeeTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    employeeCache.forEach(employee => {

        const tr = document.createElement("tr");

        const values = [

            employee.name || "-",
            employee.mobile || "-",
            employee.email || "-",
            employee.role || "-",
            employee.active ? "Active" : "Inactive"

        ];

        values.forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);

        });

        const action = document.createElement("td");

        if (employee.active === true) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = "Deactivate";
            button.className = "btn btn-danger";

            button.addEventListener("click", async () => {

                if (
                    !confirm("এই কর্মচারীকে নিষ্ক্রিয় করতে চান?")
                ) return;

                try {

                    await deactivateEmployee(employee.id);

                    showMessage(
                        "কর্মচারী নিষ্ক্রিয় করা হয়েছে।"
                    );

                    await loadEmployees();
                    await updateDashboard();

                } catch (error) {

                    showMessage(getFriendlyError(error), "error");

                }

            });

            action.appendChild(button);

        } else {

            action.textContent = "Inactive";

        }

        tr.appendChild(action);

        tbody.appendChild(tr);

    });

    if (employeeCache.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="6">কোনো কর্মচারী নেই।</td></tr>';

    }

}


$("employeeForm")?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        try {

            if (currentUser?.role !== "owner") {
                throw new Error(
                    "শুধু ফার্মেসির মালিক কর্মচারী তৈরি করতে পারবেন।"
                );
            }

            const name = $("employeeName").value.trim();
            const mobile = $("employeeMobile").value.trim();
            const email = $("employeeEmail").value.trim();
            const role = $("employeeRole").value;

            if (!name || !mobile || !email || !role) {
                throw new Error(
                    "কর্মচারীর সব তথ্য পূরণ করুন।"
                );
            }

            const result = await createEmployee({

                name,
                mobile,
                email,
                role

            });

            $("employeeForm").reset();

            alert(
                "কর্মচারীর অ্যাকাউন্ট তৈরি হয়েছে।\n\n" +
                "Email: " + result.email +
                "\nTemporary Password: " +
                result.temporaryPassword +
                "\n\nপাসওয়ার্ডটি নিরাপদে কর্মচারীকে দিন।"
            );

            showMessage(
                "কর্মচারীর অ্যাকাউন্ট তৈরি হয়েছে।"
            );

            await loadEmployees();
            await updateDashboard();

        } catch (error) {

            showMessage(getFriendlyError(error), "error");

        }

    }
);


// =====================================================
// PART 2: SALES SEARCH
// =====================================================

$("medicineSearch")?.addEventListener("input", event => {

    const search = event.target.value
        .trim()
        .toLowerCase();

    const resultBox = $("medicineSearchResults");

    if (!resultBox) return;

    resultBox.innerHTML = "";

    if (!search) return;

    const matches = stockCache.filter(item => {

        return (
            (item.medicineName || "").toLowerCase().includes(search) &&
            Number(item.availablePieces || 0) > 0 &&
            dateValue(item.expiryDate) >= today()
        );

    });

    matches.forEach(item => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "search-result-item";

        button.textContent =
            `${item.medicineName} | ${item.availablePieces} পিস | ` +
            `${currency(item.sellingPrice)} | র‍্যাক: ${item.rackNumber || "-"}`;

        button.addEventListener("click", () => {

            addToCart(item);

            resultBox.innerHTML = "";

            $("medicineSearch").value = "";

        });

        resultBox.appendChild(button);

    });

    if (matches.length === 0) {

        resultBox.textContent =
            "কোনো ওষুধ পাওয়া যায়নি।";

    }

});


// =====================================================
// PART 2: SALES CART
// =====================================================

function addToCart(item) {

    const existing = cart.find(
        cartItem => cartItem.stockId === item.id
    );

    if (existing) {

        if (existing.quantity >= item.availablePieces) {

            showMessage(
                "পর্যাপ্ত স্টক নেই।",
                "error"
            );

            return;

        }

        existing.quantity++;

    } else {

        cart.push({

            stockId: item.id,

            medicineName: item.medicineName,

            quantity: 1,

            sellingPrice: Number(item.sellingPrice),

            purchasePrice: Number(item.purchasePrice),

            availablePieces: Number(item.availablePieces),

            expiryDate: dateValue(item.expiryDate),

            rackNumber: item.rackNumber || ""

        });

    }

    renderCart();

}


function renderCart() {

    const tbody = $("cartTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    let grandTotal = 0;

    cart.forEach((item, index) => {

        const lineTotal =
            item.quantity * item.sellingPrice;

        grandTotal += lineTotal;

        const tr = document.createElement("tr");

        const medicineCell = document.createElement("td");
        medicineCell.textContent = item.medicineName;

        const quantityCell = document.createElement("td");

        const quantityInput = document.createElement("input");

        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.max = String(item.availablePieces);
        quantityInput.value = item.quantity;

        quantityInput.addEventListener("change", () => {

            const quantity = Number(quantityInput.value);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > item.availablePieces
            ) {

                showMessage(
                    "সঠিক পরিমাণ লিখুন।",
                    "error"
                );

                quantityInput.value = item.quantity;

                return;

            }

            item.quantity = quantity;

            renderCart();

        });

        quantityCell.appendChild(quantityInput);

        const priceCell = document.createElement("td");
        priceCell.textContent = currency(item.sellingPrice);

        const totalCell = document.createElement("td");
        totalCell.textContent = currency(lineTotal);

        const actionCell = document.createElement("td");

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {

            cart.splice(index, 1);

            renderCart();

        });

        actionCell.appendChild(removeButton);

        tr.append(
            medicineCell,
            quantityCell,
            priceCell,
            totalCell,
            actionCell
        );

        tbody.appendChild(tr);

    });

    if (cart.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="5">বিক্রয়ের তালিকা খালি।</td></tr>';

    }

    if ($("cartTotal")) {
        $("cartTotal").textContent =
            currency(grandTotal);
    }

}


// =====================================================
// PART 2: COMPLETE SALE
// =====================================================

$("completeSaleBtn")?.addEventListener(
    "click",
    async () => {

        if (cart.length === 0) {

            showMessage(
                "বিক্রয়ের তালিকা খালি।",
                "error"
            );

            return;

        }

        try {

            const customerId =
                $("saleCustomer")?.value || "";

            const discount = Number(
                $("saleDiscount")?.value || 0
            );

            const amountPaid = Number(
                $("saleAmountPaid")?.value || 0
            );

            const subtotal = cart.reduce(
                (sum, item) =>
                    sum + item.quantity * item.sellingPrice,
                0
            );

            if (
                discount < 0 ||
                discount > subtotal
            ) {
                throw new Error(
                    "সঠিক ছাড়ের পরিমাণ লিখুন।"
                );
            }

            const grandTotal = subtotal - discount;

            if (
                amountPaid < 0 ||
                amountPaid > grandTotal
            ) {
                throw new Error(
                    "পরিশোধিত টাকার পরিমাণ সঠিক নয়।"
                );
            }

            const saleId = crypto.randomUUID();

            const saleRef = doc(
                db,
                "pharmacies",
                currentUser.pharmacyId,
                "sales",
                saleId
            );

            const customerRef = customerId
                ? doc(
                    db,
                    "pharmacies",
                    currentUser.pharmacyId,
                    "customers",
                    customerId
                )
                : null;

            const invoiceNumber =
                "SP-" + Date.now();

            const saleItems = cart.map(item => ({
                stockId: item.stockId,
                medicineName: item.medicineName,
                quantity: item.quantity,
                sellingPrice: item.sellingPrice,
                purchasePrice: item.purchasePrice,
                rackNumber: item.rackNumber,
                expiryDate: item.expiryDate
            }));

            await runTransaction(db, async transaction => {

                const stockSnapshots = [];

                for (const item of cart) {

                    const stockRef = doc(
                        db,
                        "pharmacies",
                        currentUser.pharmacyId,
                        "stock",
                        item.stockId
                    );

                    const stockSnapshot =
                        await transaction.get(stockRef);

                    if (!stockSnapshot.exists()) {

                        throw new Error(
                            "একটি ওষুধের স্টক পাওয়া যায়নি।"
                        );

                    }

                    const stockData = stockSnapshot.data();

                    if (
                        Number(stockData.availablePieces || 0) <
                        item.quantity
                    ) {

                        throw new Error(
                            item.medicineName +
                            " এর পর্যাপ্ত স্টক নেই।"
                        );

                    }

                    stockSnapshots.push({
                        ref: stockRef,
                        data: stockData,
                        item
                    });

                }

                let customerSnapshot = null;

                if (customerRef) {

                    customerSnapshot =
                        await transaction.get(customerRef);

                    if (!customerSnapshot.exists()) {

                        throw new Error(
                            "কাস্টমার পাওয়া যায়নি।"
                        );

                    }

                }

                stockSnapshots.forEach(entry => {

                    transaction.update(entry.ref, {

                        availablePieces:
                            Number(entry.data.availablePieces) -
                            entry.item.quantity,

                        updatedAt: serverTimestamp()

                    });

                });

                transaction.set(saleRef, {

                    invoiceNumber,

                    customerId,

                    items: saleItems,

                    subtotal,

                    discount,

                    grandTotal,

                    amountPaid,

                    due: grandTotal - amountPaid,

                    estimatedProfit: cart.reduce(
                        (sum, item) =>
                            sum +
                            (
                                item.sellingPrice -
                                item.purchasePrice
                            ) * item.quantity,
                        0
                    ) - discount,

                    saleDate: today(),

                    createdAt: serverTimestamp(),

                    createdBy: currentUser.uid

                });

                if (
                    customerRef &&
                    customerSnapshot
                ) {

                    transaction.update(customerRef, {

                        totalDue: increment(
                            grandTotal - amountPaid
                        )

                    });

                }

            });

            alert(
                "বিক্রয় সম্পন্ন হয়েছে।\n" +
                "Invoice: " + invoiceNumber +
                "\nমোট: " + currency(grandTotal) +
                "\nবকেয়া: " +
                currency(grandTotal - amountPaid)
            );

            cart = [];

            $("saleDiscount").value = "";
            $("saleAmountPaid").value = "";

            renderCart();

            await loadStock();
            await loadCustomers();
            await updateDashboard();

        } catch (error) {

            showMessage(
                getFriendlyError(error),
                "error"
            );

        }

    }
);

// =====================================================
// PART 3: PURCHASE MANAGEMENT
// =====================================================

let purchaseItems = [];

$("addPurchaseItemBtn")?.addEventListener("click", () => {

    const container = $("purchaseItemsContainer");

    if (!container) return;

    const row = document.createElement("div");

    row.className = "purchase-item-row";

    row.innerHTML = `
        <input type="text" class="purchase-medicine"
            placeholder="ওষুধের নাম">

        <input type="text" class="purchase-company"
            placeholder="কোম্পানি">

        <input type="number" class="purchase-quantity"
            placeholder="মোট পিস" min="1">

        <input type="number" class="purchase-cost"
            placeholder="ক্রয়মূল্য/পিস" min="0.01" step="0.01">

        <input type="number" class="purchase-selling"
            placeholder="বিক্রয়মূল্য/পিস" min="0.01" step="0.01">

        <input type="text" class="purchase-batch"
            placeholder="ব্যাচ নম্বর">

        <input type="date" class="purchase-expiry">

        <button type="button" class="remove-purchase-item">
            Remove
        </button>
    `;

    row.querySelector(".remove-purchase-item")
        .addEventListener("click", () => row.remove());

    container.appendChild(row);

});


$("purchaseForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        const supplierId = $("purchaseSupplier").value;
        const invoice = $("purchaseInvoice").value.trim();
        const purchaseDate = $("purchaseDate").value || today();
        const amountPaid = Number($("purchasePaid").value || 0);

        if (!supplierId) {
            throw new Error("সরবরাহকারী নির্বাচন করুন।");
        }

        const rows = document.querySelectorAll(
            ".purchase-item-row"
        );

        if (!rows.length) {
            throw new Error("কমপক্ষে একটি ওষুধ যোগ করুন।");
        }

        const items = [];

        rows.forEach(row => {

            const medicineName =
                row.querySelector(".purchase-medicine").value.trim();

            const company =
                row.querySelector(".purchase-company").value.trim();

            const quantity =
                Number(row.querySelector(".purchase-quantity").value);

            const purchasePrice =
                Number(row.querySelector(".purchase-cost").value);

            const sellingPrice =
                Number(row.querySelector(".purchase-selling").value);

            const batchNumber =
                row.querySelector(".purchase-batch").value.trim();

            const expiryDate =
                row.querySelector(".purchase-expiry").value;

            if (
                !medicineName ||
                !quantity ||
                !purchasePrice ||
                !sellingPrice ||
                !expiryDate
            ) {
                throw new Error(
                    "ক্রয়ের সব ওষুধের প্রয়োজনীয় তথ্য পূরণ করুন।"
                );
            }

            if (
                quantity <= 0 ||
                purchasePrice <= 0 ||
                sellingPrice <= 0
            ) {
                throw new Error("পরিমাণ ও মূল্য সঠিক দিন।");
            }

            if (expiryDate < today()) {
                throw new Error(
                    "মেয়াদ শেষ হওয়া ওষুধ ক্রয় করা যাবে না।"
                );
            }

            items.push({
                medicineName,
                company,
                quantity,
                purchasePrice,
                sellingPrice,
                batchNumber,
                expiryDate
            });

        });

        const total = items.reduce(
            (sum, item) =>
                sum + item.quantity * item.purchasePrice,
            0
        );

        if (amountPaid < 0 || amountPaid > total) {
            throw new Error("পরিশোধিত টাকার পরিমাণ সঠিক নয়।");
        }

        const due = total - amountPaid;

        const supplierRef = doc(
            db,
            "pharmacies",
            currentUser.pharmacyId,
            "suppliers",
            supplierId
        );

        const purchaseRef = doc(
            collection(
                db,
                "pharmacies",
                currentUser.pharmacyId,
                "purchases"
            )
        );

        await runTransaction(db, async transaction => {

            const supplierSnapshot =
                await transaction.get(supplierRef);

            if (!supplierSnapshot.exists()) {
                throw new Error("সরবরাহকারী পাওয়া যায়নি।");
            }

            const stockRefs = items.map(() =>
                doc(
                    collection(
                        db,
                        "pharmacies",
                        currentUser.pharmacyId,
                        "stock"
                    )
                )
            );

            transaction.set(purchaseRef, {
                invoice,
                supplierId,
                items,
                total,
                amountPaid,
                due,
                purchaseDate,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            });

            items.forEach((item, index) => {

                transaction.set(stockRefs[index], {

                    medicineName: item.medicineName,
                    company: item.company,

                    boxQuantity: 0,
                    piecesPerBox: 0,

                    totalPieces: item.quantity,
                    availablePieces: item.quantity,

                    purchasePrice: item.purchasePrice,
                    sellingPrice: item.sellingPrice,

                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,

                    rackNumber: "",

                    createdAt: serverTimestamp(),
                    createdBy: currentUser.uid

                });

            });

            transaction.update(supplierRef, {
                totalDue: increment(due)
            });

        });

        $("purchaseForm").reset();

        if ($("purchaseItemsContainer")) {
            $("purchaseItemsContainer").innerHTML = "";
        }

        showMessage("ক্রয় সফলভাবে সংরক্ষণ হয়েছে।");

        await loadStock();
        await loadSuppliers();
        await updateDashboard();

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


// =====================================================
// PART 3: INCOME AND EXPENSE
// =====================================================

$("incomeExpenseForm")?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        try {

            const type = $("transactionType").value;
            const category = $("transactionCategory").value.trim();
            const amount = Number($("transactionAmount").value);
            const transactionDate =
                $("transactionDate").value || today();

            const description =
                $("transactionDescription").value.trim();

            if (!["income", "expense"].includes(type)) {
                throw new Error("লেনদেনের ধরন নির্বাচন করুন।");
            }

            if (!category || amount <= 0) {
                throw new Error("সঠিক ক্যাটাগরি ও পরিমাণ দিন।");
            }

            await addDoc(shopCollection("transactions"), {

                type,
                category,
                amount,
                transactionDate,
                description,

                createdAt: serverTimestamp(),
                createdBy: currentUser.uid

            });

            $("incomeExpenseForm").reset();

            showMessage("লেনদেন সংরক্ষণ হয়েছে।");

            await loadTransactions();
            await updateDashboard();

        } catch (error) {

            showMessage(getFriendlyError(error), "error");

        }

    }
);


async function loadTransactions() {

    const snapshot = await getDocs(
        shopCollection("transactions")
    );

    const tbody = $("transactionTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    snapshot.forEach(item => {

        const data = item.data();

        const tr = document.createElement("tr");

        [
            data.type === "income" ? "আয়" : "ব্যয়",
            data.category,
            currency(data.amount),
            data.transactionDate,
            data.description || "-"
        ].forEach(value => {

            const td = document.createElement("td");
            td.textContent = value || "-";
            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    if (snapshot.empty) {
        tbody.innerHTML =
            '<tr><td colspan="5">কোনো লেনদেন নেই।</td></tr>';
    }

}


// =====================================================
// PART 3: REPORTS
// =====================================================

$("generateReportBtn")?.addEventListener("click", async () => {

    try {

        const from = $("reportFromDate").value;
        const to = $("reportToDate").value;
        const type = $("reportType").value;

        if (!from || !to || from > to) {
            throw new Error("সঠিক তারিখ নির্বাচন করুন।");
        }

        const [salesSnapshot, purchasesSnapshot, transactionSnapshot] =
            await Promise.all([

                getDocs(shopCollection("sales")),
                getDocs(shopCollection("purchases")),
                getDocs(shopCollection("transactions"))

            ]);

        const sales = [];
        const purchases = [];
        const transactions = [];

        salesSnapshot.forEach(item => {
            const data = item.data();

            if (data.saleDate >= from && data.saleDate <= to) {
                sales.push(data);
            }
        });

        purchasesSnapshot.forEach(item => {
            const data = item.data();

            if (
                data.purchaseDate >= from &&
                data.purchaseDate <= to
            ) {
                purchases.push(data);
            }
        });

        transactionSnapshot.forEach(item => {
            const data = item.data();

            if (
                data.transactionDate >= from &&
                data.transactionDate <= to
            ) {
                transactions.push(data);
            }
        });

        const salesTotal = sales.reduce(
            (sum, item) => sum + Number(item.grandTotal || 0),
            0
        );

        const purchaseTotal = purchases.reduce(
            (sum, item) => sum + Number(item.total || 0),
            0
        );

        const incomeTotal = transactions
            .filter(item => item.type === "income")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const expenseTotal = transactions
            .filter(item => item.type === "expense")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const profitTotal = sales.reduce(
            (sum, item) =>
                sum + Number(item.estimatedProfit || 0),
            0
        );

        const report = $("reportContent");

        if (!report) return;

        report.innerHTML = `
            <h3>SMART PHARMACY REPORT</h3>
            <p>সময়কাল: ${escapeHTML(from)} থেকে ${escapeHTML(to)}</p>

            <table>
                <tr><td>মোট বিক্রয়</td><td>${currency(salesTotal)}</td></tr>
                <tr><td>মোট ক্রয়</td><td>${currency(purchaseTotal)}</td></tr>
                <tr><td>অতিরিক্ত আয়</td><td>${currency(incomeTotal)}</td></tr>
                <tr><td>ব্যয়</td><td>${currency(expenseTotal)}</td></tr>
                <tr><td>আনুমানিক বিক্রয় লাভ</td><td>${currency(profitTotal)}</td></tr>
                <tr><td>বিক্রয় ইনভয়েস</td><td>${sales.length}</td></tr>
                <tr><td>ক্রয় ইনভয়েস</td><td>${purchases.length}</td></tr>
            </table>
        `;

        window.currentReportData = {
            from,
            to,
            salesTotal,
            purchaseTotal,
            incomeTotal,
            expenseTotal,
            profitTotal,
            sales,
            purchases
        };

        showMessage("রিপোর্ট তৈরি হয়েছে।");

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


// =====================================================
// PRINT REPORT
// =====================================================

$("printReportBtn")?.addEventListener("click", () => {

    const content = $("reportContent");

    if (!content || !content.innerHTML.trim()) {
        showMessage("প্রথমে রিপোর্ট তৈরি করুন।", "error");
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        showMessage("পপ-আপ অনুমতি দিন।", "error");
        return;
    }

    printWindow.document.write(`
        <html>
        <head>
            <title>SMART PHARMACY REPORT</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                td { border: 1px solid #ccc; padding: 10px; }
            </style>
        </head>
        <body>
            ${content.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();

});


// =====================================================
// EXPORT CSV
// =====================================================

$("exportReportBtn")?.addEventListener("click", () => {

    const report = window.currentReportData;

    if (!report) {
        showMessage("প্রথমে রিপোর্ট তৈরি করুন।", "error");
        return;
    }

    const rows = [

        ["SMART PHARMACY REPORT"],
        ["From", report.from],
        ["To", report.to],
        ["Total Sales", report.salesTotal],
        ["Total Purchase", report.purchaseTotal],
        ["Additional Income", report.incomeTotal],
        ["Expenses", report.expenseTotal],
        ["Estimated Profit", report.profitTotal]

    ];

    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "smart-pharmacy-report.csv";

    link.click();

    URL.revokeObjectURL(url);

});


// =====================================================
// PART 3: SETTINGS
// =====================================================

$("settingsForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        if (currentUser.role !== "owner") {
            throw new Error("শুধু মালিক সেটিংস পরিবর্তন করতে পারবেন।");
        }

        const shopName = $("settingsShopName").value.trim();
        const mobile = $("settingsMobile").value.trim();
        const address = $("settingsAddress").value.trim();

        const lowStockThreshold = Number(
            $("lowStockThreshold").value
        );

        const expiryAlertDays = Number(
            $("expiryAlertDays").value
        );

        if (!shopName || !mobile) {
            throw new Error("ফার্মেসির নাম ও মোবাইল নম্বর দিন।");
        }

        if (lowStockThreshold < 0 || expiryAlertDays < 0) {
            throw new Error("সতর্কতার মান সঠিক নয়।");
        }

        await updateDoc(
            doc(db, "pharmacies", currentUser.pharmacyId),
            {
                shopName,
                mobile,
                address,
                settings: {
                    lowStockThreshold,
                    expiryAlertDays
                }
            }
        );

        pharmacyData.shopName = shopName;
        pharmacyData.mobile = mobile;
        pharmacyData.address = address;

        $("displayShopName").textContent = shopName;
        $("displayMobile").textContent = mobile;
        $("displayAddress").textContent = address;

        showMessage("সেটিংস সংরক্ষণ হয়েছে।");

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


// =====================================================
// PASSWORD RESET FROM SETTINGS
// =====================================================

$("settingsPasswordResetBtn")?.addEventListener(
    "click",
    async () => {

        try {

            await sendPasswordResetEmail(
                auth,
                currentUser.email
            );

            showMessage(
                "পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।"
            );

        } catch (error) {

            showMessage(getFriendlyError(error), "error");

        }

    }
);


// =====================================================
// PART 3: SUPPORT
// =====================================================

$("supportForm")?.addEventListener("submit", async event => {

    event.preventDefault();

    try {

        const subject = $("supportSubject").value.trim();
        const message = $("supportMessage").value.trim();

        if (!subject || !message) {
            throw new Error("বিষয় ও বিস্তারিত লিখুন।");
        }

        await addDoc(shopCollection("supportRequests"), {

            subject,
            message,

            status: "pending",

            userId: currentUser.uid,
            userEmail: currentUser.email,

            createdAt: serverTimestamp()

        });

        $("supportForm").reset();

        showMessage("সাপোর্ট অনুরোধ পাঠানো হয়েছে।");

        await loadSupportRequests();

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


async function loadSupportRequests() {

    const snapshot = await getDocs(
        shopCollection("supportRequests")
    );

    const tbody = $("supportTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    snapshot.forEach(item => {

        const data = item.data();

        const tr = document.createElement("tr");

        [
            data.subject || "-",
            data.message || "-",
            data.status || "-"
        ].forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    if (snapshot.empty) {
        tbody.innerHTML =
            '<tr><td colspan="3">কোনো সাপোর্ট অনুরোধ নেই।</td></tr>';
    }

}


// =====================================================
// PART 3: DASHBOARD
// =====================================================

async function updateDashboard() {

    if (!currentUser?.pharmacyId) return;

    try {

        const [
            salesSnapshot,
            purchaseSnapshot,
            stockSnapshot,
            employeeSnapshot,
            customerSnapshot
        ] = await Promise.all([

            getDocs(shopCollection("sales")),
            getDocs(shopCollection("purchases")),
            getDocs(shopCollection("stock")),
            getDocs(shopCollection("employees")),
            getDocs(shopCollection("customers"))

        ]);

        const todaySales = [];
        let totalPurchase = 0;
        let todayProfit = 0;
        let invoiceCount = 0;
        let customerDue = 0;
        let lowStockCount = 0;
        let expiryCount = 0;
        let employeeCount = 0;

        salesSnapshot.forEach(item => {

            const sale = item.data();

            invoiceCount++;

            if (sale.saleDate === today()) {

                todaySales.push(sale);

                todayProfit += Number(
                    sale.estimatedProfit || 0
                );

            }

        });

        const todaySalesTotal = todaySales.reduce(
            (sum, item) =>
                sum + Number(item.grandTotal || 0),
            0
        );

        purchaseSnapshot.forEach(item => {

            const purchase = item.data();

            totalPurchase += Number(purchase.total || 0);

        });

        stockSnapshot.forEach(item => {

            const stock = item.data();

            if (
                Number(stock.availablePieces || 0) <=
                Number(pharmacyData?.settings?.lowStockThreshold ?? 10)
            ) {
                lowStockCount++;
            }

            const daysLeft = Math.ceil(
                (
                    new Date(stock.expiryDate).getTime() -
                    new Date(today()).getTime()
                ) / 86400000
            );

            if (
                daysLeft >= 0 &&
                daysLeft <=
                Number(pharmacyData?.settings?.expiryAlertDays ?? 30)
            ) {
                expiryCount++;
            }

        });

        employeeSnapshot.forEach(item => {

            if (item.data().active === true) {
                employeeCount++;
            }

        });

        customerSnapshot.forEach(item => {

            customerDue += Number(
                item.data().totalDue || 0
            );

        });

        const metrics = {

            todaySales: currency(todaySalesTotal),
            totalPurchase: currency(totalPurchase),
            todayProfit: currency(todayProfit),

            lowStockCount,
            expiryCount,
            employeeCount,
            invoiceCount,

            customerDue: currency(customerDue)

        };

        Object.entries(metrics).forEach(([id, value]) => {

            if ($(id)) {
                $(id).textContent = value;
            }

        });

        const alerts = $("dashboardAlerts");

        if (alerts) {

            alerts.innerHTML = "";

            if (lowStockCount > 0) {

                const p = document.createElement("p");
                p.textContent =
                    "⚠️ কম স্টকের ওষুধ: " + lowStockCount;

                alerts.appendChild(p);

            }

            if (expiryCount > 0) {

                const p = document.createElement("p");
                p.textContent =
                    "⚠️ মেয়াদ শেষ হওয়ার কাছাকাছি: " + expiryCount;

                alerts.appendChild(p);

            }

            if (alerts.innerHTML === "") {
                alerts.textContent = "বর্তমানে কোনো সতর্কতা নেই।";
            }

        }

        const recentBody = $("recentSalesBody");

        if (recentBody) {

            recentBody.innerHTML = "";

            todaySales.slice(-5).reverse().forEach(sale => {

                const tr = document.createElement("tr");

                [
                    sale.invoiceNumber || "-",
                    sale.saleDate || "-",
                    currency(sale.grandTotal)
                ].forEach(value => {

                    const td = document.createElement("td");
                    td.textContent = value;
                    tr.appendChild(td);

                });

                recentBody.appendChild(tr);

            });

            if (todaySales.length === 0) {
                recentBody.innerHTML =
                    '<tr><td colspan="3">আজ কোনো বিক্রয় নেই।</td></tr>';
            }

        }

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}


// =====================================================
// PART 3: BACKUP
// =====================================================

$("backupBtn")?.addEventListener("click", async () => {

    try {

        if (currentUser.role !== "owner") {
            throw new Error("শুধু মালিক ব্যাকআপ তৈরি করতে পারবেন।");
        }

        const collections = [
            "stock",
            "sales",
            "purchases",
            "suppliers",
            "customers",
            "employees",
            "transactions",
            "supportRequests"
        ];

        const backup = {
            app: "SMART PHARMACY",
            version: 1,
            pharmacyId: currentUser.pharmacyId,
            createdAt: new Date().toISOString(),
            data: {}
        };

        for (const name of collections) {

            const snapshot = await getDocs(
                shopCollection(name)
            );

            backup.data[name] = snapshot.docs.map(item => ({
                id: item.id,
                ...item.data()
            }));

        }

        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download =
            "smart-pharmacy-backup-" + today() + ".json";

        link.click();

        URL.revokeObjectURL(url);

        showMessage("ব্যাকআপ ডাউনলোড হয়েছে।");

    } catch (error) {

        showMessage(getFriendlyError(error), "error");

    }

});


// =====================================================
// PART 3: RESTORE
// =====================================================

$("restoreBtn")?.addEventListener("click", async () => {

    showMessage(
        "রিস্টোর ফিচারটি নিরাপদ যাচাই ও ডেটা পুনরুদ্ধার ব্যবস্থা যুক্ত করার পর চালু করা হবে।",
        "warning"
    );

});


// =====================================================
// NAVIGATION SUPPORT
// =====================================================

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", async () => {

        const pageId = button.dataset.page;

        try {

            if (pageId === "employeePage") {
                await loadEmployees();
            }

            if (pageId === "incomeExpensePage") {
                await loadTransactions();
            }

            if (pageId === "supportPage") {
                await loadSupportRequests();
            }

        } catch (error) {

            showMessage(getFriendlyError(error), "error");

        }

    });

});


// =====================================================
// APPLICATION INITIALIZATION
// =====================================================

translatePage();

console.log(
    "SMART PHARMACY initialized - ATIK TECHNOLOGIES"
);


// =====================================================
// END OF APP.JS
// =====================================================
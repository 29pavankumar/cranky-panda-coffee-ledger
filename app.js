/**
 * Store POS & Inventory Ledger - Full Application Logic
 * Supports: Offline-first storage, Multi-brand, POS Billing, Stock Ledger, Out Bills, Daily Closing, Themes, Thermal & Canvas PNG Receipts
 */

// ============================================================================
// 1. DEFAULT DATA & INITIALIZATION (CRANKY PANDA COFFEE - CLEAN SLATE)
// ============================================================================

// Strict Zero Data Default: No mock/assumed products or SKUs
const DEFAULT_SAMPLE_PRODUCTS = [];

// Strict Zero Data Default: No mock/assumed bills or sales
const DEFAULT_SAMPLE_BILLS = [];

const DEFAULT_BRANDS = [
  {
    id: "brand-1",
    name: "Cranky Panda",
    slug: "cranky-panda",
    tagline: "flavour infused instant coffee powder",
    phone: "",
    upiVpa: "crankypanda@upi",
    currency: "₹ INR",
    currencySymbol: "₹",
    logoIcon: "assets/logo.jpg",
    adminPin: "1234",
    categories: ["General", "Merchandise"],
    razorpayKeyId: "",
    razorpayEnabled: true
  }
];

const DEFAULT_STAFF = [
  { id: "staff-1", name: "Pavan Kumar M", role: "STAFF" }
];

// System Users (Admin & Floor Staff with mandatory password authentication)
const DEFAULT_USERS = [
  {
    id: "usr-admin-1",
    name: "Pavan Kumar M",
    username: "admin",
    email: "admin@crankypanda.coffee",
    role: "admin",
    roleLabel: "Store Owner / Admin",
    password: "123",
    avatarColor: "#e87a24"
  },
  {
    id: "usr-staff-1",
    name: "Pavan Kumar M",
    username: "pavan",
    email: "pavan@crankypanda.coffee",
    role: "staff",
    roleLabel: "Floor Staff / Cashier",
    password: "123",
    avatarColor: "#10b981"
  },
  {
    id: "usr-staff-2",
    name: "Floor Cashier",
    username: "cashier",
    email: "cashier@crankypanda.coffee",
    role: "staff",
    roleLabel: "Floor Staff / Cashier",
    password: "123",
    avatarColor: "#10b981"
  }
];

// Initial Staff Stock Requests (Sockadoodle floor approval workflow)
const DEFAULT_PENDING_REQUESTS = [
  {
    id: "req-1730600000001",
    productId: "",
    productName: "Belgium Chocolate Instant Coffee (100g)",
    productSku: "CP-BEL-100G",
    productFlavour: "Belgium Chocolate",
    productPhoto: "assets/logo.jpg",
    currentStock: 12,
    requestedStock: 24,
    difference: 12,
    type: "add",
    reason: "Floor restock from car / storage",
    staffNote: "Brought 12 fresh pouches from car storage box for afternoon rush",
    requestedBy: "Floor Cashier",
    requestedAt: "2026-11-03T08:30:00.000Z",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    adminNote: ""
  }
];

// Initial Business Tracker Transactions (Matching Cranky Panda Ledger Sheet)
const DEFAULT_BALANCE_TRANSACTIONS = [
  {
    id: "tx-20261031-01",
    type: "expense",
    category: "Stickers",
    amount: 1180,
    paymentMode: "upi",
    date: "2026-10-31T10:00:00.000Z",
    note: "Stickers",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-31T10:00:00.000Z"
  },
  {
    id: "tx-20261030-01",
    type: "expense",
    category: "Goods bought",
    amount: 9000,
    paymentMode: "upi",
    date: "2026-10-30T10:00:00.000Z",
    note: "Goods bought",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-30T10:00:00.000Z"
  },
  {
    id: "tx-20261029-01",
    type: "sale",
    category: "Goods Sold / Pop-up Sale",
    amount: 10533,
    paymentMode: "upi",
    date: "2026-10-29T10:00:00.000Z",
    note: "Goods sold",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-29T10:00:00.000Z"
  },
  {
    id: "tx-20261026-03",
    type: "expense",
    category: "Logistics / Travel",
    amount: 584,
    paymentMode: "upi",
    date: "2026-10-26T12:00:00.000Z",
    note: "Logistics",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-26T12:00:00.000Z"
  },
  {
    id: "tx-20261026-02",
    type: "expense",
    category: "Stickers",
    amount: 1381,
    paymentMode: "upi",
    date: "2026-10-26T11:00:00.000Z",
    note: "Stickers",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-26T11:00:00.000Z"
  },
  {
    id: "tx-20261026-01",
    type: "expense",
    category: "Goods bought",
    amount: 7620,
    paymentMode: "upi",
    date: "2026-10-26T10:00:00.000Z",
    note: "Goods bought",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-26T10:00:00.000Z"
  },
  {
    id: "tx-20261021-01",
    type: "expense",
    category: "Sample bought",
    amount: 1000,
    paymentMode: "upi",
    date: "2026-10-21T10:00:00.000Z",
    note: "Sample bought (Panduranga)",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-21T10:00:00.000Z"
  },
  {
    id: "tx-20261019-01",
    type: "expense",
    category: "Packaging / Pouches",
    amount: 5390,
    paymentMode: "upi",
    date: "2026-10-19T10:00:00.000Z",
    note: "Zip pouch",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-19T10:00:00.000Z"
  },
  {
    id: "tx-20261011-01",
    type: "expense",
    category: "Sample bought",
    amount: 700,
    paymentMode: "upi",
    date: "2026-10-11T10:00:00.000Z",
    note: "Sample bought (Bhavani cafe)",
    recordedBy: "Pavan Kumar M",
    createdAt: "2026-10-11T10:00:00.000Z"
  }
];

// ============================================================================
// 2. MAIN APP OBJECT
// ============================================================================


const DEFAULT_COFFEE_FLAVOURS = [
  "Belgium Chocolate",
  "Cappuccino",
  "Hazelnut",
  "Irish Cream",
  "Strawberry Cheesecake"
];

const STOCK_ADJUST_REASONS = {
  reduce: [
    "Sold on Shopify / Online store",
    "External portal sale",
    "Damaged / Defect item",
    "Customer return / exchange",
    "Promotional sample / gift"
  ],
  add: [
    "Brought stock from car / storage",
    "New batch from supplier",
    "Returned item restocked",
    "Stock audit count correction"
  ],
  set: [
    "Physical audit recount",
    "Opening balance correction",
    "Periodic stock reset"
  ]
};

// Client-side Canvas Image Resizer & Compressor (Sockadoodle w0-exact)
async function compressImage(file, { maxWidth = 640, maxHeight = 640, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image"));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image into memory"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

class StoreLedgerApp {
  constructor() {
    this.storageKey = "cranky_panda_zero_slate_v10";
    this.currentTab = "balance";
    this.currentTheme = "nordic-light";
    this.isAdminUnlocked = true;
    this.cart = [];
    this.checkoutPaymentMethod = "cash";
    this.selectedInvCategory = "All";
    this.selectedPosCategory = "All";
    this.selectedStockFilter = "all";
    this.addSelectedCategory = "General";
    this.addSelectedFlavour = "Belgium Chocolate";
    this.editSelectedCategory = "General";
    this.editSelectedFlavour = "Belgium Chocolate";
    this.currentAdjustProduct = null;
    this.adjustMode = "reduce";
    this.skuBreakdownFilter = "all";
    this.singleSellProduct = null;
    this.singleSellPaymentMethod = "cash";

    // Portal & User Authentication State
    this.currentPortal = "staff"; // "admin" | "staff"
    this.currentUser = null;
    this.isAdminUnlocked = false;
    this.usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
    this.pendingRequests = JSON.parse(JSON.stringify(DEFAULT_PENDING_REQUESTS));
    this.approvalTabFilter = "pending";
    this.staffReqType = "set";
    this.staffReqProduct = null;

    // Balance Sheet & Non-Sales Ledger State
    this.startingCapital = 25000;
    this.balanceTransactions = [];
    this.balanceTypeFilter = "all";
    this.balanceCategoryFilter = "all";
    this.balanceSearchQuery = "";

    // Load initial state from localStorage or defaults
    this.loadState();
    this.initAudio();
  }

  // Web Audio feedback
  initAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playChime(type = "beep") {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT & LOCAL STORAGE
  // --------------------------------------------------------------------------
  loadState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.brands = parsed.brands || DEFAULT_BRANDS;
        this.activeBrandId = parsed.activeBrandId || "brand-1";
        this.products = parsed.products || DEFAULT_SAMPLE_PRODUCTS;
        this.bills = parsed.bills || DEFAULT_SAMPLE_BILLS;
        this.staffList = parsed.staffList || DEFAULT_STAFF;
        this.activeStaff = parsed.activeStaff || this.staffList[0].name;
        this.currentTheme = parsed.currentTheme || "nordic-light";
        if (!parsed.themeLightDefaultApplied) {
          this.currentTheme = "nordic-light";
          this.themeLightDefaultApplied = true;
        }
        this.drawerState = parsed.drawerState || { float: 0, expenses: 0, counted: 0 };
        this.startingCapital = parsed.startingCapital !== undefined ? Number(parsed.startingCapital) : 25000;
        
        // Load registered users with password settings
        if (Array.isArray(parsed.usersList) && parsed.usersList.length > 0) {
          this.usersList = parsed.usersList;
        } else {
          this.usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
        }
        // Ensure default admin & staff users are present and synced with labels
        DEFAULT_USERS.forEach(defU => {
          const existing = this.usersList.find(u => u.username === defU.username || (u.email && u.email === defU.email));
          if (!existing) {
            this.usersList.push(JSON.parse(JSON.stringify(defU)));
          } else {
            if (!existing.roleLabel) existing.roleLabel = defU.roleLabel;
            if (existing.username === 'pavan' && existing.name === 'Barista Pavan') {
              existing.name = 'Pavan Kumar M';
            }
            if (!existing.avatarColor) existing.avatarColor = defU.avatarColor;
            // Ensure every user has a password (mandatory authentication)
            if (!existing.password || !existing.password.trim()) {
              existing.password = defU.password || "123";
            }
          }
        });

        // Load active user session from dedicated authentication storage
        const authUserId = sessionStorage.getItem("cranky_auth_session_user_id") || 
                           localStorage.getItem("cranky_auth_session_user_id");

        if (authUserId) {
          this.currentUser = this.usersList.find(u => u.id === authUserId) || null;
        } else {
          this.currentUser = null;
        }

        if (this.currentUser) {
          this.currentPortal = this.currentUser.role === "admin" ? "admin" : "staff";
          this.isAdminUnlocked = this.currentPortal === "admin";
          this.activeStaff = this.currentUser.name;
        } else {
          this.currentPortal = "staff";
          this.isAdminUnlocked = false;
        }

        // Load pending staff requests
        if (Array.isArray(parsed.pendingRequests)) {
          this.pendingRequests = parsed.pendingRequests;
        } else {
          this.pendingRequests = JSON.parse(JSON.stringify(DEFAULT_PENDING_REQUESTS));
        }

        if (!Array.isArray(parsed.balanceTransactions) || parsed.balanceTransactions.length === 0) {
          this.balanceTransactions = JSON.parse(JSON.stringify(DEFAULT_BALANCE_TRANSACTIONS));
          this.saveState();
        } else {
          this.balanceTransactions = parsed.balanceTransactions;
          // Ensure default transactions from sheet are merged if not already recorded
          let addedAny = false;
          DEFAULT_BALANCE_TRANSACTIONS.forEach(defTx => {
            const exists = this.balanceTransactions.some(t => 
              t.id === defTx.id || 
              (t.note === defTx.note && Number(t.amount) === Number(defTx.amount))
            );
            if (!exists) {
              this.balanceTransactions.push(defTx);
              addedAny = true;
            }
          });
          if (addedAny) this.saveState();
        }
      } else {
        this.brands = DEFAULT_BRANDS;
        this.activeBrandId = "brand-1";
        this.products = DEFAULT_SAMPLE_PRODUCTS;
        this.bills = DEFAULT_SAMPLE_BILLS;
        this.staffList = DEFAULT_STAFF;
        this.activeStaff = this.staffList[0].name;
        this.currentTheme = "nordic-light";
        this.drawerState = { float: 0, expenses: 0, counted: 0 };
        this.startingCapital = 25000;
        this.usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
        this.currentUser = null;
        this.currentPortal = "staff";
        this.isAdminUnlocked = false;
        this.pendingRequests = JSON.parse(JSON.stringify(DEFAULT_PENDING_REQUESTS));
        this.balanceTransactions = JSON.parse(JSON.stringify(DEFAULT_BALANCE_TRANSACTIONS));
        this.saveState();
      }
    } catch (e) {
      console.error("Error loading state:", e);
      this.products = DEFAULT_SAMPLE_PRODUCTS;
      this.bills = DEFAULT_SAMPLE_BILLS;
      this.brands = DEFAULT_BRANDS;
      this.activeBrandId = "brand-1";
      this.staffList = DEFAULT_STAFF;
      this.activeStaff = this.staffList[0].name;
      this.startingCapital = 25000;
      this.usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
      this.currentUser = null;
      this.currentPortal = "staff";
      this.isAdminUnlocked = false;
      this.pendingRequests = JSON.parse(JSON.stringify(DEFAULT_PENDING_REQUESTS));
      this.balanceTransactions = JSON.parse(JSON.stringify(DEFAULT_BALANCE_TRANSACTIONS));
    }
  }

  saveState() {
    try {
      const payload = {
        brands: this.brands,
        activeBrandId: this.activeBrandId,
        products: this.products,
        bills: this.bills,
        staffList: this.staffList,
        activeStaff: this.activeStaff,
        currentTheme: this.currentTheme,
        themeLightDefaultApplied: true,
        drawerState: this.drawerState,
        startingCapital: this.startingCapital,
        balanceTransactions: this.balanceTransactions,
        usersList: this.usersList,
        pendingRequests: this.pendingRequests
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
      localStorage.setItem("cranky_current_portal", this.currentPortal);
      if (this.currentUser) {
        localStorage.setItem("cranky_current_user_id", this.currentUser.id);
      } else {
        localStorage.removeItem("cranky_current_user_id");
      }
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }

  getActiveBrand() {
    return this.brands.find(b => b.id === this.activeBrandId) || this.brands[0];
  }

  // --------------------------------------------------------------------------
  // INITIAL RENDER & DOM BINDINGS
  // --------------------------------------------------------------------------
  init() {
    // Apply saved theme
    this.setTheme(this.currentTheme, false);

    // Render Brand Identity
    this.updateBrandHeader();

    // Setup global listeners (click outside dropdowns)
    this.setupDropdownListeners();

    // Setup Auth Gate listeners
    this.setupAuthGateListeners();

    // Check if an authenticated user session exists
    if (!this.currentUser) {
      this.showAuthGate();
    } else {
      this.hideAuthGate();
      // Wire up Supabase Cloud Sync & Realtime
      this.initSupabaseSync();

      // Update Portal UI Mode (Admin vs Staff)
      this.updatePortalUI();

      // Render Navigation
      this.switchTab(this.currentTab || (this.currentPortal === "admin" ? "balance" : "pos"));

      // Render Views
      this.renderBalanceSheet();
      this.renderPosCatalog();
      this.renderInventoryTable();
      this.renderLedgerList();
      this.renderClosingSummary();
    }

    console.log("Store POS & Inventory Ledger initialized.");
  }

  toggleProfileDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const profileDropdown = document.getElementById("profile-dropdown");
    const chevron = document.getElementById("profile-chevron");
    if (!profileDropdown) return;

    // Close any other open dropdowns first
    document.getElementById("brand-dropdown")?.classList.add("hidden");
    document.getElementById("theme-dropdown")?.classList.add("hidden");

    const willOpen = profileDropdown.classList.contains("hidden");
    if (willOpen) {
      profileDropdown.classList.remove("hidden");
      if (chevron) chevron.classList.add("rotate-180");
    } else {
      profileDropdown.classList.add("hidden");
      if (chevron) chevron.classList.remove("rotate-180");
    }
  }

  setupDropdownListeners() {
    // Brand dropdown toggle
    const brandBtn = document.getElementById("brand-menu-btn");
    const brandDropdown = document.getElementById("brand-dropdown");
    if (brandBtn && brandDropdown) {
      brandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        brandDropdown.classList.toggle("hidden");
        this.renderBrandDropdownList();
      });
    }

    // Theme dropdown toggle (if present)
    const themeBtn = document.getElementById("theme-menu-btn");
    const themeDropdown = document.getElementById("theme-dropdown");
    if (themeBtn && themeDropdown) {
      themeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle("hidden");
      });
    }

    // Stop propagation on clicks inside the profile dropdown so interactions don't close it prematurely
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) {
      profileDropdown.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Close on click outside
    document.addEventListener("click", (e) => {
      const profileBtn = document.getElementById("profile-menu-btn");
      const chevron = document.getElementById("profile-chevron");
      if (profileDropdown && profileBtn && !profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.add("hidden");
        if (chevron) chevron.classList.remove("rotate-180");
      }
      if (brandDropdown && brandBtn && !brandDropdown.contains(e.target) && !brandBtn.contains(e.target)) {
        brandDropdown.classList.add("hidden");
      }
      if (themeDropdown && themeBtn && !themeDropdown.contains(e.target) && !themeBtn.contains(e.target)) {
        themeDropdown.classList.add("hidden");
      }
    });
  }

  // --------------------------------------------------------------------------
  // THEME MANAGEMENT
  // --------------------------------------------------------------------------
  setTheme(themeId, save = true) {
    this.currentTheme = themeId;
    document.documentElement.setAttribute("data-theme", themeId);
    
    // Update theme label and dot
    const labelMap = {
      "nordic-light": { name: "Nordic Clean Studio (Default)", color: "bg-indigo-600" },
      "cranky-dark": { name: "Cranky Espresso Amber (Dark)", color: "bg-[#e87a24]" },
      "cranky-burgundy": { name: "Cranky Burgundy", color: "bg-rose-600" },
      "obsidian-violet": { name: "Obsidian", color: "bg-purple-500" },
      "sapphire": { name: "Sapphire", color: "bg-blue-500" },
      "terracotta": { name: "Terracotta", color: "bg-orange-500" },
      "sage": { name: "Sage Gold", color: "bg-[#e87a24]" }
    };

    const cfg = labelMap[themeId] || labelMap["nordic-light"];
    const labelEl = document.getElementById("current-theme-label");
    const dotEl = document.getElementById("theme-indicator-dot");
    if (labelEl) labelEl.textContent = cfg.name;
    if (dotEl) {
      dotEl.className = `w-3 h-3 rounded-full ${cfg.color} shadow-sm`;
    }

    const dropThemeText = document.getElementById("dropdown-theme-mode-text");
    if (dropThemeText) {
      dropThemeText.textContent = themeId === "nordic-light" ? "LIGHT MODE" : "DARK MODE";
    }

    // Hide theme dropdown
    const dropdown = document.getElementById("theme-dropdown");
    if (dropdown) dropdown.classList.add("hidden");

    if (save) {
      this.saveState();
      this.playChime("beep");
    }
  }

  // --------------------------------------------------------------------------
  // TAB NAVIGATION
  // --------------------------------------------------------------------------
  switchTab(tabId) {
    if (!this.currentUser) {
      this.showAuthGate();
      return;
    }

    // Guard: Staff portal cannot view admin-restricted tabs
    if (this.currentPortal === "staff" && tabId === "balance") {
      this.showToast("🔒 Restricted: This tab requires Admin Portal access.");
      tabId = "pos";
    }

    this.currentTab = tabId;

    // View sections
    const views = ["balance", "pos", "inventory", "ledger", "closing"];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === tabId) {
          el.classList.remove("hidden");
          el.classList.add("animate-fade-in");
        } else {
          el.classList.add("hidden");
        }
      }

      // Desktop Nav button active states
      const navBtn = document.getElementById(`nav-tab-${v}`);
      if (navBtn) {
        if (v === tabId) {
          navBtn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-bold theme-btn-primary";
        } else {
          navBtn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-theme-muted hover:text-theme-primary";
        }
      }

      // Mobile Bottom Nav active states
      const mobBtn = document.getElementById(`mob-tab-${v}`);
      if (mobBtn) {
        if (v === tabId) {
          mobBtn.className = "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-theme-accent font-bold scale-105";
        } else {
          mobBtn.className = "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-theme-muted hover:text-theme-primary";
        }
      }
    });

    // Refresh specific view when selected
    if (tabId === "balance") this.renderBalanceSheet();
    if (tabId === "pos") this.renderPosCatalog();
    if (tabId === "inventory") this.renderInventoryTable();
    if (tabId === "ledger") this.renderLedgerList();
    if (tabId === "closing") this.renderClosingSummary();
  }

  // --------------------------------------------------------------------------
  // ESCAPE HTML HELPER
  // --------------------------------------------------------------------------
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================================
  // BALANCE SHEET & BUSINESS CASH TRACKER (AUTO-LINKED TO SALES & EXPENSES)
  // ==========================================================================
  renderBalanceSheet() {
    // 1. Sync starting capital input value
    const startCapInput = document.getElementById("balance-starting-capital-input");
    if (startCapInput && document.activeElement !== startCapInput) {
      startCapInput.value = this.startingCapital;
    }

    // 2. Compute non-sales totals from balanceTransactions
    let totalOwnerAdded = 0;
    let otherMoneyReceived = 0;
    let totalExpensesPaid = 0;

    (this.balanceTransactions || []).forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "owner_capital") {
        totalOwnerAdded += amt;
      } else if (tx.type === "other_income") {
        otherMoneyReceived += amt;
      } else if (tx.type === "expense") {
        totalExpensesPaid += amt;
      }
    });

    // 3. Compute live sales revenue dynamically from this.bills AND direct ledger sales
    let totalSales = 0;
    let cashSales = 0;
    let digitalSales = 0;
    let salesCount = 0;

    (this.bills || []).forEach(b => {
      if (b.isVoid) return;
      const rev = Number(b.totalRevenue) || 0;
      totalSales += rev;
      salesCount++;
      if (b.paymentMethod === "cash") {
        cashSales += rev;
      } else {
        digitalSales += rev;
      }
    });

    (this.balanceTransactions || []).forEach(tx => {
      if (tx.type === "sale" || tx.type === "sale_received") {
        const amt = Number(tx.amount) || 0;
        totalSales += amt;
        salesCount++;
        if (tx.paymentMode === "cash") {
          cashSales += amt;
        } else {
          digitalSales += amt;
        }
      }
    });

    // 4. Calculate total money currently available (Exact formula from user's sheet)
    const startingCap = Number(this.startingCapital) || 0;
    const totalMoneyAvailable = startingCap + totalOwnerAdded + totalSales + otherMoneyReceived - totalExpensesPaid;
    const totalInvested = startingCap + totalOwnerAdded;

    // Helper formatters
    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtCompact = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    // 5. Update Top Executive KPI Cards
    const kpiAvail = document.getElementById("bal-kpi-available");
    if (kpiAvail) kpiAvail.textContent = fmt(totalMoneyAvailable);

    const kpiAvailSub = document.getElementById("bal-kpi-available-sub");
    if (kpiAvailSub) {
      kpiAvailSub.textContent = `₹${fmtCompact(startingCap)} start + ₹${fmtCompact(totalSales)} sales - ₹${fmtCompact(totalExpensesPaid)} exp`;
    }

    const kpiInv = document.getElementById("bal-kpi-invested");
    if (kpiInv) kpiInv.textContent = fmt(totalInvested);

    const kpiInvSub = document.getElementById("bal-kpi-invested-sub");
    if (kpiInvSub) {
      kpiInvSub.textContent = `₹${fmtCompact(startingCap)} start + ₹${fmtCompact(totalOwnerAdded)} added`;
    }

    const kpiSales = document.getElementById("bal-kpi-sales");
    if (kpiSales) kpiSales.textContent = fmt(totalSales);

    const kpiSalesSub = document.getElementById("bal-kpi-sales-sub");
    if (kpiSalesSub) {
      kpiSalesSub.textContent = `${salesCount} bills • Cash: ${fmtCompact(cashSales)} | UPI: ${fmtCompact(digitalSales)}`;
    }

    const kpiExp = document.getElementById("bal-kpi-expenses");
    if (kpiExp) kpiExp.textContent = fmt(totalExpensesPaid);

    const kpiExpSub = document.getElementById("bal-kpi-expenses-sub");
    if (kpiExpSub) {
      const expCount = (this.balanceTransactions || []).filter(t => t.type === "expense").length;
      kpiExpSub.textContent = `${expCount} expense transactions logged`;
    }

    // 6. Update Money Summary Table Rows (Faithful to Reference Sheet)
    const sumStart = document.getElementById("summary-starting-capital");
    if (sumStart) sumStart.textContent = fmt(startingCap);

    const sumOwner = document.getElementById("summary-owner-capital");
    if (sumOwner) sumOwner.textContent = fmt(totalOwnerAdded);

    const sumSales = document.getElementById("summary-total-sales");
    if (sumSales) sumSales.textContent = fmt(totalSales);

    const sumCash = document.getElementById("summary-sales-cash");
    if (sumCash) sumCash.textContent = `Cash: ${fmt(cashSales)}`;

    const sumDigital = document.getElementById("summary-sales-digital");
    if (sumDigital) sumDigital.textContent = `UPI / Razorpay: ${fmt(digitalSales)}`;

    const sumCount = document.getElementById("summary-sales-count");
    if (sumCount) sumCount.textContent = `${salesCount} bills booked`;

    const sumOther = document.getElementById("summary-other-income");
    if (sumOther) sumOther.textContent = fmt(otherMoneyReceived);

    const sumExp = document.getElementById("summary-total-expenses");
    if (sumExp) sumExp.textContent = `- ${fmt(totalExpensesPaid)}`;

    const sumTotal = document.getElementById("summary-total-available");
    if (sumTotal) sumTotal.textContent = fmt(totalMoneyAvailable);

    // 7. Render Non-Sales Transactions Table
    this.renderBalanceTransactionsTable();
  }

  renderBalanceTransactionsTable() {
    const tbody = document.getElementById("balance-tx-tbody");
    const emptyState = document.getElementById("balance-empty-state");
    const tableWrapper = document.getElementById("balance-tx-table-wrapper");
    const countBadge = document.getElementById("balance-tx-count-badge");
    if (!tbody) return;

    let list = [...(this.balanceTransactions || [])];

    // Filter by type
    if (this.balanceTypeFilter && this.balanceTypeFilter !== "all") {
      list = list.filter(t => t.type === this.balanceTypeFilter);
    }

    // Filter by category
    if (this.balanceCategoryFilter && this.balanceCategoryFilter !== "all") {
      list = list.filter(t => t.category === this.balanceCategoryFilter);
    }

    // Filter by search query
    if (this.balanceSearchQuery && this.balanceSearchQuery.trim() !== "") {
      const q = this.balanceSearchQuery.toLowerCase();
      list = list.filter(t =>
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.paymentMode && t.paymentMode.toLowerCase().includes(q)) ||
        (t.recordedBy && t.recordedBy.toLowerCase().includes(q))
      );
    }

    if (countBadge) {
      countBadge.textContent = `${list.length} of ${this.balanceTransactions.length} entries`;
    }

    if (list.length === 0) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      if (tableWrapper) tableWrapper.classList.add("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableWrapper) tableWrapper.classList.remove("hidden");

    tbody.innerHTML = list.map(tx => {
      // Date formatting
      const dateObj = new Date(tx.date || tx.createdAt);
      const dateFormatted = !isNaN(dateObj)
        ? dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) +
          " • " +
          dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
        : (tx.date || "—");

      // Type badge & color styling
      let typeBadge = "";
      let amountFormatted = "";
      if (tx.type === "expense") {
        typeBadge = `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">💸 Expense</span>`;
        amountFormatted = `<span class="font-mono font-bold text-rose-400">- ₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>`;
      } else if (tx.type === "sale" || tx.type === "sale_received") {
        typeBadge = `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#e87a24]/15 text-[#fed7aa] border border-[#e87a24]/30">⚡ Sale received</span>`;
        amountFormatted = `<span class="font-mono font-bold text-[#e87a24]">+ ₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>`;
      } else if (tx.type === "owner_capital") {
        typeBadge = `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">💼 Owner Capital</span>`;
        amountFormatted = `<span class="font-mono font-bold text-emerald-400">+ ₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>`;
      } else {
        typeBadge = `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">📥 Other In</span>`;
        amountFormatted = `<span class="font-mono font-bold text-blue-400">+ ₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>`;
      }

      // Payment mode badge
      const modeLabel = tx.paymentMode === "upi" ? "UPI / QR" : tx.paymentMode === "card" ? "Card" : "Cash";
      const modeClass = tx.paymentMode === "cash" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-sky-500/10 text-sky-300 border-sky-500/20";

      return `
        <tr class="hover:bg-white/[0.02] transition-colors">
          <td class="px-4 py-3 text-theme-muted font-mono whitespace-nowrap">${dateFormatted}</td>
          <td class="px-4 py-3 whitespace-nowrap">${typeBadge}</td>
          <td class="px-4 py-3 font-semibold text-theme-primary whitespace-nowrap">${this.escapeHtml(tx.category || "General")}</td>
          <td class="px-4 py-3 text-theme-secondary max-w-xs truncate" title="${this.escapeHtml(tx.note || "")}">
            ${this.escapeHtml(tx.note || "—")}
            <span class="block text-[10px] text-theme-muted mt-0.5">by ${this.escapeHtml(tx.recordedBy || "Staff")}</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${modeClass}">${modeLabel}</span>
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">${amountFormatted}</td>
          <td class="px-4 py-3 text-center whitespace-nowrap">
            <button onclick="app.deleteTransaction('${tx.id}')" class="p-1 rounded-lg text-theme-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete transaction">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  handleSaveStartingCapital() {
    const input = document.getElementById("balance-starting-capital-input");
    if (!input) return;
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0) {
      this.showToast("Please enter a valid starting capital amount (₹0 or more)", "error");
      return;
    }
    this.startingCapital = val;
    this.saveState();
    this.renderBalanceSheet();
    this.playChime("success");
    this.showToast(`Starting capital updated to ₹${val.toLocaleString("en-IN")}!`);
  }

  handleBalanceFilterChange() {
    const sInput = document.getElementById("balance-search-input");
    const tSelect = document.getElementById("balance-type-filter");
    const cSelect = document.getElementById("balance-category-filter");

    if (sInput) this.balanceSearchQuery = sInput.value;
    if (tSelect) this.balanceTypeFilter = tSelect.value;
    if (cSelect) this.balanceCategoryFilter = cSelect.value;

    this.renderBalanceTransactionsTable();
  }

  openAddTransactionModal(defaultType = "expense") {
    const modal = document.getElementById("modal-add-balance-tx");
    if (!modal) return;

    // Reset inputs
    const amtInput = document.getElementById("tx-amount-input");
    const noteInput = document.getElementById("tx-note-input");
    const dateInput = document.getElementById("tx-date-input");

    if (amtInput) amtInput.value = "";
    if (noteInput) noteInput.value = "";
    if (dateInput) {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      dateInput.value = localIso;
    }

    this.setTxType(defaultType);
    modal.classList.remove("hidden");
  }

  closeAddTransactionModal() {
    const modal = document.getElementById("modal-add-balance-tx");
    if (modal) modal.classList.add("hidden");
  }

  setTxType(type) {
    const typeVal = document.getElementById("tx-type-value");
    if (typeVal) typeVal.value = type;

    const btnExp = document.getElementById("btn-tx-type-expense");
    const btnSale = document.getElementById("btn-tx-type-sale");
    const btnOwn = document.getElementById("btn-tx-type-owner");
    const btnOth = document.getElementById("btn-tx-type-other");

    const inactiveClass = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-theme-surface border-theme-subtle text-theme-muted hover:text-theme-primary";
    if (btnExp) btnExp.className = inactiveClass;
    if (btnSale) btnSale.className = inactiveClass;
    if (btnOwn) btnOwn.className = inactiveClass;
    if (btnOth) btnOth.className = inactiveClass;

    if (type === "expense" && btnExp) {
      btnExp.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-rose-500/15 border-rose-500/40 text-rose-300";
    } else if ((type === "sale" || type === "sale_received") && btnSale) {
      btnSale.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-[#e87a24]/20 border-[#e87a24]/40 text-[#fed7aa]";
    } else if (type === "owner_capital" && btnOwn) {
      btnOwn.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
    } else if (type === "other_income" && btnOth) {
      btnOth.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-blue-500/15 border-blue-500/40 text-blue-300";
    }

    const catSelect = document.getElementById("tx-category-select");
    if (catSelect) {
      let categories = [];
      if (type === "expense") {
        categories = [
          "Raw Materials / Coffee Beans",
          "Packaging / Pouches",
          "Stickers",
          "Logistics / Travel",
          "Goods bought",
          "Sample bought",
          "Stall Rent / Fee",
          "Marketing / Printing",
          "Equipment / Tools",
          "Staff Welfare / Food",
          "Ice & Utilities",
          "Miscellaneous / Other"
        ];
      } else if (type === "sale" || type === "sale_received") {
        categories = [
          "Goods Sold / Pop-up Sale",
          "Coffee Beans / Whole Bag",
          "Wholesale / External Portal",
          "Sample Sale",
          "Miscellaneous Sale"
        ];
      } else if (type === "owner_capital") {
        categories = [
          "Owner Capital / Investment",
          "Additional Working Capital",
          "Partner Contribution"
        ];
      } else {
        categories = [
          "Deposit Refund",
          "Vendor Rebate / Supplier Return",
          "Other Non-Sales Receipt"
        ];
      }
      catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
    }
  }

  handleSaveTransaction(event) {
    if (event) event.preventDefault();

    const type = document.getElementById("tx-type-value")?.value || "expense";
    const amtStr = document.getElementById("tx-amount-input")?.value;
    const category = document.getElementById("tx-category-select")?.value || "General";
    const paymentMode = document.getElementById("tx-mode-select")?.value || "cash";
    const date = document.getElementById("tx-date-input")?.value || new Date().toISOString();
    const note = (document.getElementById("tx-note-input")?.value || "").trim();

    const amount = parseFloat(amtStr);
    if (isNaN(amount) || amount <= 0) {
      this.showToast("Please enter a valid amount greater than ₹0", "error");
      return;
    }

    if (!note) {
      this.showToast("Please enter a short description / note", "error");
      return;
    }

    const newTx = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      type,
      category,
      amount,
      paymentMode,
      date,
      note,
      recordedBy: this.activeStaff || "Staff",
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(this.balanceTransactions)) {
      this.balanceTransactions = [];
    }

    this.balanceTransactions.unshift(newTx);
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveBusinessTransaction(newTx, this.activeBrandId);
    }
    this.saveState();
    this.renderBalanceSheet();
    this.closeAddTransactionModal();
    this.playChime("success");

    const typeWord = type === "expense" ? "Expense" : type === "sale" || type === "sale_received" ? "Sale" : type === "owner_capital" ? "Owner Capital" : "Receipt";
    this.showToast(`Recorded ${typeWord} of ₹${amount.toLocaleString("en-IN")} successfully!`);
  }

  deleteTransaction(id) {
    const tx = (this.balanceTransactions || []).find(t => t.id === id);
    if (!tx) return;

    if (!confirm(`Are you sure you want to delete this ${tx.type === "expense" ? "expense" : "transaction"} of ₹${Number(tx.amount).toLocaleString("en-IN")} (${tx.note})?`)) {
      return;
    }

    this.balanceTransactions = this.balanceTransactions.filter(t => t.id !== id);
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.deleteBusinessTransaction(id);
    }
    this.saveState();
    this.renderBalanceSheet();
    this.playChime("beep");
    this.showToast("Transaction deleted successfully", "error");
  }

  // --------------------------------------------------------------------------
  // BRAND MANAGEMENT
  // --------------------------------------------------------------------------
  updateBrandHeader() {
    const brand = this.getActiveBrand();
    document.getElementById("header-brand-name").textContent = brand.name;
    document.getElementById("header-brand-tagline").textContent = brand.tagline || "Artisan Coffee Roasters • Espresso Bar & Cafe Ledger";
    
    // Update Logo image or fallback
    const logoContainer = document.getElementById("brand-logo-container");
    const logoIconEl = document.getElementById("brand-logo-icon");
    if (logoContainer) {
      if (brand.logoIcon && (brand.logoIcon.includes("/") || brand.logoIcon.includes("."))) {
        logoContainer.innerHTML = `<img src="${brand.logoIcon}" alt="${brand.name}" class="w-full h-full object-cover" id="brand-logo-img" />`;
      } else {
        logoContainer.innerHTML = `<span class="text-lg font-black">${brand.logoIcon || '☕'}</span>`;
      }
    } else if (logoIconEl) {
      if (brand.logoIcon && (brand.logoIcon.includes("/") || brand.logoIcon.includes("."))) {
        logoIconEl.innerHTML = `<img src="${brand.logoIcon}" alt="${brand.name}" class="w-full h-full object-cover" id="brand-logo-img" />`;
      } else {
        logoIconEl.textContent = brand.logoIcon || "☕";
      }
    }

    document.getElementById("currency-badge").textContent = brand.currency || "₹ INR";
    document.getElementById("terminal-store-name").textContent = brand.name;
    document.getElementById("terminal-vpa-label").textContent = brand.upiVpa || "crankypanda@upi";
    
    // Active staff label
    document.getElementById("active-staff-name").textContent = this.activeStaff;
    document.getElementById("dropdown-user-name").textContent = this.activeStaff;
    document.getElementById("active-staff-initial").textContent = (this.activeStaff || "S")[0].toUpperCase();
    document.getElementById("cart-cashier-label").textContent = this.activeStaff;
  }

  renderBrandDropdownList() {
    const list = document.getElementById("brands-list");
    const countBadge = document.getElementById("brand-count-badge");
    countBadge.textContent = `${this.brands.length} Stores`;

    list.innerHTML = this.brands.map(b => {
      const isActive = b.id === this.activeBrandId;
      return `
        <button type="button" onclick="app.selectBrand('${b.id}')" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${isActive ? 'theme-btn-primary' : 'hover:bg-white/5 text-theme-primary'}">
          <div class="truncate">
            <div class="flex items-center gap-2">
              ${b.logoIcon && (b.logoIcon.includes('/') || b.logoIcon.includes('.')) ?
                `<img src="${b.logoIcon}" alt="${b.name}" class="w-5 h-5 rounded-md object-cover inline-block" />` :
                `<span>${b.logoIcon || '☕'}</span>`
              }
              <span>${b.name}</span>
            </div>
            <div class="text-[10px] font-mono font-normal opacity-70">@${b.slug}</div>
          </div>
          ${isActive ? '<span class="text-xs">✓</span>' : ''}
        </button>
      `;
    }).join('');
  }

  selectBrand(brandId) {
    this.activeBrandId = brandId;
    this.saveState();
    this.updateBrandHeader();
    document.getElementById("brand-dropdown").classList.add("hidden");
    this.renderPosCatalog();
    this.renderInventoryTable();
    this.playChime("beep");
  }

  openOnboardBrandModal() {
    document.getElementById("brand-dropdown").classList.add("hidden");
    document.getElementById("modal-onboard-brand").classList.remove("hidden");
  }

  closeOnboardBrandModal() {
    document.getElementById("modal-onboard-brand").classList.add("hidden");
  }

  handleOnboardBrand(e) {
    e.preventDefault();
    const name = document.getElementById("onboard-brand-name").value.trim();
    const tagline = document.getElementById("onboard-brand-tagline").value.trim();
    const upi = document.getElementById("onboard-brand-upi").value.trim();
    const icon = document.getElementById("onboard-brand-icon").value.trim() || "🛍️";

    if (!name) return;

    const newBrand = {
      id: "brand-" + Date.now(),
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      tagline: tagline || "Retail Point of Sale",
      phone: "+91 90000 00000",
      upiVpa: upi || "store@upi",
      currency: "₹ INR",
      currencySymbol: "₹",
      logoIcon: icon,
      adminPin: "1234",
      categories: ["General Merchandise", "Apparel", "Accessories"]
    };

    this.brands.push(newBrand);
    this.activeBrandId = newBrand.id;
    this.saveState();
    this.updateBrandHeader();
    this.closeOnboardBrandModal();
    this.playChime("success");
    alert(`Brand store "${name}" created and activated!`);
  }

  // --------------------------------------------------------------------------
  // PORTAL & AUTHENTICATION SYSTEM (ADMIN VS STAFF PORTALS)
  // --------------------------------------------------------------------------
  updatePortalUI() {
    if (!this.currentUser) return;
    const isAdmin = this.currentUser.role === "admin";
    this.currentPortal = isAdmin ? "admin" : "staff";
    this.isAdminUnlocked = isAdmin;

    // Active user info
    const u = this.currentUser;
    this.activeStaff = u.name;

    // Header profile pill button (Sockadoodle style)
    const staffNameEl = document.getElementById("active-staff-name");
    const staffInitialEl = document.getElementById("active-staff-initial");
    const roleDotEl = document.getElementById("header-user-role-dot");
    const roleTextEl = document.getElementById("header-user-role-text");

    if (staffNameEl) staffNameEl.textContent = u.name;
    if (staffInitialEl) {
      staffInitialEl.textContent = (u.name || "P")[0].toUpperCase();
      staffInitialEl.className = isAdmin 
        ? "w-7 h-7 rounded-lg bg-[#e87a24] text-[#0c0a09] flex items-center justify-center text-xs font-black shrink-0 transition-colors"
        : "w-7 h-7 rounded-lg bg-emerald-500 text-[#0c0a09] flex items-center justify-center text-xs font-black shrink-0 transition-colors";
    }
    if (roleDotEl) {
      roleDotEl.className = isAdmin ? "w-1.5 h-1.5 rounded-full bg-[#e87a24]" : "w-1.5 h-1.5 rounded-full bg-emerald-400";
    }
    if (roleTextEl) {
      roleTextEl.textContent = isAdmin ? "ADMIN" : "STAFF";
      roleTextEl.className = isAdmin 
        ? "text-[9px] uppercase tracking-wider font-extrabold text-[#e87a24]"
        : "text-[9px] uppercase tracking-wider font-extrabold text-emerald-400";
    }

    // Profile Dropdown Cards (Exact match to Sockadoodle Image 2)
    const dropAvatarBox = document.getElementById("dropdown-avatar-box");
    const dropAvatarInit = document.getElementById("dropdown-avatar-initial");
    const dropdownUserName = document.getElementById("dropdown-user-name");
    const dropUserHandleRole = document.getElementById("dropdown-user-handle-role");
    const dropStoreBrand = document.getElementById("dropdown-store-brand");
    const dropSellerName = document.getElementById("dropdown-seller-name");
    const dropThemeText = document.getElementById("dropdown-theme-mode-text");

    if (dropAvatarBox) {
      dropAvatarBox.className = isAdmin 
        ? "w-12 h-12 rounded-xl bg-[#e87a24] text-[#0c0a09] flex items-center justify-center font-black text-xl shrink-0 transition-colors"
        : "w-12 h-12 rounded-xl bg-emerald-500 text-[#0c0a09] flex items-center justify-center font-black text-xl shrink-0 transition-colors";
    }
    if (dropAvatarInit) dropAvatarInit.textContent = (u.name || "P")[0].toUpperCase();
    if (dropdownUserName) dropdownUserName.textContent = u.name;
    if (dropUserHandleRole) {
      const roleDescr = u.roleLabel || (isAdmin ? "Store Owner / Admin" : "Floor Staff / Cashier");
      dropUserHandleRole.textContent = `@${u.username} • ${roleDescr}`;
    }
    if (dropStoreBrand) {
      const activeB = this.getActiveBrand();
      const bName = activeB?.name || "Cranky Panda";
      dropStoreBrand.textContent = isAdmin ? `${bName} (Admin Console)` : `${bName} (Store #4)`;
    }
    if (dropSellerName) dropSellerName.textContent = u.name;
    if (dropThemeText) {
      dropThemeText.textContent = this.currentTheme === "nordic-light" ? "LIGHT MODE" : "DARK MODE";
    }

    // Role-specific sections in dropdown
    const dropAdminSection = document.getElementById("dropdown-admin-section");
    const dropStaffRecount = document.getElementById("dropdown-btn-staff-recount");
    if (dropAdminSection) dropAdminSection.classList.toggle("hidden", !isAdmin);
    if (dropStaffRecount) dropStaffRecount.classList.toggle("hidden", isAdmin);

    // Nav tab visibility (Balance Sheet is Admin Only)
    const navBalance = document.getElementById("nav-tab-balance");
    const mobBalance = document.getElementById("mob-tab-balance");

    if (navBalance) navBalance.classList.toggle("hidden", !isAdmin);
    if (mobBalance) mobBalance.classList.toggle("hidden", !isAdmin);

    // Inventory Top Buttons (Add SKU is admin only, Recount request is for staff)
    const btnAddSku = document.getElementById("btn-inv-add-sku");
    const btnRecount = document.getElementById("btn-inv-recount");
    if (btnAddSku) btnAddSku.classList.toggle("hidden", !isAdmin);
    if (btnRecount) btnRecount.classList.toggle("hidden", isAdmin);

    // If in Staff mode and on an admin-restricted tab, switch to POS Book immediately
    if (!isAdmin && this.currentTab === "balance") {
      this.switchTab("pos");
    }
  }

  toggleThemeMode() {
    const isCurrentlyLight = this.currentTheme === "nordic-light";
    const nextTheme = isCurrentlyLight ? "cranky-dark" : "nordic-light";
    this.setTheme(nextTheme, true);
    const textEl = document.getElementById("dropdown-theme-mode-text");
    if (textEl) {
      textEl.textContent = nextTheme === "nordic-light" ? "LIGHT MODE" : "DARK MODE";
    }
    this.showToast(`Theme changed to ${nextTheme === "nordic-light" ? "Light Mode" : "Dark Mode"}`, "info");
  }

  switchPortal(targetPortal) {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    if (targetPortal === "admin") {
      // If current user is already admin, switch directly
      if (this.currentUser && this.currentUser.role === "admin") {
        this.currentPortal = "admin";
        this.isAdminUnlocked = true;
        this.saveState();
        this.updatePortalUI();
        this.renderInventoryCards();
        this.renderLedgerList();
        this.switchTab("balance");
        this.showToast("👑 Switched to Admin Portal", "info");
        this.playChime("success");
      } else {
        // Prompt login for Admin
        this.openLoginModal("admin");
      }
    } else {
      // Switch to Staff Portal
      this.currentPortal = "staff";
      this.isAdminUnlocked = false;
      this.saveState();
      this.updatePortalUI();
      this.renderInventoryCards();
      this.renderLedgerList();
      this.switchTab("pos");
      this.showToast("👤 Switched to Staff Floor Portal", "info");
      this.playChime("beep");
    }
  }

  togglePortalSwitch() {
    const target = this.currentPortal === "admin" ? "staff" : "admin";
    this.switchPortal(target);
  }

  showAuthGate(msg = "") {
    const gate = document.getElementById("auth-gate-screen");
    const mainContent = document.getElementById("app-main-content");
    const errorEl = document.getElementById("gate-error-msg");
    const errorText = document.getElementById("gate-error-text");
    const userInp = document.getElementById("gate-user-input");
    const passInp = document.getElementById("gate-password-input");

    if (gate) gate.classList.remove("hidden");
    if (mainContent) mainContent.classList.add("hidden");

    if (errorEl) {
      if (msg) {
        if (errorText) errorText.textContent = msg;
        else errorEl.textContent = msg;
        errorEl.classList.remove("hidden");
      } else {
        errorEl.classList.add("hidden");
      }
    }
    if (userInp) {
      userInp.value = "";
      setTimeout(() => { if (typeof userInp.focus === 'function') userInp.focus(); }, 150);
    }
    if (passInp) passInp.value = "";
  }

  hideAuthGate() {
    const gate = document.getElementById("auth-gate-screen");
    const mainContent = document.getElementById("app-main-content");

    if (gate) gate.classList.add("hidden");
    if (mainContent) mainContent.classList.remove("hidden");
  }

  setupAuthGateListeners() {
    const gateForm = document.getElementById("form-auth-gate");
    if (gateForm && !gateForm._hasAuthListener) {
      gateForm._hasAuthListener = true;
      gateForm.addEventListener("submit", (e) => {
        this.handleGateLoginSubmit(e);
      });
    }
  }

  authenticateUser(loginVal, passVal) {
    if (!loginVal || !passVal) {
      return { success: false, error: "Please enter both User ID and Password." };
    }
    const cleanLogin = loginVal.trim().toLowerCase();
    
    // Look up user by username or email
    const user = this.usersList.find(u => 
      (u.username && u.username.toLowerCase() === cleanLogin) || 
      (u.email && u.email.toLowerCase() === cleanLogin)
    );

    if (!user) {
      return { success: false, error: "User ID or Email not found. Check credentials." };
    }

    const userPass = (user.password !== undefined && user.password !== null) ? String(user.password) : "";
    if (userPass !== String(passVal)) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    return { success: true, user };
  }

  handleGateLoginSubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const userInput = (document.getElementById("gate-user-input")?.value || "").trim();
    const passInput = document.getElementById("gate-password-input")?.value || "";
    const rememberMe = document.getElementById("gate-remember-me")?.checked;
    const errorEl = document.getElementById("gate-error-msg");
    const errorText = document.getElementById("gate-error-text");

    const authRes = this.authenticateUser(userInput, passInput);
    if (!authRes.success) {
      if (errorEl) {
        if (errorText) errorText.textContent = authRes.error;
        else errorEl.textContent = authRes.error;
        errorEl.classList.remove("hidden");
      }
      this.playChime("beep");
      return;
    }

    // Success login
    const user = authRes.user;
    this.currentUser = user;
    this.activeStaff = user.name;
    this.currentPortal = user.role === "admin" ? "admin" : "staff";
    this.isAdminUnlocked = user.role === "admin";

    sessionStorage.setItem("cranky_auth_session_user_id", user.id);
    if (rememberMe) {
      localStorage.setItem("cranky_auth_session_user_id", user.id);
    } else {
      localStorage.removeItem("cranky_auth_session_user_id");
    }

    this.saveState();
    this.hideAuthGate();

    // Initialize UI views
    this.initSupabaseSync();
    this.updatePortalUI();
    this.renderInventoryCards();
    this.renderLedgerList();
    this.renderBalanceSheet();
    this.renderPosCatalog();
    this.renderInventoryTable();
    this.renderClosingSummary();

    // Default tab based on role
    this.switchTab(this.currentPortal === "admin" ? "balance" : "pos");

    this.showToast(`Welcome, ${user.name}! Signed in to ${user.role === 'admin' ? '👑 Admin Portal' : '👤 Staff Portal'}.`, "info");
    this.playChime("success");
  }

  openLoginModal(requiredRole = null) {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    const modal = document.getElementById("modal-auth-login");
    const roleNotice = document.getElementById("login-role-notice");
    const errorMsg = document.getElementById("login-error-msg");
    const userInput = document.getElementById("login-user-input");
    const pwdInput = document.getElementById("login-password-input");

    if (roleNotice) {
      roleNotice.classList.toggle("hidden", requiredRole !== "admin");
    }
    if (errorMsg) errorMsg.classList.add("hidden");
    if (userInput) userInput.value = "";
    if (pwdInput) pwdInput.value = "";

    this.renderQuickLoginPresets();
    if (modal) modal.classList.remove("hidden");
    setTimeout(() => { if (userInput && typeof userInput.focus === 'function') userInput.focus(); }, 100);
  }

  closeLoginModal() {
    const modal = document.getElementById("modal-auth-login");
    if (modal) modal.classList.add("hidden");
  }

  selectUserForLogin(username) {
    const userInput = document.getElementById("login-user-input");
    const pwdInput = document.getElementById("login-password-input");
    const errorMsg = document.getElementById("login-error-msg");
    if (errorMsg) errorMsg.classList.add("hidden");
    if (userInput) userInput.value = username;
    if (pwdInput) {
      pwdInput.value = "";
      pwdInput.focus();
    }
  }

  renderQuickLoginPresets() {
    const container = document.getElementById("login-quick-users-list");
    if (!container) return;

    container.innerHTML = this.usersList.map(u => {
      const roleBadge = u.role === "admin" 
        ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e87a24]/20 text-[#fed7aa] shrink-0">👑 Admin</span>`
        : `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">👤 Staff</span>`;

      return `
        <button type="button" onclick="app.selectUserForLogin('${this.escapeHtml(u.username)}')" class="w-full p-2.5 rounded-xl bg-theme-surface border border-theme-subtle hover:border-[#e87a24]/50 flex items-center justify-between text-left group transition-all">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-lg ${u.role === 'admin' ? 'bg-[#e87a24] text-[#0c0a09]' : 'bg-[#221c19] text-[#fed7aa] border border-[#e87a24]/30'} font-black flex items-center justify-center text-xs shrink-0">
              ${(u.name || "U")[0].toUpperCase()}
            </div>
            <div class="truncate">
              <div class="text-xs font-extrabold text-theme-primary group-hover:text-[#e87a24]">${this.escapeHtml(u.name)}</div>
              <div class="text-[10px] text-theme-muted">${this.escapeHtml(u.username)} • Click to enter password</div>
            </div>
          </div>
          ${roleBadge}
        </button>
      `;
    }).join('');
  }

  handleLoginSubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const loginVal = (document.getElementById("login-user-input")?.value || "").trim().toLowerCase();
    const passVal = document.getElementById("login-password-input")?.value || "";
    const errorMsg = document.getElementById("login-error-msg");

    const authRes = this.authenticateUser(loginVal, passVal);
    if (!authRes.success) {
      if (errorMsg) {
        errorMsg.textContent = authRes.error;
        errorMsg.classList.remove("hidden");
      }
      this.playChime("beep");
      return;
    }

    // Success login
    const user = authRes.user;
    this.currentUser = user;
    this.activeStaff = user.name;
    this.currentPortal = user.role === "admin" ? "admin" : "staff";
    this.isAdminUnlocked = user.role === "admin";
    sessionStorage.setItem("cranky_auth_session_user_id", user.id);
    localStorage.setItem("cranky_auth_session_user_id", user.id);
    this.saveState();
    this.closeLoginModal();
    this.hideAuthGate();
    this.updatePortalUI();
    this.renderInventoryCards();
    this.renderLedgerList();
    this.renderBalanceSheet();
    this.renderPosCatalog();
    this.renderInventoryTable();
    this.renderClosingSummary();
    this.switchTab(this.currentPortal === "admin" ? "balance" : "pos");
    this.showToast(`Signed in as ${user.name} (${user.role === 'admin' ? 'Admin Portal' : 'Staff Portal'})`, "info");
    this.playChime("success");
  }

  quickLogin(userIdOrKey) {
    const user = this.usersList.find(u => u.id === userIdOrKey || u.username === userIdOrKey);
    if (user) {
      this.selectUserForLogin(user.username);
    }
  }

  handleLogout() {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    sessionStorage.removeItem("cranky_auth_session_user_id");
    localStorage.removeItem("cranky_auth_session_user_id");
    this.currentUser = null;
    this.currentPortal = "staff";
    this.isAdminUnlocked = false;
    this.saveState();

    this.showToast("Signed out from session.", "info");
    this.showAuthGate();
  }

  togglePasswordVisibility(inputId, btn) {
    const el = document.getElementById(inputId);
    if (!el) return;
    if (el.type === "password") {
      el.type = "text";
      if (btn) btn.textContent = "🙈";
    } else {
      el.type = "password";
      if (btn) btn.textContent = "👁️";
    }
  }

  // --------------------------------------------------------------------------
  // USER & CREDENTIAL MANAGEMENT MODAL
  // --------------------------------------------------------------------------
  openManageUsersModal() {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    this.renderManageUsersList();
    document.getElementById("modal-manage-users")?.classList.remove("hidden");
  }

  closeManageUsersModal() {
    document.getElementById("modal-manage-users")?.classList.add("hidden");
  }

  renderManageUsersList() {
    const container = document.getElementById("manage-users-table-container");
    const countEl = document.getElementById("manage-users-count");
    if (countEl) countEl.textContent = this.usersList.length;
    if (!container) return;

    container.innerHTML = this.usersList.map(u => {
      const isPassProtected = !!(u.password && u.password.trim());
      const roleBadge = u.role === "admin" 
        ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e87a24]/20 text-[#fed7aa]">👑 Admin</span>`
        : `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">👤 Floor Staff</span>`;

      const passBadge = isPassProtected
        ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">🔒 Password: "${this.escapeHtml(u.password)}"</span>`
        : `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">⚠️ Temporary: "123"</span>`;

      return `
        <div class="p-3.5 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl ${u.role === 'admin' ? 'bg-[#e87a24] text-[#0c0a09]' : 'bg-[#221c19] text-[#fed7aa] border border-[#e87a24]/30'} font-black flex items-center justify-center text-sm shrink-0">
              ${(u.name || "U")[0].toUpperCase()}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-black text-theme-primary">${this.escapeHtml(u.name)}</span>
                ${roleBadge}
                ${passBadge}
              </div>
              <div class="text-[11px] text-theme-muted mt-0.5 truncate">
                username: <strong class="text-theme-secondary font-mono">@${this.escapeHtml(u.username)}</strong>
                ${u.email ? ` • <span class="text-theme-muted">${this.escapeHtml(u.email)}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button type="button" onclick="app.handleSetUserPassword('${u.id}')" class="px-2.5 py-1.5 rounded-xl bg-theme-elevated border border-theme-subtle hover:border-theme-strong text-[11px] font-bold text-theme-primary transition-all" title="Change password">
              🔑 Change Password
            </button>
            <button type="button" onclick="app.handleRemoveUserPassword('${u.id}')" class="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-all" title="Reset password to default 123">
              🔄 Reset to 123
            </button>
            ${u.id !== 'usr-admin-1' ? `
              <button type="button" onclick="app.handleDeleteUser('${u.id}')" class="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs transition-all" title="Delete staff account">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  handleAddNewUser(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const name = document.getElementById("new-user-name")?.value.trim();
    const username = document.getElementById("new-user-username")?.value.trim().toLowerCase();
    const email = document.getElementById("new-user-email")?.value.trim().toLowerCase();
    const role = document.getElementById("new-user-role")?.value || "staff";
    const password = (document.getElementById("new-user-password")?.value.trim() || "123");

    if (!name || !username) {
      alert("Name and username are required.");
      return;
    }

    if (this.usersList.some(u => u.username.toLowerCase() === username)) {
      alert(`Username "@${username}" already exists. Choose another username.`);
      return;
    }

    const newUser = {
      id: "usr-" + Date.now(),
      name: name,
      username: username,
      email: email || `${username}@crankypanda.coffee`,
      role: role,
      password: password,
      avatarColor: role === "admin" ? "#e87a24" : "#fba758"
    };

    this.usersList.push(newUser);
    this.saveState();
    this.renderManageUsersList();
    this.renderQuickLoginPresets();
    this.showToast(`User ${name} added successfully!`, "info");
    this.playChime("success");

    // Reset form
    document.getElementById("add-user-form-body")?.reset();
    document.getElementById("add-user-form-body")?.classList.add("hidden");
  }

  handleRemoveUserPassword(userId) {
    const user = this.usersList.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Reset password for ${user.name} to default "123"?`)) {
      user.password = "123";
      this.saveState();
      this.renderManageUsersList();
      this.renderQuickLoginPresets();
      this.showToast(`Password for ${user.name} reset to "123".`, "info");
      this.playChime("beep");
    }
  }

  handleSetUserPassword(userId) {
    const user = this.usersList.find(u => u.id === userId);
    if (!user) return;

    const currentPass = user.password || "123";
    const newPass = prompt(`Set new password for ${user.name} (@${user.username}):`, currentPass);
    if (newPass === null) return; // Cancelled
    if (!newPass.trim()) {
      alert("Password cannot be blank.");
      return;
    }

    user.password = newPass.trim();
    this.saveState();
    this.renderManageUsersList();
    this.renderQuickLoginPresets();
    this.showToast(`Password updated for ${user.name}.`, "info");
    this.playChime("success");
  }

  handleDeleteUser(userId) {
    const user = this.usersList.find(u => u.id === userId);
    if (!user) return;
    if (user.id === "usr-admin-1") {
      alert("Cannot delete primary store administrator.");
      return;
    }

    if (confirm(`Are you sure you want to delete staff account ${user.name} (@${user.username})?`)) {
      this.usersList = this.usersList.filter(u => u.id !== userId);
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = this.usersList[0];
      }
      this.saveState();
      this.renderManageUsersList();
      this.renderQuickLoginPresets();
      this.updatePortalUI();
      this.showToast(`User deleted.`, "info");
      this.playChime("beep");
    }
  }

  exportUsersJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.usersList, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `cranky_panda_users_${Date.now()}.json`);
    dlAnchor.click();
    this.showToast("Users exported to JSON file.");
  }

  handleImportUsersJson(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          let count = 0;
          imported.forEach(impUser => {
            if (impUser.username) {
              const existingIdx = this.usersList.findIndex(u => u.username.toLowerCase() === impUser.username.toLowerCase());
              if (existingIdx >= 0) {
                this.usersList[existingIdx] = { ...this.usersList[existingIdx], ...impUser };
              } else {
                this.usersList.push({
                  id: impUser.id || ("usr-" + Date.now() + Math.random().toString(36).substring(2, 5)),
                  name: impUser.name || impUser.username,
                  username: impUser.username.toLowerCase(),
                  email: impUser.email || `${impUser.username}@crankypanda.coffee`,
                  role: impUser.role || "staff",
                  password: impUser.password !== undefined ? impUser.password : "",
                  avatarColor: impUser.avatarColor || "#e87a24"
                });
              }
              count++;
            }
          });
          this.saveState();
          this.renderManageUsersList();
          this.renderQuickLoginPresets();
          this.showToast(`Successfully imported ${count} users from JSON!`, "info");
          this.playChime("success");
        } else {
          alert("Invalid users JSON file format. Expected an array of users.");
        }
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // --------------------------------------------------------------------------
  // OWN PASSWORD MANAGEMENT MODAL
  // --------------------------------------------------------------------------
  openChangePasswordModal() {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    const u = this.currentUser || this.usersList[0];
    const userLabel = document.getElementById("change-pwd-user-label");
    if (userLabel) userLabel.textContent = `Logged in as ${u.name} (@${u.username})`;
    const pwdInput = document.getElementById("new-password-val");
    if (pwdInput) pwdInput.value = u.password || "";

    document.getElementById("modal-change-password")?.classList.remove("hidden");
  }

  closeChangePasswordModal() {
    document.getElementById("modal-change-password")?.classList.add("hidden");
  }

  handleSaveOwnPassword(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const u = this.currentUser;
    if (!u) return;
    const newPass = (document.getElementById("new-password-val")?.value || "").trim();
    if (!newPass) {
      this.showToast("Password cannot be blank.", "error");
      return;
    }
    u.password = newPass;

    // Sync in usersList
    const target = this.usersList.find(x => x.id === u.id);
    if (target) target.password = u.password;

    this.saveState();
    this.closeChangePasswordModal();
    this.showToast("Password updated successfully!", "info");
    this.playChime("success");
  }

  // --------------------------------------------------------------------------
  // STAFF RECOUNT / RESTOCK REQUEST WORKFLOW (SOCKADOODLE-STYLE APPROVALS)
  // --------------------------------------------------------------------------
  openStaffRequestStockModal(productId = null) {
    const profileDropdown = document.getElementById("profile-dropdown");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    const prodSelect = document.getElementById("req-product-select");
    if (prodSelect) {
      prodSelect.innerHTML = this.products.map(p => `
        <option value="${p.id}" ${p.id === productId ? 'selected' : ''}>
          ${this.escapeHtml(p.name)} (${p.sku || 'No SKU'}) • Stock: ${p.stock || 0}
        </option>
      `).join('');
    }

    this.staffReqType = "set";
    this.setStaffReqType("set");
    this.handleReqProductChange();

    const noteInput = document.getElementById("staff-req-note-input");
    if (noteInput) noteInput.value = "";
    document.getElementById("modal-staff-request-stock")?.classList.remove("hidden");
  }

  closeStaffRequestStockModal() {
    document.getElementById("modal-staff-request-stock")?.classList.add("hidden");
  }

  handleReqProductChange() {
    const prodId = document.getElementById("req-product-select")?.value;
    const prod = this.products.find(p => p.id === prodId) || this.products[0];
    this.staffReqProduct = prod;

    const currentStockEl = document.getElementById("req-current-stock-label");
    if (currentStockEl) currentStockEl.textContent = prod ? prod.stock : 0;
    const qtyInput = document.getElementById("staff-req-qty-input");
    if (qtyInput && prod && this.staffReqType === "set") {
      qtyInput.value = prod.stock;
    }
  }

  setStaffReqType(type) {
    this.staffReqType = type;
    const hiddenVal = document.getElementById("staff-req-type-val");
    if (hiddenVal) hiddenVal.value = type;

    ["set", "add", "reduce"].forEach(t => {
      const btn = document.getElementById(`btn-req-type-${t}`);
      if (btn) {
        if (t === type) {
          btn.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-[#e87a24]/20 border-[#e87a24]/50 text-[#fed7aa]";
        } else {
          btn.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-center border transition-all bg-theme-surface border-theme-subtle text-theme-muted hover:text-theme-primary";
        }
      }
    });

    const label = document.getElementById("staff-req-qty-label");
    const qtyInput = document.getElementById("staff-req-qty-input");
    if (label) {
      if (type === "set") label.textContent = "Actual Physical Count On Floor *";
      if (type === "add") label.textContent = "Quantity to Restock (+ Units Added) *";
      if (type === "reduce") label.textContent = "Quantity Damaged / Lost (- Units Deducted) *";
    }
    if (qtyInput) {
      qtyInput.value = type === "set" ? (this.staffReqProduct ? this.staffReqProduct.stock : 0) : 1;
    }
  }

  handleSubmitStaffStockRequest(e) {
    e.preventDefault();
    const prodId = document.getElementById("req-product-select")?.value;
    const prod = this.products.find(p => p.id === prodId);
    if (!prod) {
      alert("Please select a product.");
      return;
    }

    const type = this.staffReqType || "set";
    const inputVal = parseInt(document.getElementById("staff-req-qty-input")?.value, 10);
    const reason = document.getElementById("staff-req-reason-select")?.value;
    const note = document.getElementById("staff-req-note-input")?.value.trim();

    if (isNaN(inputVal) || inputVal < 0) {
      alert("Please enter a valid count or quantity.");
      return;
    }

    const currentStock = prod.stock || 0;
    let requestedStock = currentStock;
    let difference = 0;

    if (type === "set") {
      requestedStock = inputVal;
      difference = requestedStock - currentStock;
    } else if (type === "add") {
      requestedStock = currentStock + inputVal;
      difference = inputVal;
    } else if (type === "reduce") {
      requestedStock = Math.max(0, currentStock - inputVal);
      difference = -inputVal;
    }

    const requestObj = {
      id: "req-" + Date.now(),
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku || "",
      productFlavour: prod.flavour || prod.material || "",
      productPhoto: prod.photo || "assets/logo.jpg",
      currentStock: currentStock,
      requestedStock: requestedStock,
      difference: difference,
      type: type,
      reason: reason,
      staffNote: note,
      requestedBy: this.currentUser ? this.currentUser.name : (this.activeStaff || "Floor Staff"),
      requestedAt: new Date().toISOString(),
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      adminNote: ""
    };

    this.pendingRequests.unshift(requestObj);
    this.saveState();
    this.closeStaffRequestStockModal();
    this.updateApprovalsBadge();
    this.renderApprovalsView();
    this.showToast("Stock recount request submitted! Awaiting Admin review.", "info");
    this.playChime("success");
  }

  updateApprovalsBadge() {
    const pendingCount = this.pendingRequests.filter(r => r.status === "pending").length;
    const navBadge = document.getElementById("nav-approvals-badge");
    const mobBadge = document.getElementById("mob-approvals-badge");
    const dropdownCount = document.getElementById("dropdown-approvals-count");
    const headerPill = document.getElementById("approvals-pending-pill");

    if (navBadge) {
      navBadge.textContent = pendingCount;
      navBadge.classList.toggle("hidden", pendingCount === 0);
    }
    if (mobBadge) {
      mobBadge.textContent = pendingCount;
      mobBadge.classList.toggle("hidden", pendingCount === 0);
    }
    if (dropdownCount) {
      dropdownCount.textContent = pendingCount;
    }
    if (headerPill) {
      headerPill.textContent = `${pendingCount} Pending Request${pendingCount === 1 ? '' : 's'}`;
    }
  }

  setApprovalTabFilter(filter) {
    this.approvalTabFilter = filter;
    ["pending", "approved", "rejected", "all"].forEach(f => {
      const btn = document.getElementById(`filter-approvals-${f}`);
      if (btn) {
        if (f === filter) {
          btn.className = "px-3.5 py-1.5 rounded-lg font-bold bg-theme-elevated text-theme-primary transition-all";
        } else {
          btn.className = "px-3.5 py-1.5 rounded-lg text-theme-muted hover:text-theme-primary transition-all";
        }
      }
    });
    this.renderApprovalsView();
  }

  renderApprovalsView() {
    const listContainer = document.getElementById("approvals-requests-list");
    const emptyState = document.getElementById("approvals-empty-state");
    if (!listContainer) return;

    // Update filter counts
    const pendingCount = this.pendingRequests.filter(r => r.status === "pending").length;
    const approvedCount = this.pendingRequests.filter(r => r.status === "approved").length;
    const rejectedCount = this.pendingRequests.filter(r => r.status === "rejected").length;
    const totalCount = this.pendingRequests.length;

    const elCountPending = document.getElementById("count-approvals-pending");
    const elCountApproved = document.getElementById("count-approvals-approved");
    const elCountRejected = document.getElementById("count-approvals-rejected");
    const elCountAll = document.getElementById("count-approvals-all");

    if (elCountPending) elCountPending.textContent = pendingCount;
    if (elCountApproved) elCountApproved.textContent = approvedCount;
    if (elCountRejected) elCountRejected.textContent = rejectedCount;
    if (elCountAll) elCountAll.textContent = totalCount;

    this.updateApprovalsBadge();

    // Filter items
    const filtered = this.pendingRequests.filter(r => {
      if (this.approvalTabFilter === "pending") return r.status === "pending";
      if (this.approvalTabFilter === "approved") return r.status === "approved";
      if (this.approvalTabFilter === "rejected") return r.status === "rejected";
      return true;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    listContainer.innerHTML = filtered.map(req => {
      const isPending = req.status === "pending";
      const isApproved = req.status === "approved";
      const isRejected = req.status === "rejected";

      const diffBadge = req.difference > 0
        ? `<span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">+${req.difference} units</span>`
        : req.difference < 0
        ? `<span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">${req.difference} units</span>`
        : `<span class="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-zinc-800 text-zinc-300">0 change</span>`;

      const statusPill = isPending
        ? `<span class="px-2.5 py-1 rounded-xl text-xs font-black bg-[#e87a24]/20 text-[#fed7aa] border border-[#e87a24]/40 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#e87a24] animate-pulse"></span>Pending Approval</span>`
        : isApproved
        ? `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Approved</span>`
        : `<span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">✕ Rejected</span>`;

      const reqDate = new Date(req.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

      return `
        <div class="theme-card p-4 sm:p-5 space-y-3.5 transition-all">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-theme-surface border border-theme-subtle overflow-hidden shrink-0">
                <img src="${req.productPhoto || 'assets/logo.jpg'}" alt="${this.escapeHtml(req.productName)}" class="w-full h-full object-cover" onerror="this.src='assets/logo.jpg'" />
              </div>
              <div class="min-w-0">
                <h4 class="text-sm sm:text-base font-extrabold text-theme-primary truncate">${this.escapeHtml(req.productName)}</h4>
                <div class="flex items-center gap-2 text-[11px] text-theme-muted mt-0.5">
                  <span class="font-mono text-[#8d7d70]">${this.escapeHtml(req.productSku || 'SKU')}</span>
                  ${req.productFlavour ? `<span>• ${this.escapeHtml(req.productFlavour)}</span>` : ''}
                  <span>• Requested by <strong>${this.escapeHtml(req.requestedBy)}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-center">
              ${statusPill}
            </div>
          </div>

          <!-- Diff Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-black/30 border border-theme-subtle text-xs">
            <div>
              <span class="text-theme-muted text-[10px] uppercase font-bold tracking-wider block">Current Stock</span>
              <span class="font-mono font-black text-sm text-theme-primary mt-0.5">${req.currentStock} units</span>
            </div>
            <div>
              <span class="text-[#e87a24] text-[10px] uppercase font-bold tracking-wider block">Requested Stock</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-mono font-black text-sm text-[#fed7aa]">${req.requestedStock} units</span>
                ${diffBadge}
              </div>
            </div>
            <div>
              <span class="text-theme-muted text-[10px] uppercase font-bold tracking-wider block">Reason</span>
              <span class="text-xs font-semibold text-theme-secondary mt-0.5 block truncate">${this.escapeHtml(req.reason)}</span>
            </div>
          </div>

          <!-- Staff Note & Review Note -->
          <div class="space-y-1 text-xs">
            <div class="p-2.5 rounded-xl bg-theme-surface border border-theme-subtle text-theme-secondary">
              <span class="font-bold text-[#fed7aa]">Staff Note:</span>
              <span class="italic text-theme-primary ml-1">"${this.escapeHtml(req.staffNote || 'No details provided.')}"</span>
              <span class="text-[10px] text-theme-muted block mt-1">${reqDate}</span>
            </div>

            ${!isPending ? `
              <div class="text-[11px] text-theme-muted px-1">
                Reviewed by <strong>${this.escapeHtml(req.reviewedBy || 'Admin')}</strong> on ${new Date(req.reviewedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            ` : ''}
          </div>

          <!-- Action Buttons (Admin Only & Pending) -->
          ${isPending && this.currentPortal === 'admin' ? `
            <div class="pt-2 border-t border-theme-subtle flex items-center justify-end gap-2">
              <button type="button" onclick="app.handleRejectRequest('${req.id}')" class="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5">
                <span>✕ Reject Request</span>
              </button>
              <button type="button" onclick="app.handleApproveRequest('${req.id}')" class="px-5 py-2 rounded-xl theme-btn-primary font-black text-xs transition-all shadow-md shadow-[#e87a24]/20 active:scale-95 flex items-center gap-1.5">
                <svg class="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span>✓ Approve &amp; Update Stock</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  handleApproveRequest(requestId) {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return;

    // Find product to update
    const prod = this.products.find(p => p.id === req.productId || (req.productSku && p.sku === req.productSku) || p.name === req.productName);
    if (prod) {
      prod.stock = req.requestedStock;
      if (window.supabaseSync && window.supabaseSync.isConnected) {
        window.supabaseSync.saveProduct(prod, this.activeBrandId);
      }
    }

    req.status = "approved";
    req.reviewedBy = this.currentUser ? this.currentUser.name : "Admin";
    req.reviewedAt = new Date().toISOString();

    this.saveState();
    this.renderApprovalsView();
    this.renderInventoryCards();
    this.renderPosCatalog();
    this.showToast(`✓ Approved recount for ${req.productName}! Stock set to ${req.requestedStock}.`, "info");
    this.playChime("success");
  }

  handleRejectRequest(requestId) {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return;

    req.status = "rejected";
    req.reviewedBy = this.currentUser ? this.currentUser.name : "Admin";
    req.reviewedAt = new Date().toISOString();

    this.saveState();
    this.renderApprovalsView();
    this.showToast(`✕ Recount request for ${req.productName} rejected. Stock unchanged.`, "info");
    this.playChime("beep");
  }

  // Backward compatibility alias for PIN modal
  handleAdminToggle() {
    this.togglePortalSwitch();
  }

  closeAdminPinModal() {
    document.getElementById("modal-admin-pin")?.classList.add("hidden");
  }

  verifyAdminPin(e) {
    e.preventDefault();
    this.switchPortal("admin");
  }

  updateAdminStatusUI() {
    this.updatePortalUI();
  }

  // --------------------------------------------------------------------------
  // SHARED CARD RENDERER (Matches Cranky Panda Screenshot)
  // --------------------------------------------------------------------------
  renderProductCardHtml(p, context = "inventory") {
    const salePrice = p.salePrice || p.quotedPrice || p.floorPrice || 0;
    const costPrice = p.costPrice || 0;
    const floorPrice = p.floorPrice || 0;
    const isOutOfStock = (p.stock || 0) <= 0;
    const isLowStock = (p.stock || 0) > 0 && (p.stock || 0) <= 5;
    const cartItem = this.cart.find(item => item.id === p.id);
    const inCartQty = cartItem ? cartItem.quantity : 0;
    const photoSrc = p.photo && (p.photo.includes('/') || p.photo.includes('.') || p.photo.startsWith('data:'))
      ? p.photo
      : "assets/logo.jpg";

    // ========================================================================
    // CONTEXT 1: POS BOOK VIEW (Matches 3-Color Cranky Panda Brand Palette)
    // ========================================================================
    if (context === "pos") {
      const activeBorder = inCartQty > 0
        ? "border-[#e87a24] ring-2 ring-[#e87a24]/40 shadow-lg shadow-[#e87a24]/15"
        : "border-[#2b2420] hover:border-[#443831] shadow-sm";

      return `
        <div class="p-3 sm:p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative select-none bg-[#181412] ${activeBorder} ${isOutOfStock ? 'opacity-40' : ''}">
          <div>
            <!-- Wide Top Image Cover matching Image 1 -->
            <div class="w-full h-28 sm:h-36 rounded-xl overflow-hidden mb-2.5 bg-[#12100e] border border-[#2b2420]">
              <img src="${photoSrc}" alt="${p.name}" class="w-full h-full object-cover transition-transform hover:scale-105 duration-200" onerror="this.src='assets/logo.jpg'" loading="lazy" />
            </div>

            <!-- Tags Row: Category, Flavour/Variant, Stock Status -->
            <div class="flex items-center justify-between text-[10px] mb-2 gap-1 flex-wrap">
              <div class="flex items-center gap-1">
                <span class="px-2 py-0.5 rounded-md uppercase tracking-wider text-[9px] font-bold bg-[#221c19] text-[#d6c5b0] border border-[#2b2420]">
                  ${p.category || 'General'}
                </span>
                ${p.material || p.flavour ? `
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e87a24]/15 text-[#fed7aa] border border-[#e87a24]/30">
                    ${p.material || p.flavour}
                  </span>
                ` : ''}
              </div>

              <!-- Stock Status Pill -->
              ${isOutOfStock ? `
                <span class="text-[#8d7d70] font-bold bg-black/50 border border-[#443831] px-1.5 py-0.5 rounded text-[10px]">Sold Out</span>
              ` : isLowStock ? `
                <span class="text-[#fba758] font-bold bg-[#e87a24]/20 border border-[#e87a24]/35 px-1.5 py-0.5 rounded text-[10px]">${p.stock} left</span>
              ` : `
                <span class="text-[#fed7aa] font-mono font-bold bg-[#e87a24]/15 border border-[#e87a24]/30 px-1.5 py-0.5 rounded text-[10px]">${p.stock} left</span>
              `}
            </div>

            <!-- Product Title -->
            <h4 class="text-xs sm:text-sm font-black text-[#fdf6e7] line-clamp-2 leading-snug pos-product-title" style="color: #fdf6e7 !important;">
              ${p.name}
            </h4>
            ${p.sku ? `<span class="text-[10px] font-mono font-bold text-[#a89f91] block mt-0.5">${p.sku}</span>` : ''}
            ${p.canBeFree ? `
              <div class="mt-1">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e87a24]/15 text-[#fed7aa] border border-[#e87a24]/30">🎁 Free Goodie</span>
              </div>
            ` : ''}
          </div>

          <!-- Price & Action Row -->
          <div class="mt-3 pt-2.5 border-t border-[#2b2420] space-y-2">
            <!-- Price Row: Amber Sale Price + Muted Cream Floor Price -->
            <div class="flex items-baseline justify-between">
              <span class="text-sm sm:text-base font-black font-mono text-[#e87a24]">₹${salePrice}</span>
              <span class="text-[10px] font-mono text-[#a89f91] font-semibold">Floor: ₹${floorPrice}</span>
            </div>

            <!-- Action: If in cart, show [-] N in cart [+] stepper. If not in cart, show "+ Add" and "⚡" -->
            ${inCartQty > 0 ? `
              <div class="flex items-center justify-between bg-[#e87a24]/15 border border-[#e87a24]/40 rounded-xl p-1">
                <button type="button" onclick="app.updateCartQty('${p.id}', -1)" class="w-7 h-7 rounded-lg bg-[#221c19] hover:bg-[#2b2420] text-[#fdf6e7] font-black flex items-center justify-center text-xs active:scale-90" title="Minus 1">-</button>
                <span class="text-xs font-mono font-black text-[#fed7aa]">${inCartQty} in cart</span>
                <button type="button" onclick="app.updateCartQty('${p.id}', 1)" class="w-7 h-7 rounded-lg bg-[#e87a24] hover:bg-[#f28522] text-[#0c0a09] font-black flex items-center justify-center text-xs active:scale-90" title="Add 1">+</button>
              </div>
            ` : `
              <div class="flex items-center gap-1.5">
                <button type="button" ${isOutOfStock ? 'disabled' : ''} onclick="app.addToCart('${p.id}')" class="flex-1 py-2 px-2 rounded-xl bg-[#e87a24] hover:bg-[#f28522] active:scale-95 text-[#0c0a09] font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-[#e87a24]/20 disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg class="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
                  <span>Add</span>
                </button>
                <button type="button" ${isOutOfStock ? 'disabled' : ''} onclick="app.openSingleSellModal('${p.id}')" class="p-2 rounded-xl bg-[#221c19] hover:bg-[#2b2420] text-[#e87a24] transition-colors disabled:opacity-40" title="Negotiate rate / single sell">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // ========================================================================
    // CONTEXT 2: INVENTORY VIEW (Comprehensive Management vs Floor Staff View)
    // ========================================================================
    const isAdmin = this.currentPortal === "admin";
    const marginAmt = Math.max(0, salePrice - costPrice);
    const marginPct = salePrice > 0 ? Math.round((marginAmt / salePrice) * 100) : 0;
    const invBorder = inCartQty > 0
      ? "border-[#e87a24] ring-1 ring-[#e87a24]/30"
      : "hover:border-theme-strong";

    return `
      <div class="theme-card p-4 flex flex-col justify-between group transition-all ${invBorder}">
        <!-- Top Row: Thumbnail, Badges, Title -->
        <div>
          <div class="flex items-start gap-3">
            <!-- Thumbnail Image -->
            <div class="w-16 h-16 rounded-xl bg-theme-surface border border-theme-subtle flex items-center justify-center shrink-0 overflow-hidden">
              <img src="${photoSrc}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='assets/logo.jpg'" />
            </div>

            <!-- Header Info & Badges -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-1">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-theme-surface border border-theme-subtle text-theme-muted shrink-0">
                    ${p.category || 'General'}
                  </span>
                  ${p.flavour || p.material ? `
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e87a24]/15 text-amber-contrast border border-[#e87a24]/30 truncate max-w-[120px]">
                      ${p.flavour || p.material}
                    </span>
                  ` : ''}
                </div>

                <!-- Stock Badge -->
                <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                  isOutOfStock ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' :
                  isLowStock ? 'bg-[#e87a24]/20 text-amber-contrast border border-[#e87a24]/35' :
                  'bg-[#e87a24]/15 text-amber-contrast border border-[#e87a24]/30'
                }">
                  ${p.stock || 0} IN STOCK
                </span>
              </div>

              <!-- Product Name -->
              <h4 class="text-sm font-extrabold text-theme-primary truncate leading-snug" title="${p.name}">
                ${p.name}
              </h4>
              <div class="text-[10px] font-mono text-theme-muted mt-0.5">${p.sku || ''}</div>
            </div>
          </div>

          <!-- Pricing Box: In Admin, shows 3 tiers (COST | FLOOR | SALE). In Staff, hides wholesale COST -->
          ${isAdmin ? `
            <div class="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-theme-subtle text-center bg-theme-surface border border-theme-subtle rounded-xl p-2.5">
              <div>
                <div class="text-[10px] uppercase font-bold text-theme-muted tracking-wider">COST</div>
                <div class="text-sm font-black font-mono text-theme-primary mt-0.5">₹${costPrice}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-theme-muted tracking-wider">FLOOR</div>
                <div class="text-sm font-black font-mono text-theme-primary mt-0.5">₹${floorPrice}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-[#e87a24] tracking-wider">SALE PRICE</div>
                <div class="text-sm font-black font-mono text-[#e87a24] mt-0.5">₹${salePrice}</div>
              </div>
            </div>

            <!-- Margin Line (Admin Only) -->
            <div class="flex items-center justify-between text-xs px-1 mt-2.5">
              <span class="text-theme-muted font-medium text-[11px]">Margin @ Sale:</span>
              <span class="font-mono font-black text-margin-profit text-xs">+₹${marginAmt} (${marginPct}%)</span>
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-theme-subtle text-center bg-theme-surface border border-theme-subtle rounded-xl p-2.5">
              <div>
                <div class="text-[10px] uppercase font-bold text-theme-muted tracking-wider">FLOOR MIN</div>
                <div class="text-sm font-black font-mono text-theme-primary mt-0.5">₹${floorPrice}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-[#e87a24] tracking-wider">SELLING PRICE</div>
                <div class="text-sm font-black font-mono text-[#e87a24] mt-0.5">₹${salePrice}</div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs px-1 mt-2.5 text-theme-muted">
              <span class="text-[11px]">Floor Status:</span>
              <span class="text-[11px] font-bold text-amber-contrast">Available for billing</span>
            </div>
          `}
        </div>

        <!-- Action Buttons Row: Stock (+/-), + Cart, ✏️ Edit -->
        <div class="pt-3 border-t border-theme-subtle flex items-center gap-2 mt-3">
          ${isAdmin ? `
            <!-- Quick Stock Adjust Button (Admin Direct) -->
            <button type="button" onclick="app.openStockAdjustmentModal('${p.id}')" class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-theme-surface border border-theme-subtle hover:border-theme-strong text-xs font-bold text-theme-secondary hover:text-theme-primary transition-all active:scale-95" title="Adjust or recount physical stock">
              <svg class="w-3.5 h-3.5 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Stock (+/-)</span>
            </button>
          ` : `
            <!-- Staff Recount / Restock Request Button -->
            <button type="button" onclick="app.openStaffRequestStockModal('${p.id}')" class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#e87a24]/15 border border-[#e87a24]/40 hover:bg-[#e87a24]/25 text-xs font-bold text-amber-contrast transition-all active:scale-95" title="Request count change or restock approval">
              <svg class="w-3.5 h-3.5 text-[#e87a24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Request Recount</span>
            </button>
          `}

          <!-- Add to Cart / Cart Counter Button with inline Stepper -->
          ${inCartQty > 0 ? `
            <div class="flex-1 flex items-center justify-between bg-[#e87a24]/15 border border-[#e87a24]/40 rounded-xl p-0.5">
              <button type="button" onclick="app.updateCartQty('${p.id}', -1)" class="w-7 h-7 rounded-lg bg-[#221c19] text-[#fdf6e7] font-bold hover:bg-[#2b2420] active:scale-90 flex items-center justify-center text-xs">-</button>
              <span class="font-mono font-black text-xs px-1 text-amber-contrast">${inCartQty} in Cart</span>
              <button type="button" onclick="app.updateCartQty('${p.id}', 1)" class="w-7 h-7 rounded-lg bg-[#e87a24] text-[#0c0a09] font-black hover:bg-[#f28522] active:scale-90 flex items-center justify-center text-xs">+</button>
            </div>
          ` : `
            <button type="button" ${isOutOfStock ? 'disabled' : ''} onclick="app.addToCart('${p.id}')" class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl theme-btn-primary text-xs font-extrabold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <span>+ Cart</span>
            </button>
          `}

          ${isAdmin ? `
            <!-- Edit Item & Stock Pencil Button (Admin Only) -->
            <button type="button" onclick="app.openEditProductModal('${p.id}')" class="p-2 rounded-xl bg-theme-surface border border-theme-subtle hover:border-theme-strong text-theme-secondary hover:text-theme-primary transition-all active:scale-95" title="Edit Item Details & Current Stock">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // VIEW 1: POS BOOK & LIVE BILLING
  // --------------------------------------------------------------------------
  renderPosCatalog() {
    const searchVal = (document.getElementById("pos-search-input")?.value || "").toLowerCase().trim();
    const brand = this.getActiveBrand();

    // Render Category Pills
    const categories = ["All", ...(brand.categories || ["General", "Merchandise"])];
    this.products.forEach(p => {
      if (p.category && !categories.includes(p.category)) categories.push(p.category);
    });

    const catContainer = document.getElementById("pos-category-pills");
    if (catContainer) {
      catContainer.innerHTML = categories.map(cat => {
        const isSelected = this.selectedPosCategory === cat;
        return `
          <button type="button" onclick="app.setPosCategory('${cat}')" class="px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
            isSelected ? 'theme-btn-primary' : 'bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary'
          }">
            ${cat}
          </button>
        `;
      }).join('');
    }

    // Filter Products
    const filtered = this.products.filter(p => {
      const matchCat = this.selectedPosCategory === "All" || p.category === this.selectedPosCategory;
      const matchSearch = !searchVal || 
        (p.name && p.name.toLowerCase().includes(searchVal)) || 
        (p.sku && p.sku.toLowerCase().includes(searchVal)) || 
        (p.flavour && p.flavour.toLowerCase().includes(searchVal)) ||
        (p.material && p.material.toLowerCase().includes(searchVal));

      return matchCat && matchSearch;
    });

    const grid = document.getElementById("pos-product-grid");
    const emptyState = document.getElementById("pos-empty-state");

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    grid.innerHTML = filtered.map(p => this.renderProductCardHtml(p, "pos")).join('');
  }

  setPosCategory(cat) {
    this.selectedPosCategory = cat;
    this.renderPosCatalog();
  }

  resetPosFilters() {
    this.selectedPosCategory = "All";
    const search = document.getElementById("pos-search-input");
    if (search) search.value = "";
    this.renderPosCatalog();
  }

  // --------------------------------------------------------------------------
  // CART & CHECKOUT
  // --------------------------------------------------------------------------
  addToCart(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;
    
    if ((prod.stock || 0) <= 0) {
      alert(`"${prod.name}" has 0 stock in stall inventory. Click the ✏️ pencil icon or "Stock (+/-)" to enter stock before selling.`);
      return;
    }

    const existing = this.cart.find(i => i.id === productId);
    if (existing) {
      if (existing.quantity < prod.stock) {
        existing.quantity += 1;
      } else {
        alert(`Cannot add more. Only ${prod.stock} items left in stock.`);
        return;
      }
    } else {
      this.cart.push({
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        material: prod.flavour || prod.material,
        soldPrice: prod.salePrice || prod.quotedPrice || prod.floorPrice || 0,
        costPrice: prod.costPrice || 0,
        floorPrice: prod.floorPrice || 0,
        quotedPrice: prod.salePrice || prod.quotedPrice || prod.floorPrice || 0,
        canBeFree: !!prod.canBeFree,
        isFreeGoodie: false,
        quantity: 1,
        photo: prod.photo || "assets/logo.jpg"
      });
    }

    this.playChime("beep");
    this.updateCartBadges();
    this.renderPosCatalog();
    this.renderInventoryCards();
    this.showToast(`Added 1× ${prod.name} to Cart`);
  }

  toggleCartGoodie(productId) {
    const item = this.cart.find(i => i.id === productId);
    const prod = this.products.find(p => p.id === productId);
    if (!item) return;

    item.isFreeGoodie = !item.isFreeGoodie;
    if (item.isFreeGoodie) {
      item.soldPrice = 0;
    } else {
      item.soldPrice = (prod && (prod.salePrice || prod.quotedPrice || prod.floorPrice)) || item.quotedPrice || 0;
    }

    this.playChime("beep");
    this.updateCartBadges();
    this.renderCartDrawerItems();
    this.showToast(item.isFreeGoodie ? `Marked "${item.name}" as ₹0 Free Goodie` : `Restored price for "${item.name}"`);
  }

  updateCartQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    const prod = this.products.find(p => p.id === productId);
    if (!item) return;

    if (delta > 0) {
      if (prod && item.quantity >= prod.stock) {
        alert(`Cannot add more. Only ${prod.stock} units available in stall.`);
        return;
      }
      item.quantity += 1;
    } else {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        this.cart = this.cart.filter(i => i.id !== productId);
      }
    }

    this.playChime("beep");
    this.updateCartBadges();
    this.renderPosCatalog();
    this.renderInventoryCards();
    this.renderCartDrawerItems();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.updateCartBadges();
    this.renderPosCatalog();
    this.renderCartDrawerItems();
  }

  updateCartBadges() {
    const count = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const total = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);

    // Nav cart button
    const navCount = document.getElementById("cart-item-count");
    if (navCount) navCount.textContent = count;
    
    const totalBadge = document.getElementById("cart-total-badge");
    if (totalBadge) {
      if (count > 0) {
        totalBadge.textContent = `₹${total.toLocaleString('en-IN')}`;
        totalBadge.classList.remove("hidden");
      } else {
        totalBadge.classList.add("hidden");
      }
    }

    // Mobile badge
    const mobBadge = document.getElementById("mob-cart-badge");
    if (mobBadge) mobBadge.textContent = count;

    // Floating cart bar (Image 1 style)
    const floatBar = document.getElementById("floating-cart-bar");
    if (floatBar) {
      if (count > 0) {
        floatBar.classList.remove("hidden");
        const countEl = document.getElementById("float-cart-count");
        if (countEl) countEl.textContent = count;
        const itemLabel = document.getElementById("float-cart-item-label");
        if (itemLabel) itemLabel.textContent = count === 1 ? "item in bill cart" : "items in bill cart";
        const totalEl = document.getElementById("float-cart-total");
        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        const badgeNum = document.getElementById("float-cart-badge-number");
        if (badgeNum) badgeNum.textContent = count;
        const btnTotal = document.getElementById("float-cart-btn-total");
        if (btnTotal) btnTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
      } else {
        floatBar.classList.add("hidden");
      }
    }
  }

  openCartDrawer() {
    try {
      this.renderCartDrawerItems();
    } catch (err) {
      console.error("Error in renderCartDrawerItems:", err);
    }
    const modal = document.getElementById("modal-cart");
    if (modal) modal.classList.remove("hidden");
  }

  closeCartDrawer() {
    const modal = document.getElementById("modal-cart");
    if (modal) modal.classList.add("hidden");
  }

  renderCartDrawerItems() {
    const container = document.getElementById("cart-items-container");
    const total = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);

    const subtotalEl = document.getElementById("checkout-subtotal");
    const grandTotalEl = document.getElementById("checkout-grand-total");
    const btnSubmit = document.getElementById("btn-submit-bill");

    if (subtotalEl) subtotalEl.textContent = `₹${total}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${total}`;

    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-theme-muted">
          <div class="text-4xl mb-2">🛒</div>
          <div class="font-bold text-sm text-theme-primary">Your cart is empty</div>
          <div class="text-xs mt-1">Tap "+ Cart" on any product to start a bill.</div>
        </div>
      `;
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.classList.add("opacity-50", "pointer-events-none");
      }
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.classList.remove("opacity-50", "pointer-events-none");
    }

    container.innerHTML = this.cart.map(item => {
      const photoSrc = item.photo && item.photo.trim() ? item.photo : "assets/logo.jpg";
      return `
        <div class="p-3 rounded-2xl bg-theme-card border border-theme-subtle flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-11 h-11 rounded-xl bg-theme-surface flex items-center justify-center overflow-hidden border border-theme-subtle shrink-0">
              <img src="${photoSrc}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.src='assets/logo.jpg'" />
            </div>
            <div class="min-w-0">
              <h5 class="text-xs font-bold text-theme-primary truncate">${item.name}</h5>
              <div class="text-[10px] font-mono text-theme-muted">
                ${item.isFreeGoodie ? `<span class="text-[#fed7aa] font-bold">🎁 Free Goodie (₹0)</span>` : `₹${item.soldPrice} × ${item.quantity} = ₹${item.soldPrice * item.quantity}`}
              </div>
              ${item.canBeFree ? `
                <button type="button" onclick="app.toggleCartGoodie('${item.id}')" class="mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${item.isFreeGoodie ? 'bg-[#e87a24] text-[#0c0a09]' : 'bg-[#e87a24]/15 text-[#fed7aa] hover:bg-[#e87a24]/25'} transition-all">
                  🎁 ${item.isFreeGoodie ? 'Giveaway (₹0)' : 'Mark Free Goodie'}
                </button>
              ` : ''}
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" onclick="app.updateCartQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-theme-surface border border-theme-subtle text-theme-primary font-bold hover:bg-white/5">-</button>
            <span class="font-mono font-bold text-xs px-1 text-theme-accent">${item.quantity}</span>
            <button type="button" onclick="app.updateCartQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-theme-surface border border-theme-subtle text-theme-primary font-bold hover:bg-white/5">+</button>
            <button type="button" onclick="app.removeFromCart('${item.id}')" class="p-1 text-theme-muted hover:text-rose-400 ml-1" title="Remove">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Pre-populate cash tendered with exact total
    const cashInput = document.getElementById("checkout-cash-tendered");
    if (cashInput && !cashInput.value) {
      cashInput.value = total;
    }
    this.calculateChange();

    // If UPI selected, render dynamic QR
    if (this.checkoutPaymentMethod === "upi") {
      this.generateCheckoutUpiQr(total);
    }
  }

  calculateChange() {
    const total = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);
    const cashInput = document.getElementById("checkout-cash-tendered");
    const changeEl = document.getElementById("checkout-cash-change");
    if (!cashInput || !changeEl) return;

    const tendered = Number(cashInput.value) || 0;
    const change = Math.max(0, tendered - total);
    changeEl.textContent = `₹${change.toLocaleString('en-IN')}`;
    changeEl.className = tendered >= total
      ? "font-mono font-black text-emerald-400"
      : "font-mono font-black text-amber-400";
  }

  generateCheckoutUpiQr(amount) {
    const brand = this.getActiveBrand();
    const qrContainer = document.getElementById("checkout-upi-qr-box");
    const vpaLabel = document.getElementById("checkout-upi-vpa-label");
    if (!qrContainer) return;

    const vpa = (brand.upiVpa || "crankypanda@upi").trim();
    if (vpaLabel) vpaLabel.textContent = vpa;

    qrContainer.innerHTML = "";
    const cleanAmt = Math.max(0, Number(amount) || 0);
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(brand.name || 'Cranky Panda')}&am=${cleanAmt}&cu=INR`;

    try {
      if (typeof window.QRCode !== "undefined") {
        new window.QRCode(qrContainer, {
          text: upiUri,
          width: 130,
          height: 130,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M
        });
      } else {
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(upiUri)}" alt="UPI QR" class="w-full h-full object-contain" />`;
      }
    } catch (e) {
      qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(upiUri)}" alt="UPI QR" class="w-full h-full object-contain" />`;
    }
  }

  setCheckoutPayment(method) {
    this.checkoutPaymentMethod = method;
    const btns = ["cash", "upi", "razorpay", "card"];
    btns.forEach(m => {
      const btn = document.getElementById(`pay-btn-${m}`);
      if (!btn) return;
      if (m === method) {
        btn.className = "py-2 px-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border-theme-active bg-[#e87a24]/15 text-theme-primary";
      } else {
        btn.className = "py-2 px-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border-theme-subtle bg-theme-surface text-theme-muted hover:text-theme-primary";
      }
    });

    const cashFields = document.getElementById("checkout-cash-fields");
    const upiFields = document.getElementById("checkout-upi-fields");
    const rzpFields = document.getElementById("checkout-razorpay-fields");
    const cardFields = document.getElementById("checkout-card-fields");

    if (cashFields) cashFields.classList.toggle("hidden", method !== "cash");
    if (upiFields) upiFields.classList.toggle("hidden", method !== "upi");
    if (rzpFields) rzpFields.classList.toggle("hidden", method !== "razorpay");
    if (cardFields) cardFields.classList.toggle("hidden", method !== "card");

    const total = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);

    if (method === "upi") {
      this.generateCheckoutUpiQr(total);
    } else if (method === "razorpay") {
      const brand = this.getActiveBrand();
      const rzpBtnAmt = document.getElementById("rzp-btn-amount");
      if (rzpBtnAmt) rzpBtnAmt.textContent = `₹${total}`;

      const notice = document.getElementById("rzp-checkout-notice");
      const modeBadge = document.getElementById("rzp-badge-mode");
      const key = (brand.razorpayKeyId || "").trim();

      if (key) {
        const isLive = key.startsWith("rzp_live");
        if (modeBadge) {
          modeBadge.textContent = isLive ? "LIVE KEY" : "TEST KEY";
          modeBadge.className = isLive 
            ? "text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-[#e87a24] text-[#0c0a09]"
            : "text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-[#e87a24]/20 text-[#fed7aa] border border-[#e87a24]/40";
        }
        if (notice) {
          notice.innerHTML = `<span class="text-[#fed7aa] font-mono text-[11px]">✓ Key connected: <strong class="text-[#fdf6e7]">${key.slice(0, 10)}••••</strong></span>`;
        }
      } else {
        if (modeBadge) {
          modeBadge.textContent = "KEY NEEDED";
          modeBadge.className = "text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-[#8d7d70] border border-[#2b2420]";
        }
        if (notice) {
          notice.innerHTML = `
            <div class="p-2 rounded-xl bg-[#e87a24]/10 border border-[#e87a24]/25 flex items-center justify-between text-xs gap-2">
              <span class="text-[11px] text-[#fed7aa]">No Key ID entered yet</span>
              <button type="button" onclick="app.openRazorpayQuickConfigModal()" class="px-2.5 py-1 rounded-lg bg-[#e87a24] text-[#0c0a09] font-black text-[10px] shrink-0 active:scale-95">
                ⚡ Add Key
              </button>
            </div>
          `;
        }
      }
    }
  }

  launchRazorpayCheckout() {
    if (this.cart.length === 0) {
      this.showToast("Your cart is empty!", "error");
      return;
    }

    const brand = this.getActiveBrand();
    const key = (brand.razorpayKeyId || "").trim();

    if (!key) {
      this.openRazorpayQuickConfigModal();
      this.showToast("Please enter your Razorpay Key ID to charge payments", "error");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      this.showToast("Razorpay SDK is loading. Check your internet connection.", "error");
      return;
    }

    const totalRevenue = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);
    const amountInPaise = Math.round(totalRevenue * 100);
    const nextBillNumber = `BILL-${1000 + this.bills.length + 1}`;
    const custName = document.getElementById("checkout-customer-name")?.value.trim() || "";
    const custPhone = document.getElementById("checkout-customer-phone")?.value.trim() || "";

    const options = {
      key: key,
      amount: amountInPaise,
      currency: "INR",
      name: brand.name || "Cranky Panda Coffee",
      description: `POS Bill #${nextBillNumber} (${this.cart.length} items)`,
      image: brand.logoIcon && (brand.logoIcon.includes("/") || brand.logoIcon.includes(".")) ? brand.logoIcon : "assets/logo.jpg",
      handler: (response) => {
        console.log("Razorpay payment success:", response);
        const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
        this.finalizeBillPayment("razorpay", paymentId);
      },
      prefill: {
        name: custName,
        contact: custPhone
      },
      notes: {
        bill_number: nextBillNumber,
        booked_by: this.activeStaff
      },
      theme: {
        color: "#e87a24"
      },
      modal: {
        ondismiss: () => {
          this.showToast("Razorpay payment modal closed", "info");
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        this.showToast(`Payment declined: ${response.error.description || 'Cancelled'}`, "error");
      });
      rzpInstance.open();
    } catch (err) {
      console.error("Error opening Razorpay:", err);
      this.showToast(`Razorpay error: ${err.message}`, "error");
    }
  }

  finalizeBillPayment(paymentMethod, paymentRef = "") {
    if (this.cart.length === 0) return;

    const brand = this.getActiveBrand();
    const customerName = document.getElementById("checkout-customer-name")?.value.trim() || "";
    const customerPhone = document.getElementById("checkout-customer-phone")?.value.trim() || "";
    const cardRef = document.getElementById("checkout-card-ref")?.value.trim() || "";

    const totalRevenue = this.cart.reduce((sum, i) => sum + i.quantity * i.soldPrice, 0);
    const totalCost = this.cart.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);
    const totalQty = this.cart.reduce((sum, i) => sum + i.quantity, 0);

    // 1. Deduct Inventory Stock & Sync to Supabase
    this.cart.forEach(cartItem => {
      const prod = this.products.find(p => p.id === cartItem.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - cartItem.quantity);
        if (window.supabaseSync && window.supabaseSync.isConnected) {
          window.supabaseSync.saveProduct(prod, this.activeBrandId);
        }
      }
    });

    // 2. Generate New Bill Record
    const nextBillNumber = `BILL-${1000 + this.bills.length + 1}`;
    const ref = paymentRef || (paymentMethod === "card" ? cardRef : (paymentMethod === "upi" ? "UPI-AUTO-VERIFIED" : ""));

    const newBill = {
      id: "bill-" + Date.now(),
      billNumber: nextBillNumber,
      soldAt: new Date().toISOString(),
      bookedBy: this.activeStaff,
      customerName,
      customerPhone,
      paymentMethod: paymentMethod,
      paymentRef: ref,
      note: paymentMethod === "razorpay" ? "⚡ Razorpay Verified" : "",
      items: JSON.parse(JSON.stringify(this.cart)),
      totalQuantity: totalQty,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost
    };

    this.bills.unshift(newBill);

    // Sync to Supabase Cloud if connected
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveBill(newBill, this.activeBrandId);
    }

    // 3. Clear Cart & Save
    this.cart = [];
    this.saveState();
    this.updateCartBadges();
    this.closeCartDrawer();

    // 4. Feedback & Open Receipt
    this.playChime("success");
    this.showToast(`Bill ${newBill.billNumber} booked for ₹${newBill.totalRevenue}! Payment verified.`);
    this.renderPosCatalog();
    this.renderInventoryCards();
    this.renderLedgerList();
    this.renderClosingSummary();
    this.renderBalanceSheet();

    // Show thermal receipt
    this.openReceiptModal(newBill);
  }

  submitBookBill() {
    if (this.cart.length === 0) return;

    if (this.checkoutPaymentMethod === "razorpay") {
      this.launchRazorpayCheckout();
      return;
    }

    const cardRef = document.getElementById("checkout-card-ref")?.value.trim() || "";
    this.finalizeBillPayment(this.checkoutPaymentMethod, cardRef);
  }

  // --------------------------------------------------------------------------
  // RECEIPT MODAL & THERMAL / PNG EXPORT
  // --------------------------------------------------------------------------
  openReceiptModal(bill) {
    this.activeReceiptBill = bill;
    const brand = this.getActiveBrand();

    document.getElementById("rcpt-store-name").textContent = brand.name;
    document.getElementById("rcpt-store-tagline").textContent = brand.tagline || "Store POS & Inventory Ledger";
    document.getElementById("rcpt-store-phone").textContent = `Contact: ${brand.phone || '+91 98765 43210'}`;

    document.getElementById("rcpt-bill-number").textContent = bill.billNumber;
    document.getElementById("rcpt-date-time").textContent = new Date(bill.soldAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    document.getElementById("rcpt-cashier").textContent = bill.bookedBy || "Staff";

    const custRow = document.getElementById("rcpt-customer-row");
    if (bill.customerName || bill.customerPhone) {
      custRow.classList.remove("hidden");
      document.getElementById("rcpt-customer").textContent = `${bill.customerName || ''} ${bill.customerPhone ? `(${bill.customerPhone})` : ''}`.trim();
    } else {
      custRow.classList.add("hidden");
    }

    const itemsBody = document.getElementById("rcpt-items-body");
    itemsBody.innerHTML = bill.items.map(item => `
      <tr class="py-1">
        <td class="py-1 font-semibold">${item.name}</td>
        <td class="py-1 text-center font-mono">${item.quantity}</td>
        <td class="py-1 text-right font-mono">₹${item.soldPrice}</td>
        <td class="py-1 text-right font-mono font-bold">₹${item.soldPrice * item.quantity}</td>
      </tr>
    `).join('');

    document.getElementById("rcpt-total-qty").textContent = bill.totalQuantity;
    document.getElementById("rcpt-grand-total").textContent = `₹${bill.totalRevenue}`;
    document.getElementById("rcpt-payment-mode").textContent = bill.paymentMethod === "razorpay"
      ? `RAZORPAY (${bill.paymentRef || 'VERIFIED'})`
      : bill.paymentMethod.toUpperCase();

    document.getElementById("modal-receipt").classList.remove("hidden");
  }

  closeReceiptModal() {
    document.getElementById("modal-receipt").classList.add("hidden");
  }

  downloadReceiptImage() {
    const bill = this.activeReceiptBill;
    if (!bill) return;

    const canvas = document.getElementById("receipt-canvas");
    const ctx = canvas.getContext("2d");
    const brand = this.getActiveBrand();

    // High DPI Canvas Drawing
    canvas.width = 600;
    canvas.height = 750 + bill.items.length * 40;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Header
    ctx.fillStyle = "#111827";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(brand.name, 300, 60);

    ctx.fillStyle = "#6b7280";
    ctx.font = "16px sans-serif";
    ctx.fillText(brand.tagline || "Retail Point of Sale", 300, 90);
    ctx.fillText(brand.phone || "", 300, 115);

    // Divider
    ctx.strokeStyle = "#9ca3af";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(30, 140);
    ctx.lineTo(570, 140);
    ctx.stroke();

    // Meta details
    ctx.setLineDash([]);
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "left";
    ctx.fillText(`Bill No:  ${bill.billNumber}`, 40, 175);
    ctx.fillText(`Date:     ${new Date(bill.soldAt).toLocaleString()}`, 40, 205);
    ctx.fillText(`Cashier:  ${bill.bookedBy}`, 40, 235);
    if (bill.customerName) {
      ctx.fillText(`Customer: ${bill.customerName} (${bill.customerPhone || ''})`, 40, 265);
    }

    // Double Divider
    let y = bill.customerName ? 295 : 265;
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(570, y);
    ctx.stroke();

    // Table Header
    y += 35;
    ctx.setLineDash([]);
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "left";
    ctx.fillText("ITEM", 40, y);
    ctx.textAlign = "center";
    ctx.fillText("QTY", 360, y);
    ctx.textAlign = "right";
    ctx.fillText("PRICE", 460, y);
    ctx.fillText("TOTAL", 560, y);

    // Items
    ctx.font = "15px monospace";
    ctx.fillStyle = "#1f2937";
    bill.items.forEach(item => {
      y += 35;
      ctx.textAlign = "left";
      ctx.fillText(item.name.substring(0, 24), 40, y);
      ctx.textAlign = "center";
      ctx.fillText(String(item.quantity), 360, y);
      ctx.textAlign = "right";
      ctx.fillText(`₹${item.soldPrice}`, 460, y);
      ctx.fillText(`₹${item.soldPrice * item.quantity}`, 560, y);
    });

    // Divider
    y += 25;
    ctx.strokeStyle = "#4b5563";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(570, y);
    ctx.stroke();

    // Totals
    y += 40;
    ctx.setLineDash([]);
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#4b5563";
    ctx.textAlign = "left";
    ctx.fillText(`TOTAL ITEMS: ${bill.totalQuantity}`, 40, y);

    y += 45;
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#000000";
    ctx.fillText("AMOUNT PAID:", 40, y);
    ctx.textAlign = "right";
    ctx.fillText(`₹${bill.totalRevenue}`, 560, y);

    y += 35;
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#4b5563";
    ctx.textAlign = "left";
    ctx.fillText(`PAYMENT: ${bill.paymentMethod.toUpperCase()}`, 40, y);

    // Footer
    y += 60;
    ctx.textAlign = "center";
    ctx.font = "italic 16px sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Thank you for supporting our brand!", 300, y);

    // Download trigger
    const link = document.createElement("a");
    link.download = `${bill.billNumber}-receipt.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    this.playChime("beep");
  }

  // --------------------------------------------------------------------------
  // VIEW 2: INVENTORY & STOCK LEDGER (BRAND DASHBOARD)
  // --------------------------------------------------------------------------
  renderInventoryCards() {
    const searchVal = (document.getElementById("inv-search-input")?.value || "").toLowerCase().trim();
    const brand = this.getActiveBrand();
    const now = new Date();

    // 1. Calculate KPI Metrics for the 4 Top Cards (Exact Screenshot Layout)
    const todayBills = this.bills.filter(b => new Date(b.soldAt).toDateString() === now.toDateString());
    const todaySales = todayBills.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
    const todayItems = todayBills.reduce((sum, b) => sum + (b.totalQuantity || 0), 0);
    const todayProfit = todayBills.reduce((sum, b) => sum + (b.totalProfit || 0), 0);
    const netMarginPct = todaySales > 0 ? Math.round((todayProfit / todaySales) * 100) : 0;
    const totalSkus = this.products.length;
    const totalUnits = this.products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const cashSales = todayBills.filter(b => b.paymentMethod === "cash").reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
    const upiSales = todayBills.filter(b => b.paymentMethod === "upi").reduce((sum, b) => sum + (b.totalRevenue || 0), 0);

    // Update Card 1: Today's Sales
    const elSales = document.getElementById("inv-kpi-sales");
    if (elSales) elSales.textContent = `₹${todaySales.toLocaleString('en-IN')}`;
    const elSalesSub = document.getElementById("inv-kpi-sales-sub");
    if (elSalesSub) elSalesSub.textContent = `${todayItems} items • ${todayBills.length} bills`;

    // Update Card 2: Today's Profit (Admin Only vs Masked in Staff Portal)
    const elProfit = document.getElementById("inv-kpi-profit");
    if (elProfit) {
      elProfit.textContent = this.currentPortal === "admin" ? `+₹${todayProfit.toLocaleString('en-IN')}` : "••••••";
    }
    const elProfitSub = document.getElementById("inv-kpi-profit-sub");
    if (elProfitSub) {
      elProfitSub.textContent = this.currentPortal === "admin" ? `${netMarginPct}% net margin` : "Restricted (Admin Only)";
    }

    // Update Card 3: Stall Stock
    const elSkus = document.getElementById("inv-kpi-skus");
    if (elSkus) elSkus.textContent = totalSkus;
    const elUnitsStatus = document.getElementById("inv-kpi-units-status");
    if (elUnitsStatus) {
      if (totalSkus === 0) {
        elUnitsStatus.textContent = "0 Total Units";
      } else {
        const hasLowOrOut = this.products.some(p => (p.stock || 0) <= 5);
        elUnitsStatus.textContent = hasLowOrOut ? `${totalUnits} Total Units` : "Healthy stock";
      }
    }

    // Update Card 4: Today's Payment
    const elCash = document.getElementById("inv-kpi-cash");
    if (elCash) elCash.textContent = `₹${cashSales.toLocaleString('en-IN')}`;
    const elUpi = document.getElementById("inv-kpi-upi");
    if (elUpi) elUpi.textContent = `₹${upiSales.toLocaleString('en-IN')}`;

    const elCountAll = document.getElementById("inv-count-all");
    if (elCountAll) elCountAll.textContent = totalSkus;

    // 2. Render Category Pills (All, General, Merchandise, etc.)
    const categories = ["All"];
    (brand.categories || ["General", "Merchandise"]).forEach(c => {
      if (!categories.includes(c)) categories.push(c);
    });
    this.products.forEach(p => {
      if (p.category && !categories.includes(p.category)) categories.push(p.category);
    });

    const catContainer = document.getElementById("inv-category-pills");
    if (catContainer) {
      catContainer.innerHTML = categories.map(cat => {
        const isSelected = (this.selectedInvCategory || "All") === cat;
        return `
          <button type="button" onclick="app.setInvCategory('${cat}')" class="px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all ${
            isSelected ? 'theme-btn-primary' : 'bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary'
          }">
            ${cat}
          </button>
        `;
      }).join('');
    }

    // 3. Filter Products
    const filtered = this.products.filter(p => {
      const matchCat = (this.selectedInvCategory || "All") === "All" || p.category === this.selectedInvCategory;
      let matchStock = true;
      if (this.selectedStockFilter === "low") matchStock = (p.stock || 0) > 0 && (p.stock || 0) <= 5;
      if (this.selectedStockFilter === "out") matchStock = (p.stock || 0) === 0;

      const matchSearch = !searchVal || 
        (p.name && p.name.toLowerCase().includes(searchVal)) || 
        (p.sku && p.sku.toLowerCase().includes(searchVal)) || 
        (p.flavour && p.flavour.toLowerCase().includes(searchVal)) ||
        (p.material && p.material.toLowerCase().includes(searchVal)) ||
        (p.category && p.category.toLowerCase().includes(searchVal));

      return matchCat && matchStock && matchSearch;
    });

    const grid = document.getElementById("inv-product-grid");
    const emptyState = document.getElementById("inv-empty-state");

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    grid.innerHTML = filtered.map(p => this.renderProductCardHtml(p, "inventory")).join('');
  }

  // Alias for backward compatibility
  renderInventoryTable() {
    this.renderInventoryCards();
  }

  setStockFilter(filter) {
    this.selectedStockFilter = filter;
    ["all", "low", "out"].forEach(f => {
      const btn = document.getElementById(`filter-stock-${f}`);
      if (btn) {
        if (f === filter) {
          btn.className = "px-3 py-1.5 rounded-lg font-bold bg-theme-elevated text-theme-primary transition-all";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-theme-muted hover:text-theme-primary transition-all";
        }
      }
    });
    this.renderInventoryCards();
  }

  setInvCategory(cat) {
    this.selectedInvCategory = cat;
    this.renderInventoryCards();
  }

  refreshInventoryStock() {
    this.renderInventoryCards();
    this.renderPosCatalog();
    this.playChime("beep");
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      this.syncWithSupabase();
    }
  }

  // --------------------------------------------------------------------------
  // ADD PRODUCT MODAL
  // --------------------------------------------------------------------------
  
  // ==========================================================================
  // QUICK SINGLE SELL MODAL (⚡ button)
  // ==========================================================================
  openSingleSellModal(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;

    if ((prod.stock || 0) <= 0) {
      alert(`"${prod.name}" is sold out. Please add stock before selling.`);
      return;
    }

    this.singleSellProduct = prod;
    this.singleSellPaymentMethod = "cash";

    const idInput = document.getElementById("single-sell-prod-id");
    if (idInput) idInput.value = prod.id;
    const titleEl = document.getElementById("single-sell-title");
    if (titleEl) titleEl.textContent = prod.name;
    const catBadge = document.getElementById("single-sell-cat-badge");
    if (catBadge) catBadge.textContent = prod.category || "General";
    const stockBadge = document.getElementById("single-sell-stock-badge");
    if (stockBadge) stockBadge.textContent = `${prod.stock} in stock`;
    const floorLabel = document.getElementById("single-sell-floor-label");
    if (floorLabel) floorLabel.textContent = `Floor Limit: ₹${prod.floorPrice || 0}`;

    const qtyInput = document.getElementById("single-sell-qty");
    if (qtyInput) qtyInput.value = "1";

    const priceInput = document.getElementById("single-sell-price");
    if (priceInput) priceInput.value = prod.salePrice || prod.quotedPrice || prod.floorPrice || 0;

    const nameInput = document.getElementById("single-sell-cust-name");
    if (nameInput) nameInput.value = "";
    const phoneInput = document.getElementById("single-sell-cust-phone");
    if (phoneInput) phoneInput.value = "";

    this.setSingleSellPayment("cash");
    this.recalculateSingleSell();

    document.getElementById("modal-single-sell")?.classList.remove("hidden");
  }

  closeSingleSellModal() {
    document.getElementById("modal-single-sell")?.classList.add("hidden");
    this.singleSellProduct = null;
  }

  stepSingleSellQty(delta) {
    const qtyInput = document.getElementById("single-sell-qty");
    if (!qtyInput || !this.singleSellProduct) return;
    let qty = (parseInt(qtyInput.value, 10) || 1) + delta;
    qty = Math.max(1, Math.min(this.singleSellProduct.stock || 1, qty));
    qtyInput.value = qty;
    this.recalculateSingleSell();
  }

  setSingleSellPayment(method) {
    this.singleSellPaymentMethod = method;
    const btnCash = document.getElementById("single-pay-cash");
    const btnUpi = document.getElementById("single-pay-upi");
    const btnRzp = document.getElementById("single-pay-razorpay");

    const activeCls = "py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-[#e87a24]/50 bg-[#e87a24]/15 text-[#fed7aa] shadow-sm";
    const inactiveCls = "py-2.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-[#2b2420] bg-[#12100e] text-[#8d7d70] hover:text-[#fdf6e7]";

    if (btnCash) btnCash.className = method === "cash" ? activeCls : inactiveCls;
    if (btnUpi) btnUpi.className = method === "upi" ? activeCls : inactiveCls;
    if (btnRzp) btnRzp.className = method === "razorpay" ? activeCls : inactiveCls;
  }

  recalculateSingleSell() {
    if (!this.singleSellProduct) return;
    const qty = parseInt(document.getElementById("single-sell-qty")?.value, 10) || 1;
    const price = parseFloat(document.getElementById("single-sell-price")?.value) || 0;
    const total = qty * price;

    const totalEl = document.getElementById("single-sell-total");
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

    const floor = this.singleSellProduct.floorPrice || 0;
    const warnEl = document.getElementById("single-sell-floor-warn");
    if (warnEl) {
      if (price < floor && price > 0) {
        warnEl.classList.remove("hidden");
      } else {
        warnEl.classList.add("hidden");
      }
    }
  }

  handleCommitSingleSell(e) {
    e.preventDefault();
    const prod = this.singleSellProduct;
    if (!prod) return;

    const qty = parseInt(document.getElementById("single-sell-qty")?.value, 10) || 1;
    const price = parseFloat(document.getElementById("single-sell-price")?.value) || 0;
    const custName = document.getElementById("single-sell-cust-name")?.value.trim() || "";
    const custPhone = document.getElementById("single-sell-cust-phone")?.value.trim() || "";

    if (qty > (prod.stock || 0)) {
      alert(`Cannot sell ${qty} units. Only ${prod.stock} available in stock!`);
      return;
    }

    if (this.singleSellPaymentMethod === "razorpay") {
      const brand = this.getActiveBrand();
      const key = (brand.razorpayKeyId || "").trim();

      if (!key) {
        this.openRazorpayQuickConfigModal();
        this.showToast("Please enter your Razorpay Key ID first", "error");
        return;
      }

      if (typeof window.Razorpay === "undefined") {
        this.showToast("Razorpay SDK is loading. Check internet connection.", "error");
        return;
      }

      const totalRevenue = qty * price;
      const options = {
        key: key,
        amount: Math.round(totalRevenue * 100),
        currency: "INR",
        name: brand.name || "Cranky Panda Coffee",
        description: `${prod.name} (${qty} units)`,
        image: brand.logoIcon && (brand.logoIcon.includes("/") || brand.logoIcon.includes(".")) ? brand.logoIcon : "assets/logo.jpg",
        handler: (response) => {
          this.executeSingleSellCommit(prod, qty, price, custName, custPhone, "razorpay", response.razorpay_payment_id);
        },
        prefill: {
          name: custName,
          contact: custPhone
        },
        theme: { color: "#e87a24" },
        modal: {
          ondismiss: () => {
            this.showToast("Razorpay payment cancelled", "info");
          }
        }
      };

      try {
        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      } catch (err) {
        this.showToast(`Razorpay error: ${err.message}`, "error");
      }
      return;
    }

    this.executeSingleSellCommit(prod, qty, price, custName, custPhone, this.singleSellPaymentMethod, this.singleSellPaymentMethod === "upi" ? "UPI-DIRECT-SALE" : "");
  }

  executeSingleSellCommit(prod, qty, price, custName, custPhone, paymentMethod, paymentRef = "") {
    // 1. Deduct stock
    prod.stock = Math.max(0, prod.stock - qty);
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveProduct(prod, this.activeBrandId);
    }

    // 2. Create bill record
    const totalRevenue = qty * price;
    const totalCost = qty * (prod.costPrice || 0);
    const nextBillNumber = `BILL-${1000 + this.bills.length + 1}`;

    const newBill = {
      id: "bill-" + Date.now(),
      billNumber: nextBillNumber,
      soldAt: new Date().toISOString(),
      bookedBy: this.activeStaff,
      customerName: custName,
      customerPhone: custPhone,
      paymentMethod: paymentMethod,
      paymentRef: paymentRef,
      note: paymentMethod === "razorpay" ? "⚡ Razorpay Verified" : "Single Sell ⚡",
      items: [
        {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          material: prod.flavour || prod.material,
          soldPrice: price,
          costPrice: prod.costPrice || 0,
          quantity: qty,
          photo: prod.photo || "assets/logo.jpg"
        }
      ],
      totalQuantity: qty,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost
    };

    this.bills.unshift(newBill);
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveBill(newBill, this.activeBrandId);
    }

    this.saveState();
    this.closeSingleSellModal();
    this.renderPosCatalog();
    this.renderInventoryCards();
    this.renderLedgerList();
    this.renderClosingSummary();
    this.renderBalanceSheet();
    this.playChime("success");
    this.showToast(`Sold ${qty}× ${prod.name} for ₹${totalRevenue}! Bill ${newBill.billNumber}`);
    this.openReceiptModal(newBill);
  }

  // ==========================================================================
  // FLOATING TOAST NOTIFICATION SYSTEM (SOCKADOODLE-EXACT)
  // ==========================================================================
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast-pill ${type === "error" ? "toast-error" : ""}`;
    const icon = type === "error"
      ? `<svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
      : `<svg class="w-4 h-4 text-[#e87a24] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // ==========================================================================
  // PHOTO UPLOAD & CANVAS COMPRESSION (SOCKADOODLE w0-EXACT)
  // ==========================================================================
  async handlePhotoUpload(event, mode = "add") {
    const file = event.target.files?.[0];
    if (!file) return;

    const spinner = document.getElementById(`${mode}-photo-spinner`);
    const icon = document.getElementById(`${mode}-photo-icon`);
    const text = document.getElementById(`${mode}-photo-text`);
    const dropzone = document.getElementById(`${mode}-photo-dropzone`);
    const previewWrap = document.getElementById(`${mode}-photo-preview-wrap`);
    const previewImg = document.getElementById(`${mode}-photo-img`);
    const photoData = document.getElementById(`${mode}-prod-photo-data`);

    try {
      if (spinner) spinner.classList.remove("hidden");
      if (icon) icon.classList.add("hidden");
      if (text) text.textContent = "Compressing photo...";

      const compressed = await compressImage(file, { maxWidth: 640, maxHeight: 640, quality: 0.8 });
      if (photoData) photoData.value = compressed;
      if (previewImg) previewImg.src = compressed;
      if (dropzone) dropzone.classList.add("hidden");
      if (previewWrap) previewWrap.classList.remove("hidden");
    } catch (err) {
      console.warn("Direct read fallback:", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (photoData) photoData.value = reader.result;
        if (previewImg) previewImg.src = reader.result;
        if (dropzone) dropzone.classList.add("hidden");
        if (previewWrap) previewWrap.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    } finally {
      if (spinner) spinner.classList.add("hidden");
      if (icon) icon.classList.remove("hidden");
      if (text) text.textContent = "Take or Upload Product Photo";
    }
  }

  removePhoto(mode = "add") {
    const dropzone = document.getElementById(`${mode}-photo-dropzone`);
    const previewWrap = document.getElementById(`${mode}-photo-preview-wrap`);
    const previewImg = document.getElementById(`${mode}-photo-img`);
    const photoData = document.getElementById(`${mode}-prod-photo-data`);
    const fileInput = document.getElementById(`${mode}-prod-file`);

    if (photoData) photoData.value = "";
    if (previewImg) previewImg.src = "";
    if (fileInput) fileInput.value = "";
    if (previewWrap) previewWrap.classList.add("hidden");
    if (dropzone) dropzone.classList.remove("hidden");
  }

  // ==========================================================================
  // MODAL 3: ADD NEW STALL ITEM / SKU (SOCKADOODLE Xm-EXACT)
  // ==========================================================================
  openAddProductModal() {
    this.addSelectedCategory = "General";
    this.addSelectedFlavour = "Belgium Chocolate";

    // Reset error
    const errEl = document.getElementById("add-prod-error");
    if (errEl) errEl.classList.add("hidden");

    // Reset photo
    this.removePhoto("add");

    // Render category & flavour pills
    this.renderAddCategoryPills();
    this.renderAddFlavourPills();

    // Reset input fields
    const nameEl = document.getElementById("add-prod-name");
    if (nameEl) nameEl.value = "";
    const canBeFree = document.getElementById("add-prod-can-be-free");
    if (canBeFree) canBeFree.checked = false;
    const costEl = document.getElementById("add-prod-cost");
    if (costEl) costEl.value = "";
    const floorEl = document.getElementById("add-prod-floor");
    if (floorEl) floorEl.value = "";
    const quotedEl = document.getElementById("add-prod-quoted");
    if (quotedEl) quotedEl.value = "";
    const stockEl = document.getElementById("add-prod-stock");
    if (stockEl) stockEl.value = "0"; // Strict Zero Data default
    const notesEl = document.getElementById("add-prod-notes");
    if (notesEl) notesEl.value = "";

    // Generate fresh SKU
    this.generateRandomSku("add");

    // Hide profit preview initially
    const profitBox = document.getElementById("add-profit-preview");
    if (profitBox) profitBox.classList.add("hidden");

    // Show modal
    document.getElementById("modal-add-product")?.classList.remove("hidden");
  }

  closeAddProductModal() {
    document.getElementById("modal-add-product")?.classList.add("hidden");
  }

  renderAddCategoryPills() {
    const brand = this.getActiveBrand();
    const categories = brand.categories || ["General", "Merchandise"];
    const container = document.getElementById("add-category-pills");
    if (!container) return;

    container.innerHTML = categories.map(cat => {
      const isSelected = this.addSelectedCategory === cat;
      const activeClass = isSelected
        ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
        : "bg-zinc-950 border border-[#2b2420] text-[#d6c5b0] hover:text-[#fdf6e7]";
      return `<button type="button" onclick="app.selectAddCategory('${cat}')" class="px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${activeClass}">${cat}</button>`;
    }).join("");

    const hiddenCat = document.getElementById("add-prod-category");
    if (hiddenCat) hiddenCat.value = this.addSelectedCategory;
  }

  selectAddCategory(cat) {
    this.addSelectedCategory = cat;
    this.renderAddCategoryPills();
  }

  renderAddFlavourPills() {
    const container = document.getElementById("add-flavour-pills");
    if (!container) return;

    const flavours = [...DEFAULT_COFFEE_FLAVOURS];
    const isCustom = this.addSelectedFlavour && !flavours.includes(this.addSelectedFlavour);

    let html = flavours.map(flv => {
      const isSelected = this.addSelectedFlavour === flv;
      const activeClass = isSelected
        ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
        : "bg-[#181412] border border-[#2b2420] text-[#d6c5b0] hover:border-[#443831]";
      return `<button type="button" onclick="app.selectAddFlavour('${flv}')" class="py-1.5 px-3 rounded-xl text-center transition-all text-xs font-bold ${activeClass}">${flv}</button>`;
    }).join("");

    // Custom button
    const customActiveClass = isCustom
      ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
      : "bg-[#181412] border border-[#2b2420] text-[#8d7d70] hover:text-[#fdf6e7]";
    html += `<button type="button" onclick="app.toggleAddCustomFlavour()" class="py-1.5 px-3 rounded-xl text-center transition-all text-xs font-semibold ${customActiveClass}">+ Custom</button>`;

    container.innerHTML = html;

    const customInput = document.getElementById("add-custom-flavour-input");
    if (customInput) {
      if (isCustom) {
        customInput.classList.remove("hidden");
        customInput.value = this.addSelectedFlavour;
      } else {
        customInput.classList.add("hidden");
      }
    }

    const hiddenFlv = document.getElementById("add-prod-flavour");
    if (hiddenFlv) hiddenFlv.value = this.addSelectedFlavour;
  }

  selectAddFlavour(flv) {
    this.addSelectedFlavour = flv;
    this.renderAddFlavourPills();
  }

  toggleAddCustomFlavour() {
    if (DEFAULT_COFFEE_FLAVOURS.includes(this.addSelectedFlavour)) {
      this.addSelectedFlavour = "French Vanilla";
    }
    this.renderAddFlavourPills();
    const customInput = document.getElementById("add-custom-flavour-input");
    if (customInput) {
      customInput.focus();
    }
  }

  setAddCustomFlavour(val) {
    this.addSelectedFlavour = val.trim();
    const hiddenFlv = document.getElementById("add-prod-flavour");
    if (hiddenFlv) hiddenFlv.value = this.addSelectedFlavour;
  }

  recalculateAddProfitPreview() {
    const cost = parseFloat(document.getElementById("add-prod-cost")?.value) || 0;
    const floor = parseFloat(document.getElementById("add-prod-floor")?.value) || 0;
    const quoted = parseFloat(document.getElementById("add-prod-quoted")?.value) || 0;
    const previewBox = document.getElementById("add-profit-preview");
    const saleLabel = document.getElementById("add-sale-profit-label");
    const floorLabel = document.getElementById("add-floor-profit-label");

    if (cost > 0 && quoted > 0) {
      previewBox?.classList.remove("hidden");
      const saleProfit = quoted - cost;
      const salePct = quoted > 0 ? Math.round((saleProfit / quoted) * 100) : 0;
      const floorProfit = floor - cost;
      const floorPct = floor > 0 ? Math.round((floorProfit / floor) * 100) : 0;

      if (saleLabel) {
        saleLabel.innerHTML = `Sale Profit: <strong class="text-[#e87a24]">+₹${saleProfit.toLocaleString('en-IN')} (${salePct}%)</strong>`;
      }
      if (floorLabel) {
        floorLabel.innerHTML = `Floor Profit: <strong class="text-amber-400">+₹${floorProfit.toLocaleString('en-IN')} (${floorPct}%)</strong>`;
      }
    } else {
      previewBox?.classList.add("hidden");
    }
  }

  generateRandomSku(mode = "add") {
    const prefixes = ["CP", "ROAST", "GRIND", "STALL"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const sku = `${prefix}-${num}`;
    const input = document.getElementById(`${mode}-prod-sku`);
    if (input) input.value = sku;
  }

  async handleSaveProduct(e) {
    e.preventDefault();
    const errBox = document.getElementById("add-prod-error");
    const errMsg = document.getElementById("add-prod-error-msg");

    const name = document.getElementById("add-prod-name")?.value.trim();
    if (!name) {
      if (errBox && errMsg) {
        errMsg.textContent = "Please provide an item name";
        errBox.classList.remove("hidden");
      }
      return;
    }

    const costPrice = parseFloat(document.getElementById("add-prod-cost")?.value);
    const floorPrice = parseFloat(document.getElementById("add-prod-floor")?.value);
    const quotedPrice = parseFloat(document.getElementById("add-prod-quoted")?.value);

    if (isNaN(costPrice) || isNaN(floorPrice) || isNaN(quotedPrice)) {
      if (errBox && errMsg) {
        errMsg.textContent = "Please provide all three prices (Cost, Floor, and Quoted Sale Price)";
        errBox.classList.remove("hidden");
      }
      return;
    }

    const sku = (document.getElementById("add-prod-sku")?.value.trim() || `CP-${Date.now().toString().slice(-4)}`).toUpperCase();
    const category = this.addSelectedCategory || "General";
    const flavour = this.addSelectedFlavour || "Classic Roast";
    const canBeFree = !!document.getElementById("add-prod-can-be-free")?.checked;
    const stock = Math.max(0, parseInt(document.getElementById("add-prod-stock")?.value, 10) || 0);
    const notes = document.getElementById("add-prod-notes")?.value.trim() || "";
    const photo = document.getElementById("add-prod-photo-data")?.value.trim() || "assets/logo.jpg";

    const newProd = {
      id: "prod-" + Date.now(),
      name,
      sku,
      category,
      flavour,
      material: flavour,
      canBeFree,
      costPrice,
      floorPrice,
      salePrice: quotedPrice, // Quoted Price is default sale price
      quotedPrice,
      stock,
      notes,
      photo,
      barcode: "890" + Math.floor(100000000 + Math.random() * 900000000)
    };

    this.products.unshift(newProd);

    // Sync to Supabase Cloud
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveProduct(newProd, this.activeBrandId);
    }

    this.saveState();
    this.closeAddProductModal();
    this.renderInventoryCards();
    this.renderPosCatalog();
    this.playChime("success");
    this.showToast(`Added SKU "${newProd.name}" (${newProd.sku})!`);
  }

  // ==========================================================================
  // MODAL 3B: EDIT SKU & DIRECT INVENTORY STOCK (SOCKADOODLE lp-EXACT)
  // ==========================================================================
  openEditProductModal(productId) {
    const prod = this.products.find(p => p.id === productId);
    if (!prod) return;

    this.editSelectedCategory = prod.category || "General";
    this.editSelectedFlavour = prod.material || prod.flavour || "Belgium Chocolate";

    const titleEl = document.getElementById("edit-prod-title");
    if (titleEl) titleEl.textContent = prod.name;

    const idEl = document.getElementById("edit-prod-id");
    if (idEl) idEl.value = prod.id;

    const errBox = document.getElementById("edit-prod-error");
    if (errBox) errBox.classList.add("hidden");

    // Setup Photo
    const previewWrap = document.getElementById("edit-photo-preview-wrap");
    const previewImg = document.getElementById("edit-photo-img");
    const dropzone = document.getElementById("edit-photo-dropzone");
    const photoData = document.getElementById("edit-prod-photo-data");

    if (prod.photo && prod.photo !== "assets/logo.jpg") {
      if (previewImg) previewImg.src = prod.photo;
      if (photoData) photoData.value = prod.photo;
      previewWrap?.classList.remove("hidden");
      dropzone?.classList.add("hidden");
    } else {
      this.removePhoto("edit");
    }

    // Render Pills
    this.renderEditCategoryPills();
    this.renderEditFlavourPills();

    // Fill fields
    const nameEl = document.getElementById("edit-prod-name");
    if (nameEl) nameEl.value = prod.name;
    const skuEl = document.getElementById("edit-prod-sku");
    if (skuEl) skuEl.value = prod.sku;
    const canBeFree = document.getElementById("edit-prod-can-be-free");
    if (canBeFree) canBeFree.checked = !!prod.canBeFree;

    const costEl = document.getElementById("edit-prod-cost");
    if (costEl) costEl.value = prod.costPrice || "";
    const floorEl = document.getElementById("edit-prod-floor");
    if (floorEl) floorEl.value = prod.floorPrice || "";
    const quotedEl = document.getElementById("edit-prod-quoted");
    if (quotedEl) quotedEl.value = prod.salePrice || prod.quotedPrice || "";

    const stockEl = document.getElementById("edit-prod-stock");
    if (stockEl) stockEl.value = prod.stock || 0;

    const notesEl = document.getElementById("edit-prod-notes");
    if (notesEl) notesEl.value = prod.notes || "";

    this.recalculateEditProfitPreview();

    document.getElementById("modal-edit-product")?.classList.remove("hidden");
  }

  closeEditProductModal() {
    document.getElementById("modal-edit-product")?.classList.add("hidden");
  }

  renderEditCategoryPills() {
    const brand = this.getActiveBrand();
    const categories = brand.categories || ["General", "Merchandise"];
    const container = document.getElementById("edit-category-pills");
    if (!container) return;

    container.innerHTML = categories.map(cat => {
      const isSelected = this.editSelectedCategory === cat;
      const activeClass = isSelected
        ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
        : "bg-zinc-950 border border-[#2b2420] text-[#d6c5b0] hover:text-[#fdf6e7]";
      return `<button type="button" onclick="app.selectEditCategory('${cat}')" class="px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${activeClass}">${cat}</button>`;
    }).join("");

    const hiddenCat = document.getElementById("edit-prod-category");
    if (hiddenCat) hiddenCat.value = this.editSelectedCategory;
  }

  selectEditCategory(cat) {
    this.editSelectedCategory = cat;
    this.renderEditCategoryPills();
  }

  renderEditFlavourPills() {
    const container = document.getElementById("edit-flavour-pills");
    if (!container) return;

    const flavours = [...DEFAULT_COFFEE_FLAVOURS];
    const isCustom = this.editSelectedFlavour && !flavours.includes(this.editSelectedFlavour);

    let html = flavours.map(flv => {
      const isSelected = this.editSelectedFlavour === flv;
      const activeClass = isSelected
        ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
        : "bg-[#181412] border border-[#2b2420] text-[#d6c5b0] hover:border-[#443831]";
      return `<button type="button" onclick="app.selectEditFlavour('${flv}')" class="py-1.5 px-3 rounded-xl text-center transition-all text-xs font-bold ${activeClass}">${flv}</button>`;
    }).join("");

    const customActiveClass = isCustom
      ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-md shadow-[#e87a24]/20"
      : "bg-[#181412] border border-[#2b2420] text-[#8d7d70] hover:text-[#fdf6e7]";
    html += `<button type="button" onclick="app.toggleEditCustomFlavour()" class="py-1.5 px-3 rounded-xl text-center transition-all text-xs font-semibold ${customActiveClass}">+ Custom</button>`;

    container.innerHTML = html;

    const customInput = document.getElementById("edit-custom-flavour-input");
    if (customInput) {
      if (isCustom) {
        customInput.classList.remove("hidden");
        customInput.value = this.editSelectedFlavour;
      } else {
        customInput.classList.add("hidden");
      }
    }

    const hiddenFlv = document.getElementById("edit-prod-flavour");
    if (hiddenFlv) hiddenFlv.value = this.editSelectedFlavour;
  }

  selectEditFlavour(flv) {
    this.editSelectedFlavour = flv;
    this.renderEditFlavourPills();
  }

  toggleEditCustomFlavour() {
    if (DEFAULT_COFFEE_FLAVOURS.includes(this.editSelectedFlavour)) {
      this.editSelectedFlavour = "French Vanilla";
    }
    this.renderEditFlavourPills();
    const customInput = document.getElementById("edit-custom-flavour-input");
    if (customInput) customInput.focus();
  }

  setEditCustomFlavour(val) {
    this.editSelectedFlavour = val.trim();
    const hiddenFlv = document.getElementById("edit-prod-flavour");
    if (hiddenFlv) hiddenFlv.value = this.editSelectedFlavour;
  }

  recalculateEditProfitPreview() {
    const cost = parseFloat(document.getElementById("edit-prod-cost")?.value) || 0;
    const floor = parseFloat(document.getElementById("edit-prod-floor")?.value) || 0;
    const quoted = parseFloat(document.getElementById("edit-prod-quoted")?.value) || 0;
    const previewBox = document.getElementById("edit-profit-preview");
    const saleLabel = document.getElementById("edit-sale-profit-label");
    const floorLabel = document.getElementById("edit-floor-profit-label");

    if (cost > 0 && quoted > 0) {
      previewBox?.classList.remove("hidden");
      const saleProfit = quoted - cost;
      const salePct = quoted > 0 ? Math.round((saleProfit / quoted) * 100) : 0;
      const floorProfit = floor - cost;
      const floorPct = floor > 0 ? Math.round((floorProfit / floor) * 100) : 0;

      if (saleLabel) {
        saleLabel.innerHTML = `Sale Profit: <strong class="text-[#e87a24]">+₹${saleProfit.toLocaleString('en-IN')} (${salePct}%)</strong>`;
      }
      if (floorLabel) {
        floorLabel.innerHTML = `Floor Profit: <strong class="text-amber-400">+₹${floorProfit.toLocaleString('en-IN')} (${floorPct}%)</strong>`;
      }
    } else {
      previewBox?.classList.add("hidden");
    }
  }

  async handleSaveEditProduct(e) {
    e.preventDefault();
    const id = document.getElementById("edit-prod-id")?.value;
    const prod = this.products.find(p => p.id === id);
    if (!prod) return;

    const errBox = document.getElementById("edit-prod-error");
    const errMsg = document.getElementById("edit-prod-error-msg");

    const name = document.getElementById("edit-prod-name")?.value.trim();
    const sku = (document.getElementById("edit-prod-sku")?.value.trim() || prod.sku).toUpperCase();
    const costPrice = parseFloat(document.getElementById("edit-prod-cost")?.value);
    const floorPrice = parseFloat(document.getElementById("edit-prod-floor")?.value);
    const salePrice = parseFloat(document.getElementById("edit-prod-quoted")?.value);
    const stock = Math.max(0, parseInt(document.getElementById("edit-prod-stock")?.value, 10) || 0);

    if (!name || isNaN(costPrice) || isNaN(floorPrice) || isNaN(salePrice)) {
      if (errBox && errMsg) {
        errMsg.textContent = "Please provide valid numbers for all 3 prices and item name";
        errBox.classList.remove("hidden");
      }
      return;
    }

    const photo = document.getElementById("edit-prod-photo-data")?.value.trim() || prod.photo || "assets/logo.jpg";
    const canBeFree = !!document.getElementById("edit-prod-can-be-free")?.checked;
    const notes = document.getElementById("edit-prod-notes")?.value.trim() || "";

    prod.name = name;
    prod.sku = sku;
    prod.category = this.editSelectedCategory || prod.category;
    prod.flavour = this.editSelectedFlavour || prod.flavour;
    prod.material = this.editSelectedFlavour || prod.material;
    prod.costPrice = costPrice;
    prod.floorPrice = floorPrice;
    prod.salePrice = salePrice;
    prod.quotedPrice = salePrice;
    prod.stock = stock;
    prod.photo = photo;
    prod.canBeFree = canBeFree;
    prod.notes = notes;

    // Sync to Supabase
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveProduct(prod, this.activeBrandId);
    }

    this.saveState();
    this.closeEditProductModal();
    this.renderInventoryCards();
    this.renderPosCatalog();
    this.playChime("success");
    this.showToast(`Updated SKU "${prod.name}"!`);
  }

  handleDeleteProductFromModal() {
    const id = document.getElementById("edit-prod-id")?.value;
    const prod = this.products.find(p => p.id === id);
    if (!prod) return;

    if (confirm(`Are you sure you want to delete "${prod.name}" (${prod.sku})? This product will be removed from Inventory and POS Book.`)) {
      this.products = this.products.filter(p => p.id !== id);
      this.cart = this.cart.filter(i => i.id !== id);

      if (window.supabaseSync && window.supabaseSync.isConnected) {
        window.supabaseSync.deleteProduct(id);
      }

      this.saveState();
      this.closeEditProductModal();
      this.renderInventoryCards();
      this.renderPosCatalog();
      this.playChime("beep");
      this.showToast(`Deleted SKU "${prod.name}"`, "error");
    }
  }

  // ==========================================================================
  // MODAL 4: 3-MODE STOCK ADJUSTMENT MODAL (SOCKADOODLE tp/ep-EXACT)
  // ==========================================================================
  openStockAdjustmentModal(productId = null, initialMode = "reduce") {
    if (this.products.length === 0) {
      alert("No products in catalog yet. Please click '+ Add Item' first.");
      return;
    }

    const prod = productId ? this.products.find(p => p.id === productId) : this.products[0];
    if (!prod) return;

    this.currentAdjustProduct = prod;
    this.adjustMode = initialMode;

    const idInput = document.getElementById("adj-product-id");
    if (idInput) idInput.value = prod.id;

    const header = document.getElementById("adj-product-header");
    if (header) header.textContent = `${prod.name} (${prod.sku || "SKU"})`;

    const errBox = document.getElementById("adj-error-banner");
    if (errBox) errBox.classList.add("hidden");

    const qtyInput = document.getElementById("adj-qty-input");
    if (qtyInput) qtyInput.value = "1";

    this.setAdjustMode(initialMode);

    document.getElementById("modal-adjust-stock")?.classList.remove("hidden");
  }

  closeStockAdjustmentModal() {
    document.getElementById("modal-adjust-stock")?.classList.add("hidden");
    this.currentAdjustProduct = null;
  }

  setAdjustMode(mode) {
    this.adjustMode = mode;
    const hiddenMode = document.getElementById("adj-mode");
    if (hiddenMode) hiddenMode.value = mode;

    // Update Tab Styles
    const tabReduce = document.getElementById("adj-tab-reduce");
    const tabAdd = document.getElementById("adj-tab-add");
    const tabSet = document.getElementById("adj-tab-set");

    const baseInactive = "text-[#8d7d70] hover:text-[#fdf6e7] border-transparent";
    if (tabReduce) tabReduce.className = `py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${mode === "reduce" ? "bg-[#221c19] text-[#fdf6e7] border border-[#e87a24]/50 font-bold shadow-sm" : baseInactive}`;
    if (tabAdd) tabAdd.className = `py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${mode === "add" ? "bg-[#e87a24] text-[#0c0a09] font-black shadow-sm" : baseInactive}`;
    if (tabSet) tabSet.className = `py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${mode === "set" ? "bg-[#221c19] text-[#fdf6e7] border border-[#e87a24]/50 font-bold shadow-sm" : baseInactive}`;

    // Render Quick Reasons
    const container = document.getElementById("adj-quick-reasons");
    const reasons = STOCK_ADJUST_REASONS[mode] || [];
    if (container) {
      container.innerHTML = reasons.map((r, i) => `
        <button type="button" onclick="app.selectQuickReason('${r}')" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-all text-left">
          ${r}
        </button>
      `).join("");
    }

    // Set default reason
    const reasonInput = document.getElementById("adj-reason-input");
    if (reasonInput) reasonInput.value = reasons[0] || "Stock adjustment";

    this.recalculateAdjustPreview();
  }

  selectQuickReason(reason) {
    const reasonInput = document.getElementById("adj-reason-input");
    if (reasonInput) reasonInput.value = reason;
  }

  recalculateAdjustPreview() {
    if (!this.currentAdjustProduct) return;
    const current = Math.max(0, this.currentAdjustProduct.stock || 0);
    const qty = parseInt(document.getElementById("adj-qty-input")?.value, 10) || 0;

    let result = current;
    let deltaText = "0";
    let deltaClass = "bg-zinc-800 text-zinc-400";

    if (this.adjustMode === "reduce") {
      result = Math.max(0, current - qty);
      deltaText = `-${Math.min(current, qty)}`;
      deltaClass = "bg-rose-500/20 text-rose-300";
    } else if (this.adjustMode === "add") {
      result = current + qty;
      deltaText = `+${qty}`;
      deltaClass = "bg-[#e87a24]/20 text-[#fed7aa]";
    } else if (this.adjustMode === "set") {
      result = Math.max(0, qty);
      const diff = result - current;
      deltaText = diff >= 0 ? `+${diff}` : `${diff}`;
      deltaClass = diff >= 0 ? "bg-[#e87a24]/20 text-[#fed7aa]" : "bg-black/50 text-[#8d7d70] border border-[#443831]";
    }

    const curLabel = document.getElementById("adj-current-stock-label");
    if (curLabel) curLabel.textContent = `${current} units`;

    const newLabel = document.getElementById("adj-new-stock-label");
    if (newLabel) newLabel.textContent = `${result} units`;

    const badge = document.getElementById("adj-delta-badge");
    if (badge) {
      badge.textContent = `(${deltaText})`;
      badge.className = `text-[10px] font-mono px-1.5 py-0.5 rounded-md ${deltaClass}`;
    }
  }

  async handleSaveStockAdjustment(e) {
    e.preventDefault();
    const prod = this.currentAdjustProduct;
    if (!prod) return;

    const errBox = document.getElementById("adj-error-banner");
    const errMsg = document.getElementById("adj-error-msg");
    const current = Math.max(0, prod.stock || 0);
    const qty = parseInt(document.getElementById("adj-qty-input")?.value, 10) || 0;
    const reason = document.getElementById("adj-reason-input")?.value.trim() || "Manual adjustment";

    if (qty <= 0 && this.adjustMode !== "set") {
      if (errBox && errMsg) {
        errMsg.textContent = "Please enter a quantity greater than 0";
        errBox.classList.remove("hidden");
      }
      return;
    }

    if (this.adjustMode === "reduce" && current === 0) {
      if (errBox && errMsg) {
        errMsg.textContent = "Current stock is already 0. Cannot reduce stock below 0.";
        errBox.classList.remove("hidden");
      }
      return;
    }

    let newStock = current;
    let actualDelta = 0;

    if (this.adjustMode === "reduce") {
      const deduction = Math.min(current, qty);
      newStock = current - deduction;
      actualDelta = -deduction;
    } else if (this.adjustMode === "add") {
      newStock = current + qty;
      actualDelta = qty;
    } else if (this.adjustMode === "set") {
      newStock = Math.max(0, qty);
      actualDelta = newStock - current;
    }

    prod.stock = newStock;

    // Sync to Supabase
    if (window.supabaseSync && window.supabaseSync.isConnected) {
      window.supabaseSync.saveProduct(prod, this.activeBrandId);
    }

    this.saveState();
    this.closeStockAdjustmentModal();
    this.renderInventoryCards();
    this.renderPosCatalog();
    if (this.isSkuBreakdownOpen()) {
      this.renderSkuBreakdownList();
    }
    this.playChime("success");
    this.showToast(`Stock updated for ${prod.name}! (${newStock} units now)`);
  }

  // ==========================================================================
  // MODAL 4B: STALL STOCK (PER SKU BREAKDOWN) (SOCKADOODLE Vm-EXACT)
  // ==========================================================================
  isSkuBreakdownOpen() {
    return !document.getElementById("modal-sku-breakdown")?.classList.contains("hidden");
  }

  openSkuBreakdownModal() {
    this.skuBreakdownFilter = "all";
    const searchInput = document.getElementById("bd-search-input");
    if (searchInput) searchInput.value = "";

    this.renderSkuBreakdownList();
    document.getElementById("modal-sku-breakdown")?.classList.remove("hidden");
  }

  closeSkuBreakdownModal() {
    document.getElementById("modal-sku-breakdown")?.classList.add("hidden");
  }

  setSkuBreakdownFilter(filter) {
    this.skuBreakdownFilter = filter;
    ["all", "low", "out", "healthy"].forEach(f => {
      const btn = document.getElementById(`bd-filter-${f}`);
      if (btn) {
        if (f === filter) {
          btn.className = "px-3 py-1 rounded-lg bg-zinc-800 text-zinc-100 font-bold";
        } else {
          btn.className = "px-3 py-1 rounded-lg text-zinc-400 hover:text-zinc-200";
        }
      }
    });
    this.renderSkuBreakdownList();
  }

  renderSkuBreakdownList() {
    const searchVal = (document.getElementById("bd-search-input")?.value || "").toLowerCase().trim();
    const products = this.products;

    // Calculate metrics
    const totalSkus = products.length;
    const healthyCount = products.filter(p => (p.stock || 0) > 5).length;
    const lowCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outCount = products.filter(p => (p.stock || 0) === 0).length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    const elTotal = document.getElementById("bd-total-skus");
    if (elTotal) elTotal.textContent = totalSkus;
    const elHealthy = document.getElementById("bd-healthy-skus");
    if (elHealthy) elHealthy.textContent = healthyCount;
    const elLow = document.getElementById("bd-low-skus");
    if (elLow) elLow.textContent = lowCount;
    const elOut = document.getElementById("bd-out-skus");
    if (elOut) elOut.textContent = outCount;
    const elUnits = document.getElementById("bd-total-units");
    if (elUnits) elUnits.textContent = totalUnits;

    // Filter items
    let filtered = products.filter(p => {
      const stock = p.stock || 0;
      if (this.skuBreakdownFilter === "low" && (stock === 0 || stock > 5)) return false;
      if (this.skuBreakdownFilter === "out" && stock !== 0) return false;
      if (this.skuBreakdownFilter === "healthy" && stock <= 5) return false;

      if (searchVal) {
        const nameMatch = (p.name || "").toLowerCase().includes(searchVal);
        const skuMatch = (p.sku || "").toLowerCase().includes(searchVal);
        const catMatch = (p.category || "").toLowerCase().includes(searchVal);
        const flvMatch = (p.material || p.flavour || "").toLowerCase().includes(searchVal);
        return nameMatch || skuMatch || catMatch || flvMatch;
      }
      return true;
    });

    const body = document.getElementById("bd-sku-table-body");
    if (!body) return;

    if (filtered.length === 0) {
      body.innerHTML = `
        <div class="py-12 text-center text-zinc-500 text-xs">
          ${products.length === 0 ? "No SKUs created yet. Click '+ Add Item' to create products." : "No matching SKUs found."}
        </div>
      `;
      return;
    }

    body.innerHTML = filtered.map(p => {
      const stock = p.stock || 0;
      let stockBadge = "";
      if (stock > 5) {
        stockBadge = `<span class="px-2.5 py-1 rounded-lg bg-[#e87a24]/15 border border-[#e87a24]/30 text-[#fed7aa] font-bold font-mono text-xs">${stock} in stock</span>`;
      } else if (stock > 0) {
        stockBadge = `<span class="px-2.5 py-1 rounded-lg bg-[#e87a24]/25 border border-[#e87a24]/40 text-[#fba758] font-bold font-mono text-xs">${stock} low stock</span>`;
      } else {
        stockBadge = `<span class="px-2.5 py-1 rounded-lg bg-black/50 border border-[#443831] text-[#8d7d70] font-bold font-mono text-xs">0 OUT OF STOCK</span>`;
      }

      // Calculate units sold today for this SKU
      const todaySold = this.bills
        .filter(b => this.isToday(b.soldAt))
        .reduce((sum, b) => {
          const item = (b.items || []).find(it => it.id === p.id);
          return sum + (item ? item.quantity : 0);
        }, 0);

      const photoSrc = p.photo && p.photo.trim() ? p.photo : "assets/logo.jpg";

      return `
        <div class="py-3 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
              <img src="${photoSrc}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='assets/logo.jpg'" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-bold text-zinc-100 truncate">${p.name}</h4>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">${p.category || "General"}</span>
                ${p.material || p.flavour ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">${p.material || p.flavour}</span>` : ""}
              </div>
              <div class="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-0.5">
                <span>SKU: ${p.sku || "N/A"}</span>
                <span>•</span>
                <span>Tag: ₹${p.salePrice || p.quotedPrice || 0}</span>
                <span>•</span>
                <span>Floor: ₹${p.floorPrice || 0}</span>
                <span>•</span>
                <span class="text-zinc-500 font-sans">${todaySold} sold today</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2.5 shrink-0">
            ${stockBadge}
            <button type="button" onclick="app.openStockAdjustmentModal('${p.id}')" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors">
              Adjust Stock
            </button>
          </div>
        </div>
      `;
    }).join("");
  }


  // --------------------------------------------------------------------------
  // VIEW 3: OUT BILLS / SALES LEDGER
  // --------------------------------------------------------------------------
  renderLedgerList() {
    const searchVal = (document.getElementById("ledger-search-input")?.value || "").toLowerCase().trim();
    const timeFilter = document.getElementById("ledger-time-filter")?.value || "all";
    const paymentFilter = document.getElementById("ledger-payment-filter")?.value || "all";

    // Summary metrics
    const totalBills = this.bills.length;
    const totalRevenue = this.bills.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
    const totalUnits = this.bills.reduce((sum, b) => sum + (b.totalQuantity || 0), 0);
    const totalProfit = this.bills.reduce((sum, b) => sum + (b.totalProfit || 0), 0);

    document.getElementById("ledger-kpi-bills").textContent = totalBills;
    document.getElementById("ledger-kpi-revenue").textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById("ledger-kpi-units").textContent = `${totalUnits} pcs`;
    
    const profitEl = document.getElementById("ledger-kpi-profit");
    if (this.isAdminUnlocked) {
      profitEl.textContent = `₹${totalProfit.toLocaleString('en-IN')}`;
      profitEl.className = "text-xl sm:text-2xl font-black font-mono text-purple-400 mt-1";
    } else {
      profitEl.textContent = "••••••";
      profitEl.className = "text-xl sm:text-2xl font-black font-mono text-theme-muted mt-1";
    }

    // Filter Bills
    const now = new Date();
    const filtered = this.bills.filter(b => {
      // Time filter
      const billDate = new Date(b.soldAt);
      if (timeFilter === "today") {
        if (billDate.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === "yesterday") {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        if (billDate.toDateString() !== yest.toDateString()) return false;
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
        if (billDate < weekAgo) return false;
      }

      // Payment filter
      if (paymentFilter !== "all" && b.paymentMethod !== paymentFilter) return false;

      // Search filter
      if (searchVal) {
        const inNum = b.billNumber.toLowerCase().includes(searchVal);
        const inCust = (b.customerName || "").toLowerCase().includes(searchVal) || (b.customerPhone || "").includes(searchVal);
        const inStaff = (b.bookedBy || "").toLowerCase().includes(searchVal);
        const inItems = b.items.some(i => i.name.toLowerCase().includes(searchVal) || i.sku.toLowerCase().includes(searchVal));
        if (!inNum && !inCust && !inStaff && !inItems) return false;
      }

      return true;
    });

    const container = document.getElementById("ledger-bills-container");
    const emptyState = document.getElementById("ledger-empty-state");

    if (filtered.length === 0) {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    container.innerHTML = filtered.map(bill => {
      const methodBadge = {
        cash: 'bg-[#e87a24]/15 text-amber-contrast border border-[#e87a24]/30',
        upi: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
        razorpay: 'bg-[#e87a24] text-[#0c0a09] font-black shadow-sm',
        card: 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
      }[bill.paymentMethod] || 'bg-theme-surface border border-theme-subtle text-theme-secondary';

      return `
        <div class="theme-card p-4 space-y-3">
          <!-- Top Row: Bill No, Time, Cashier, Total -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-3">
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-sm text-theme-primary">${bill.billNumber}</span>
              <span class="text-xs px-2 py-0.5 rounded-lg border font-bold uppercase text-[10px] ${methodBadge}">
                ${bill.paymentMethod === 'razorpay' ? '⚡ RAZORPAY' : bill.paymentMethod}
              </span>
              ${bill.paymentRef ? `<span class="text-[10px] font-mono text-[#8d7d70] bg-black/40 px-1.5 py-0.5 rounded border border-[#2b2420]">${bill.paymentRef}</span>` : ''}
              <span class="text-[11px] text-theme-muted">by <strong>${bill.bookedBy}</strong></span>
              ${bill.customerName ? `<span class="text-[11px] text-theme-secondary font-semibold">• ${bill.customerName}</span>` : ''}
            </div>

            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="font-mono font-black text-base text-[#e87a24]">₹${bill.totalRevenue}</div>
                <div class="text-[10px] text-theme-muted">${new Date(bill.soldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <button onclick="app.openReceiptModal(app.bills.find(b => b.id === '${bill.id}'))" class="px-2.5 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs font-bold text-theme-primary hover:bg-white/5 flex items-center gap-1">
                <span>Receipt</span>
              </button>
              ${this.isAdminUnlocked ? `
                <button onclick="app.cancelBillPrompt('${bill.id}')" class="px-2 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-400 hover:bg-rose-500/20" title="Void sale & return inventory">
                  Void
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Items Row -->
          <div class="space-y-1.5 text-xs">
            ${bill.items.map(item => `
              <div class="flex items-center justify-between text-theme-secondary">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-mono font-bold text-[11px] text-theme-accent">${item.quantity}×</span>
                  <span class="truncate">${item.name}</span>
                  <span class="text-[10px] font-mono text-theme-muted hidden sm:inline">(${item.sku})</span>
                </div>
                <div class="font-mono text-right text-theme-primary font-bold">₹${item.soldPrice * item.quantity}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  cancelBillPrompt(billId) {
    if (!this.isAdminUnlocked) {
      this.handleAdminToggle();
      return;
    }

    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return;

    if (confirm(`Void transaction ${bill.billNumber} for ₹${bill.totalRevenue}? This will restore all ${bill.totalQuantity} items 100% back to stock.`)) {
      // Restore stock
      bill.items.forEach(item => {
        const prod = this.products.find(p => p.id === item.id);
        if (prod) {
          prod.stock += item.quantity;
        }
      });

      this.bills = this.bills.filter(b => b.id !== billId);

      // Sync void to Supabase
      if (window.supabaseSync && window.supabaseSync.isConnected) {
        window.supabaseSync.voidBill(bill, this.activeBrandId);
      }

      this.saveState();
      this.renderPosCatalog();
      this.renderInventoryTable();
      this.renderLedgerList();
      this.renderClosingSummary();
      this.renderBalanceSheet();
      this.playChime("beep");
      alert(`Transaction ${bill.billNumber} voided. Stock returned.`);
    }
  }

  // --------------------------------------------------------------------------
  // VIEW 4: CLOSING & DAILY RECONCILIATION
  // --------------------------------------------------------------------------
  renderClosingSummary() {
    const now = new Date();
    document.getElementById("closing-date-label").textContent = now.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    // Today's sales
    const todayBills = this.bills.filter(b => new Date(b.soldAt).toDateString() === now.toDateString());
    const grossRev = todayBills.reduce((sum, b) => sum + b.totalRevenue, 0);
    const cashRev = todayBills.filter(b => b.paymentMethod === "cash").reduce((sum, b) => sum + b.totalRevenue, 0);
    const digitalRev = grossRev - cashRev;

    document.getElementById("close-today-revenue").textContent = `₹${grossRev.toLocaleString('en-IN')}`;
    document.getElementById("close-today-bills-count").textContent = `${todayBills.length} out bills booked today`;
    document.getElementById("close-cash-revenue").textContent = `₹${cashRev.toLocaleString('en-IN')}`;
    document.getElementById("close-digital-revenue").textContent = `₹${digitalRev.toLocaleString('en-IN')}`;

    // Recalculate cash drawer
    this.recalculateDrawer(cashRev);

    // Top Selling Products Leaderboard
    const prodCounts = {};
    todayBills.forEach(b => {
      b.items.forEach(i => {
        if (!prodCounts[i.name]) prodCounts[i.name] = { qty: 0, rev: 0 };
        prodCounts[i.name].qty += i.quantity;
        prodCounts[i.name].rev += i.soldPrice * i.quantity;
      });
    });

    const sortedProds = Object.entries(prodCounts).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
    const prodContainer = document.getElementById("closing-top-products");
    if (sortedProds.length === 0) {
      prodContainer.innerHTML = `<div class="text-theme-muted text-[11px]">No items sold today yet.</div>`;
    } else {
      prodContainer.innerHTML = sortedProds.map(([name, data], idx) => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-theme-surface border border-theme-subtle">
          <div class="flex items-center gap-2 truncate">
            <span class="font-mono text-xs font-bold text-theme-muted">#${idx + 1}</span>
            <span class="font-bold text-theme-primary truncate">${name}</span>
          </div>
          <div class="text-right shrink-0">
            <span class="font-mono font-black text-theme-accent">${data.qty} pcs</span>
            <span class="text-[10px] text-theme-muted font-mono block">₹${data.rev}</span>
          </div>
        </div>
      `).join('');
    }

    // Floor Staff Performance
    const staffCounts = {};
    todayBills.forEach(b => {
      const staff = b.bookedBy || "Staff";
      if (!staffCounts[staff]) staffCounts[staff] = { bills: 0, rev: 0 };
      staffCounts[staff].bills += 1;
      staffCounts[staff].rev += b.totalRevenue;
    });

    const staffContainer = document.getElementById("closing-cashier-leaderboard");
    const sortedStaff = Object.entries(staffCounts).sort((a, b) => b[1].rev - a[1].rev);
    if (sortedStaff.length === 0) {
      staffContainer.innerHTML = `<div class="text-theme-muted text-[11px]">No staff shifts logged today.</div>`;
    } else {
      staffContainer.innerHTML = sortedStaff.map(([name, data]) => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-theme-surface border border-theme-subtle">
          <div>
            <div class="font-bold text-theme-primary">${name}</div>
            <div class="text-[10px] text-theme-muted">${data.bills} bills booked</div>
          </div>
          <div class="font-mono font-black text-[#e87a24]">
            ₹${data.rev}
          </div>
        </div>
      `).join('');
    }
  }

  recalculateDrawer(cashSalesToday = null) {
    if (cashSalesToday === null) {
      const now = new Date();
      cashSalesToday = this.bills
        .filter(b => new Date(b.soldAt).toDateString() === now.toDateString() && b.paymentMethod === "cash")
        .reduce((sum, b) => sum + b.totalRevenue, 0);
    }

    const floatAmt = parseFloat(document.getElementById("drawer-float-input")?.value) || 0;
    const expenseAmt = parseFloat(document.getElementById("drawer-expense-input")?.value) || 0;
    const countedAmt = parseFloat(document.getElementById("drawer-counted-input")?.value) || 0;

    const expected = floatAmt + cashSalesToday - expenseAmt;
    const diff = countedAmt - expected;

    document.getElementById("drawer-expected-amt").textContent = `₹${expected}`;
    const diffEl = document.getElementById("drawer-variance-amt");
    const badge = document.getElementById("drawer-balance-badge");

    if (countedAmt === 0) {
      diffEl.textContent = `₹0 (Awaiting count)`;
      diffEl.className = "font-mono font-bold text-theme-muted";
      badge.textContent = "Pending Count";
      badge.className = "px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-zinc-800 text-zinc-400";
    } else if (diff === 0) {
      diffEl.textContent = `₹0 (Balanced)`;
      diffEl.className = "font-mono font-bold text-[#e87a24]";
      badge.textContent = "Perfect Match";
      badge.className = "px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-[#e87a24]/20 text-[#fed7aa] border border-[#e87a24]/30";
    } else if (diff > 0) {
      diffEl.textContent = `+₹${diff} (Surplus)`;
      diffEl.className = "font-mono font-bold text-[#fed7aa]";
      badge.textContent = `+₹${diff} Surplus`;
      badge.className = "px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-[#e87a24]/20 text-[#fed7aa] border border-[#e87a24]/30";
    } else {
      diffEl.textContent = `-₹${Math.abs(diff)} (Shortage)`;
      diffEl.className = "font-mono font-bold text-rose-400";
      badge.textContent = `-₹${Math.abs(diff)} Short`;
      badge.className = "px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30";
    }
  }

  exportSalesCsv() {
    let csv = "Bill Number,Date,Time,Cashier,Payment Method,Customer Name,Phone,Item SKU,Item Name,Quantity,Price,Line Total\n";
    this.bills.forEach(b => {
      const d = new Date(b.soldAt);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString();
      b.items.forEach(i => {
        csv += `"${b.billNumber}","${dateStr}","${timeStr}","${b.bookedBy}","${b.paymentMethod}","${b.customerName || ''}","${b.customerPhone || ''}","${i.sku}","${i.name}",${i.quantity},${i.soldPrice},${i.soldPrice * i.quantity}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    this.playChime("beep");
  }

  // --------------------------------------------------------------------------
  // STANDALONE UPI TERMINAL
  // --------------------------------------------------------------------------
  openUpiTerminalModal() {
    const brand = this.getActiveBrand();
    document.getElementById("terminal-store-name").textContent = brand.name;
    document.getElementById("terminal-vpa-label").textContent = brand.upiVpa || "brand@upi";
    
    const qrContainer = document.getElementById("terminal-qr-box");
    qrContainer.innerHTML = "";
    const upiUri = `upi://pay?pa=${encodeURIComponent(brand.upiVpa || 'store@upi')}&pn=${encodeURIComponent(brand.name)}&cu=INR`;

    if (window.QRCode) {
      new QRCode(qrContainer, {
        text: upiUri,
        width: 190,
        height: 190,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(upiUri)}" alt="UPI QR" class="w-full h-full" />`;
    }

    document.getElementById("modal-upi-terminal").classList.remove("hidden");
  }

  closeUpiTerminalModal() {
    document.getElementById("modal-upi-terminal").classList.add("hidden");
  }

  // --------------------------------------------------------------------------
  // BRAND SETTINGS & BACKUP CONSOLE
  // --------------------------------------------------------------------------
  openBrandSettingsModal() {
    const brand = this.getActiveBrand();
    document.getElementById("cfg-brand-name").value = brand.name;
    document.getElementById("cfg-brand-tagline").value = brand.tagline || "";
    document.getElementById("cfg-brand-phone").value = brand.phone || "";
    document.getElementById("cfg-brand-upi").value = brand.upiVpa || "";
    document.getElementById("cfg-currency-symbol").value = brand.currency || "₹ INR";
    document.getElementById("cfg-admin-pin").value = brand.adminPin || "1234";
    document.getElementById("cfg-brand-logo").value = brand.logoIcon || "✨";
    document.getElementById("cfg-categories-input").value = (brand.categories || []).join(", ");

    const rzpInput = document.getElementById("cfg-rzp-key-id");
    if (rzpInput) rzpInput.value = brand.razorpayKeyId || "";
    const rzpToggle = document.getElementById("cfg-rzp-enabled");
    if (rzpToggle) rzpToggle.checked = brand.razorpayEnabled !== false;

    const dropdown = document.getElementById("profile-dropdown");
    if (dropdown) dropdown.classList.add("hidden");

    document.getElementById("modal-brand-settings").classList.remove("hidden");
  }

  closeBrandSettingsModal() {
    document.getElementById("modal-brand-settings").classList.add("hidden");
  }

  handleSaveBrandSettings(e) {
    e.preventDefault();
    const brand = this.getActiveBrand();
    brand.name = document.getElementById("cfg-brand-name").value.trim();
    brand.tagline = document.getElementById("cfg-brand-tagline").value.trim();
    brand.phone = document.getElementById("cfg-brand-phone").value.trim();
    brand.upiVpa = document.getElementById("cfg-brand-upi").value.trim();
    brand.currency = document.getElementById("cfg-currency-symbol").value.trim();
    brand.adminPin = document.getElementById("cfg-admin-pin").value.trim() || "1234";
    brand.logoIcon = document.getElementById("cfg-brand-logo").value.trim() || "✨";

    const rzpInput = document.getElementById("cfg-rzp-key-id");
    if (rzpInput) brand.razorpayKeyId = rzpInput.value.trim();
    const rzpToggle = document.getElementById("cfg-rzp-enabled");
    if (rzpToggle) brand.razorpayEnabled = rzpToggle.checked;
    
    const catRaw = document.getElementById("cfg-categories-input").value.trim();
    if (catRaw) {
      brand.categories = catRaw.split(",").map(c => c.trim()).filter(Boolean);
    }

    this.saveState();
    this.updateBrandHeader();
    this.renderPosCatalog();
    this.renderInventoryTable();
    this.closeBrandSettingsModal();
    this.playChime("success");
    this.showToast("Brand settings updated successfully!");
  }

  // --------------------------------------------------------------------------
  // QUICK RAZORPAY CONFIGURATION MODAL
  // --------------------------------------------------------------------------
  openRazorpayQuickConfigModal() {
    const brand = this.getActiveBrand();
    const input = document.getElementById("quick-rzp-key-id");
    if (input) input.value = brand.razorpayKeyId || "";
    document.getElementById("modal-razorpay-config")?.classList.remove("hidden");
  }

  closeRazorpayConfigModal() {
    document.getElementById("modal-razorpay-config")?.classList.add("hidden");
  }

  handleSaveRazorpayQuickConfig(e) {
    e.preventDefault();
    const brand = this.getActiveBrand();
    const key = (document.getElementById("quick-rzp-key-id")?.value || "").trim();
    brand.razorpayKeyId = key;
    brand.razorpayEnabled = true;

    const cfgInput = document.getElementById("cfg-rzp-key-id");
    if (cfgInput) cfgInput.value = key;
    const cfgToggle = document.getElementById("cfg-rzp-enabled");
    if (cfgToggle) cfgToggle.checked = true;

    this.saveState();
    this.closeRazorpayConfigModal();
    this.playChime("success");
    this.showToast(`Razorpay Key connected: ${key.slice(0, 10)}••••`);

    if (this.checkoutPaymentMethod === "razorpay") {
      this.setCheckoutPayment("razorpay");
    }
  }

  exportDatabaseBackup() {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      brands: this.brands,
      products: this.products,
      bills: this.bills,
      staffList: this.staffList,
      startingCapital: this.startingCapital,
      balanceTransactions: this.balanceTransactions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `brand-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    this.playChime("beep");
  }

  importDatabaseBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.products && parsed.bills) {
          this.products = parsed.products;
          this.bills = parsed.bills;
          if (parsed.brands) this.brands = parsed.brands;
          if (parsed.staffList) this.staffList = parsed.staffList;
          if (parsed.startingCapital !== undefined) this.startingCapital = Number(parsed.startingCapital);
          if (Array.isArray(parsed.balanceTransactions)) this.balanceTransactions = parsed.balanceTransactions;
          this.saveState();
          this.init();
          this.playChime("success");
          alert("Database backup restored successfully!");
        } else {
          alert("Invalid backup JSON format.");
        }
      } catch (err) {
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  }

  resetToDemoData() {
    if (confirm("Reset catalog and reload full demo data? Current changes will be overwritten.")) {
      this.products = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PRODUCTS));
      this.bills = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_BILLS));
      this.startingCapital = 25000;
      this.balanceTransactions = JSON.parse(JSON.stringify(DEFAULT_BALANCE_TRANSACTIONS));
      this.saveState();
      this.init();
      this.closeBrandSettingsModal();
      this.playChime("success");
    }
  }

  // --------------------------------------------------------------------------
  // CASHIER SWITCH MODAL
  // --------------------------------------------------------------------------
  openCashierModal() {
    const dropdown = document.getElementById("profile-dropdown");
    if (dropdown) dropdown.classList.add("hidden");

    const container = document.getElementById("cashier-staff-list");
    container.innerHTML = this.staffList.map(s => {
      const isCurrent = s.name === this.activeStaff;
      return `
        <button type="button" onclick="app.selectCashierStaff('${s.name}')" class="w-full flex items-center justify-between p-2.5 rounded-xl border text-left font-bold transition-all ${
          isCurrent ? 'theme-btn-primary' : 'bg-theme-surface border-theme-subtle text-theme-primary hover:bg-white/5'
        }">
          <div>
            <div>${s.name}</div>
            <div class="text-[10px] font-normal opacity-70">${s.role || 'Cashier'}</div>
          </div>
          ${isCurrent ? '<span>✓ Active</span>' : ''}
        </button>
      `;
    }).join('');

    document.getElementById("modal-cashier").classList.remove("hidden");
  }

  closeCashierModal() {
    document.getElementById("modal-cashier").classList.add("hidden");
  }

  selectCashierStaff(staffName) {
    this.activeStaff = staffName;
    this.saveState();
    this.updateBrandHeader();
    this.closeCashierModal();
    this.playChime("beep");
  }

  addNewStaffMember() {
    const input = document.getElementById("new-staff-name-input");
    const name = input.value.trim();
    if (!name) return;

    this.staffList.push({
      id: "staff-" + Date.now(),
      name,
      role: "Floor Cashier"
    });
    input.value = "";
    this.saveState();
    this.openCashierModal();
    this.playChime("beep");
  }

  // --------------------------------------------------------------------------
  // SUPABASE CLOUD SYNC & REALTIME INTEGRATION
  // --------------------------------------------------------------------------
  initSupabaseSync() {
    if (!window.supabaseSync) return;

    window.supabaseSync.listeners.onProductChange = (payload) => {
      this.handleRealtimeProductChange(payload);
    };

    window.supabaseSync.listeners.onBillChange = (payload) => {
      this.handleRealtimeBillChange(payload);
    };

    window.supabaseSync.listeners.onStatusChange = (connected) => {
      this.updateSupabaseStatusUI(connected);
    };

    // If already connected with saved key, pull live data
    if (window.supabaseSync.isConnected) {
      this.syncWithSupabase();
    }
  }

  async syncWithSupabase() {
    if (!window.supabaseSync || !window.supabaseSync.isConnected) return;
    try {
      console.log("Pulling live data from Supabase...");
      const cloudProds = await window.supabaseSync.fetchProducts(this.activeBrandId);
      if (cloudProds && cloudProds.length > 0) {
        this.products = cloudProds;
      }

      const cloudBills = await window.supabaseSync.fetchBills(this.activeBrandId);
      if (cloudBills) {
        this.bills = cloudBills;
      }

      this.saveState();
      this.renderPosCatalog();
      this.renderInventoryTable();
      this.renderLedgerList();
      this.renderClosingSummary();
      this.renderBalanceSheet();
      console.log("Supabase sync complete.");
    } catch (e) {
      console.warn("Supabase pull error:", e);
    }
  }

  handleRealtimeProductChange(payload) {
    console.log("Supabase Realtime Product Event:", payload.eventType);
    if (payload.eventType === "UPDATE") {
      const updated = payload.new;
      const existing = this.products.find(p => p.id === updated.id);
      if (existing) {
        existing.stock = parseInt(updated.stock, 10);
        existing.floorPrice = parseFloat(updated.floor_price);
        existing.costPrice = parseFloat(updated.cost_price);
        existing.name = updated.name;
        this.saveState();
        this.renderPosCatalog();
        this.renderInventoryTable();
      }
    } else if (payload.eventType === "INSERT") {
      const p = payload.new;
      if (!this.products.some(item => item.id === p.id)) {
        this.products.unshift({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          material: p.material,
          floorPrice: parseFloat(p.floor_price) || 0,
          costPrice: parseFloat(p.cost_price) || 0,
          stock: parseInt(p.stock, 10) || 0,
          photo: p.photo,
          barcode: p.barcode
        });
        this.saveState();
        this.renderPosCatalog();
        this.renderInventoryTable();
      }
    }
  }

  handleRealtimeBillChange(payload) {
    console.log("Supabase Realtime Bill Event:", payload.eventType);
    if (payload.eventType === "INSERT") {
      const b = payload.new;
      if (!this.bills.some(item => item.id === b.id)) {
        this.bills.unshift({
          id: b.id,
          billNumber: b.bill_number,
          soldAt: b.sold_at,
          bookedBy: b.booked_by,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          paymentMethod: b.payment_method,
          paymentRef: b.payment_ref,
          note: b.note,
          totalQuantity: b.total_quantity,
          totalRevenue: parseFloat(b.total_revenue) || 0,
          totalCost: parseFloat(b.total_cost) || 0,
          totalProfit: parseFloat(b.total_profit) || 0,
          items: b.items || []
        });
        this.saveState();
        this.renderLedgerList();
        this.renderClosingSummary();
      }
    }
  }

  openSupabaseModal() {
    const keyInput = document.getElementById("sb-anon-key");
    if (window.supabaseSync && window.supabaseSync.anonKey) {
      keyInput.value = window.supabaseSync.anonKey;
    }
    this.updateSupabaseStatusUI(window.supabaseSync && window.supabaseSync.isConnected);
    document.getElementById("modal-supabase").classList.remove("hidden");
  }

  closeSupabaseModal() {
    document.getElementById("modal-supabase").classList.add("hidden");
  }

  updateSupabaseStatusUI(connected) {
    const label = document.getElementById("sb-status-label");
    const disBtn = document.getElementById("btn-disconnect-sb");
    const pushBtn = document.getElementById("btn-push-sb");

    if (label) {
      if (connected) {
        label.textContent = "Live & Connected";
        label.className = "font-bold text-[#e87a24] font-mono";
        if (disBtn) disBtn.classList.remove("hidden");
        if (pushBtn) pushBtn.classList.remove("opacity-50", "pointer-events-none");
      } else {
        label.textContent = "Not Connected";
        label.className = "font-bold text-amber-400 font-mono";
        if (disBtn) disBtn.classList.add("hidden");
      }
    }
  }

  async handleSaveSupabaseConfig(e) {
    e.preventDefault();
    const anonKey = document.getElementById("sb-anon-key").value.trim();
    if (!anonKey) return;

    if (!window.supabaseSync) return;
    const ok = window.supabaseSync.initClient(anonKey);
    if (ok) {
      // Test fetch
      const test = await window.supabaseSync.fetchProducts(this.activeBrandId);
      if (test !== null) {
        this.playChime("success");
        alert("🎉 Successfully connected to Supabase Cloud Database! Realtime multi-device sync is now active.");
        await this.syncWithSupabase();
        this.closeSupabaseModal();
      } else {
        alert("⚠️ Connected to Supabase, but could not read the 'products' table yet. Make sure you run schema.sql in your Supabase SQL Editor!");
      }
    } else {
      alert("Invalid Supabase anon key or client initialization failed.");
    }
  }

  disconnectSupabase() {
    if (confirm("Disconnect Supabase cloud sync? Dashboard will continue working offline with local storage.")) {
      if (window.supabaseSync) {
        window.supabaseSync.disconnect();
      }
      this.updateSupabaseStatusUI(false);
      this.playChime("beep");
    }
  }

  async pushLocalToSupabase() {
    if (!window.supabaseSync || !window.supabaseSync.isConnected) {
      alert("Please connect your Supabase anon key first.");
      return;
    }

    if (confirm(`Push all ${this.products.length} local products and ${this.brands.length} brand profiles to Supabase?`)) {
      const ok = await window.supabaseSync.pushLocalDataToSupabase(this.brands, this.products, this.bills);
      if (ok) {
        this.playChime("success");
        alert("✅ All local products and brand data successfully pushed to Supabase!");
      } else {
        alert("Failed to push data. Please verify your Supabase tables exist and RLS policies allow insertion.");
      }
    }
  }

  async copySchemaSql() {
    try {
      const res = await fetch("schema.sql");
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      this.playChime("beep");
      alert("📋 Copied schema.sql to clipboard! You can paste and run it in the Supabase SQL Editor.");
    } catch (e) {
      alert("Please open schema.sql from the project directory.");
    }
  }
}

// Instantiate and attach to window
window.app = new StoreLedgerApp();
document.addEventListener("DOMContentLoaded", () => {
  window.app.init();
});

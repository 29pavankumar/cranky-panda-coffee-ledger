/**
 * Supabase Client & Realtime Sync Engine for Store POS & Inventory Ledger
 * Project URL: https://ltaeuvjtnimrfxviadqc.supabase.co
 */

class SupabaseSyncService {
  constructor() {
    this.projectUrl = "https://ltaeuvjtnimrfxviadqc.supabase.co";
    this.anonKey = localStorage.getItem("stall_supabase_anon_key") || window.SUPABASE_ANON_KEY || "";
    this.client = null;
    this.isConnected = false;
    this.listeners = {
      onProductChange: null,
      onBillChange: null,
      onStatusChange: null
    };

    if (this.anonKey && window.supabase) {
      this.initClient(this.anonKey);
    }
  }

  initClient(anonKey) {
    if (!anonKey || !window.supabase) return false;
    try {
      this.anonKey = anonKey.trim();
      this.client = window.supabase.createClient(this.projectUrl, this.anonKey);
      localStorage.setItem("stall_supabase_anon_key", this.anonKey);
      this.isConnected = true;
      this.setupRealtimeSubscriptions();
      this.notifyStatus(true);
      return true;
    } catch (e) {
      console.error("Supabase init error:", e);
      this.isConnected = false;
      this.notifyStatus(false);
      return false;
    }
  }

  disconnect() {
    localStorage.removeItem("stall_supabase_anon_key");
    this.anonKey = "";
    this.client = null;
    this.isConnected = false;
    this.notifyStatus(false);
  }

  notifyStatus(connected) {
    this.isConnected = connected;
    if (this.listeners.onStatusChange) {
      this.listeners.onStatusChange(connected);
    }
    const badge = document.getElementById("cloud-sync-status-badge");
    if (badge) {
      if (connected) {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-[#e87a24] animate-pulse"></span>
          <span class="text-[#e87a24] font-bold">Cloud Live</span>
        `;
        badge.title = "Connected to Supabase PostgreSQL (Realtime Active)";
      } else {
        badge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="text-amber-400 font-bold">Offline / Local</span>
        `;
        badge.title = "Running locally. Tap to connect Supabase Cloud";
      }
    }
  }

  // --------------------------------------------------------------------------
  // REALTIME SUBSCRIPTIONS
  // --------------------------------------------------------------------------
  setupRealtimeSubscriptions() {
    if (!this.client) return;

    // Listen to changes in products table
    this.client
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, payload => {
        console.log("Realtime Product Change:", payload);
        if (this.listeners.onProductChange) {
          this.listeners.onProductChange(payload);
        }
      })
      .subscribe();

    // Listen to changes in bills table
    this.client
      .channel("public:bills")
      .on("postgres_changes", { event: "*", schema: "public", table: "bills" }, payload => {
        console.log("Realtime Bill Change:", payload);
        if (this.listeners.onBillChange) {
          this.listeners.onBillChange(payload);
        }
      })
      .subscribe();
  }

  // --------------------------------------------------------------------------
  // PRODUCTS CRUD
  // --------------------------------------------------------------------------
  async fetchProducts(brandId = "brand-1") {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("products")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        flavour: p.flavour || p.material,
        material: p.flavour || p.material,
        floorPrice: parseFloat(p.floor_price) || 0,
        salePrice: parseFloat(p.sale_price || p.floor_price) || 0,
        costPrice: parseFloat(p.cost_price) || 0,
        stock: parseInt(p.stock, 10) || 0,
        photo: p.photo,
        barcode: p.barcode
      }));
    } catch (e) {
      console.warn("Failed to fetch products from Supabase:", e.message);
      return null;
    }
  }

  async saveProduct(product, brandId = "brand-1") {
    if (!this.isConnected || !this.client) return false;
    try {
      const payload = {
        id: product.id,
        brand_id: brandId,
        name: product.name,
        sku: product.sku,
        category: product.category,
        material: product.flavour || product.material,
        floor_price: product.floorPrice || 0,
        sale_price: product.salePrice || product.floorPrice || 0,
        cost_price: product.costPrice || 0,
        stock: product.stock || 0,
        photo: product.photo,
        barcode: product.barcode,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client
        .from("products")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to save product to Supabase:", e);
      return false;
    }
  }

  async deleteProduct(productId) {
    if (!this.isConnected || !this.client) return false;
    try {
      const { error } = await this.client
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to delete product in Supabase:", e);
      return false;
    }
  }

  async updateStock(productId, newStock, quantityChange, reason, note, staffName, brandId = "brand-1") {
    if (!this.isConnected || !this.client) return false;
    try {
      // 1. Update product stock
      const { error: prodErr } = await this.client
        .from("products")
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (prodErr) throw prodErr;

      // 2. Log stock adjustment audit
      await this.client.from("stock_adjustments").insert({
        id: "adj-" + Date.now(),
        brand_id: brandId,
        product_id: productId,
        previous_stock: newStock - quantityChange,
        new_stock: newStock,
        quantity_change: quantityChange,
        reason: reason,
        note: note || "",
        adjusted_by: staffName || "Staff"
      });

      return true;
    } catch (e) {
      console.error("Failed to update stock in Supabase:", e);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // BILLS CRUD
  // --------------------------------------------------------------------------
  async fetchBills(brandId = "brand-1") {
    if (!this.isConnected || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("bills")
        .select("*")
        .eq("brand_id", brandId)
        .order("sold_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(b => ({
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
      }));
    } catch (e) {
      console.warn("Failed to fetch bills from Supabase:", e.message);
      return null;
    }
  }

  async saveBill(bill, brandId = "brand-1") {
    if (!this.isConnected || !this.client) return false;
    try {
      // 1. Insert bill
      const billPayload = {
        id: bill.id,
        brand_id: brandId,
        bill_number: bill.billNumber,
        sold_at: bill.soldAt,
        booked_by: bill.bookedBy,
        customer_name: bill.customerName,
        customer_phone: bill.customerPhone,
        payment_method: bill.paymentMethod,
        payment_ref: bill.paymentRef,
        note: bill.note,
        total_quantity: bill.totalQuantity,
        total_revenue: bill.totalRevenue,
        total_cost: bill.totalCost,
        total_profit: bill.totalProfit,
        items: bill.items
      };

      const { error: billErr } = await this.client
        .from("bills")
        .insert(billPayload);

      if (billErr) throw billErr;

      // 2. Decrement stock for each item in Supabase
      for (const item of bill.items) {
        const { data: prodData } = await this.client
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (prodData) {
          const currentStock = prodData.stock || 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          await this.client
            .from("products")
            .update({ stock: nextStock, updated_at: new Date().toISOString() })
            .eq("id", item.id);
        }
      }

      return true;
    } catch (e) {
      console.error("Failed to save bill in Supabase:", e);
      return false;
    }
  }

  async voidBill(bill, brandId = "brand-1") {
    if (!this.isConnected || !this.client) return false;
    try {
      // 1. Restore stock
      for (const item of bill.items) {
        const { data: prodData } = await this.client
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (prodData) {
          const nextStock = (prodData.stock || 0) + item.quantity;
          await this.client
            .from("products")
            .update({ stock: nextStock, updated_at: new Date().toISOString() })
            .eq("id", item.id);
        }
      }

      // 2. Delete bill
      const { error } = await this.client
        .from("bills")
        .delete()
        .eq("id", bill.id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to void bill in Supabase:", e);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // BRANDS & SYNC PUSH
  // --------------------------------------------------------------------------
  async pushLocalDataToSupabase(brands, products, bills) {
    if (!this.isConnected || !this.client) return false;
    try {
      // Upsert brands
      for (const b of brands) {
        await this.client.from("brands").upsert({
          id: b.id,
          name: b.name,
          slug: b.slug,
          tagline: b.tagline,
          phone: b.phone,
          upi_vpa: b.upiVpa,
          currency: b.currency,
          currency_symbol: b.currencySymbol,
          logo_icon: b.logoIcon,
          admin_pin: b.adminPin,
          categories: b.categories
        });
      }

      // Upsert products
      for (const p of products) {
        await this.client.from("products").upsert({
          id: p.id,
          brand_id: "brand-1",
          name: p.name,
          sku: p.sku,
          category: p.category,
          material: p.material,
          floor_price: p.floorPrice,
          cost_price: p.costPrice,
          stock: p.stock,
          photo: p.photo,
          barcode: p.barcode,
          updated_at: new Date().toISOString()
        });
      }

      return true;
    } catch (e) {
      console.error("Push to Supabase failed:", e);
      return false;
    }
  }
}

// Global instance
window.supabaseSync = new SupabaseSyncService();

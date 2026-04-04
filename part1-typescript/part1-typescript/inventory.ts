/**
 * PROG2005 Part 1 - Advanced Inventory Management System
 * Author: [Your Name]
 * Student ID: [Your ID]
 * Features: Full CRUD, search, filter by category, custom modal, real-time stats
 */

// ==================== Enums & Interfaces ====================
enum Category {
  Electronics = "Electronics",
  Furniture = "Furniture",
  Clothing = "Clothing",
  Tools = "Tools",
  Miscellaneous = "Miscellaneous"
}

enum StockStatus {
  InStock = "In Stock",
  LowStock = "Low Stock",
  OutOfStock = "Out of Stock"
}

enum PopularItem {
  Yes = "Yes",
  No = "No"
}

interface InventoryItem {
  id: number;
  name: string;
  category: Category;
  quantity: number;
  price: number;
  supplier: string;
  stockStatus: StockStatus;
  popular: PopularItem;
  comment?: string;
}

// ==================== Inventory Manager Class ====================
class InventoryManager {
  private items: InventoryItem[] = [];
  private nextId: number = 1;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadSampleData();
  }

  private loadSampleData(): void {
    this.items = [
      { id: this.nextId++, name: "MacBook Pro", category: Category.Electronics, quantity: 10, price: 2499, supplier: "Apple", stockStatus: StockStatus.InStock, popular: PopularItem.Yes, comment: "M3 chip" },
      { id: this.nextId++, name: "Gaming Chair", category: Category.Furniture, quantity: 3, price: 399, supplier: "Secretlab", stockStatus: StockStatus.LowStock, popular: PopularItem.Yes },
      { id: this.nextId++, name: "Leather Jacket", category: Category.Clothing, quantity: 0, price: 150, supplier: "Zara", stockStatus: StockStatus.OutOfStock, popular: PopularItem.No },
      { id: this.nextId++, name: "Cordless Drill", category: Category.Tools, quantity: 8, price: 89, supplier: "Bosch", stockStatus: StockStatus.InStock, popular: PopularItem.No },
      { id: this.nextId++, name: "Desk Lamp", category: Category.Miscellaneous, quantity: 15, price: 25, supplier: "IKEA", stockStatus: StockStatus.InStock, popular: PopularItem.Yes }
    ];
  }

  public resetToSample(): void {
    this.items = [];
    this.nextId = 1;
    this.loadSampleData();
    this.notifyListeners();
  }

  public subscribe(listener: () => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }

  getAllItems(): InventoryItem[] {
    return [...this.items];
  }

  getPopularItems(): InventoryItem[] {
    return this.items.filter(i => i.popular === PopularItem.Yes);
  }

  addItem(item: Omit<InventoryItem, 'id'>): { success: boolean; message: string } {
    if (!item.name.trim()) return { success: false, message: "Item name is required" };
    if (item.quantity < 0) return { success: false, message: "Quantity cannot be negative" };
    if (item.price <= 0) return { success: false, message: "Price must be positive" };
    if (this.items.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
      return { success: false, message: "Item name already exists" };
    }
    const newItem: InventoryItem = { id: this.nextId++, ...item };
    this.items.push(newItem);
    this.notifyListeners();
    return { success: true, message: `Item "${item.name}" added successfully` };
  }

  updateItemByName(name: string, updates: Partial<InventoryItem>): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (index === -1) return { success: false, message: `Item "${name}" not found` };
    // Handle name change uniqueness
    if (updates.name && updates.name.trim() !== "") {
      const newName = updates.name.trim();
      if (newName.toLowerCase() !== name.toLowerCase() && this.items.some(i => i.name.toLowerCase() === newName.toLowerCase())) {
        return { success: false, message: "New name already exists" };
      }
      this.items[index].name = newName;
    }
    // Apply other updates
    if (updates.category !== undefined) this.items[index].category = updates.category;
    if (updates.quantity !== undefined && updates.quantity >= 0) this.items[index].quantity = updates.quantity;
    if (updates.price !== undefined && updates.price > 0) this.items[index].price = updates.price;
    if (updates.supplier !== undefined) this.items[index].supplier = updates.supplier;
    if (updates.stockStatus !== undefined) this.items[index].stockStatus = updates.stockStatus;
    if (updates.popular !== undefined) this.items[index].popular = updates.popular;
    if (updates.comment !== undefined) this.items[index].comment = updates.comment;
    this.notifyListeners();
    return { success: true, message: `Item "${name}" updated successfully` };
  }

  deleteItemByName(name: string): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (index === -1) return { success: false, message: `Item "${name}" not found` };
    this.items.splice(index, 1);
    this.notifyListeners();
    return { success: true, message: `Item "${name}" deleted` };
  }

  searchByName(name: string): InventoryItem[] {
    if (!name.trim()) return this.getAllItems();
    return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
  }

  getTotalItems(): number { return this.items.length; }
  getTotalValue(): number { return this.items.reduce((sum, i) => sum + (i.quantity * i.price), 0); }
  getLowStockCount(): number { return this.items.filter(i => i.stockStatus === StockStatus.LowStock).length; }
}

// ==================== UI Controller ====================
class InventoryUI {
  private manager: InventoryManager;
  private currentDisplayItems: InventoryItem[] = [];
  private pendingDeleteName: string = "";

  // DOM elements
  private inventoryListDiv: HTMLElement;
  private totalItemsSpan: HTMLElement;
  private totalValueSpan: HTMLElement;
  private lowStockSpan: HTMLElement;
  private addForm: HTMLFormElement;
  private addMessageDiv: HTMLElement;
  private editSearchInput: HTMLInputElement;
  private editMessageDiv: HTMLElement;
  private deleteNameInput: HTMLInputElement;
  private deleteMessageDiv: HTMLElement;
  private searchInput: HTMLInputElement;
  private categoryFilter: HTMLSelectElement;
  private modal: HTMLElement;
  private modalMessage: HTMLElement;

  constructor() {
    this.manager = new InventoryManager();
    this.manager.subscribe(() => this.refreshAll());
    this.cacheDomElements();
    this.attachEventListeners();
    this.refreshAll();
  }

  private cacheDomElements(): void {
    this.inventoryListDiv = document.getElementById("inventoryList")!;
    this.totalItemsSpan = document.getElementById("totalItems")!;
    this.totalValueSpan = document.getElementById("totalValue")!;
    this.lowStockSpan = document.getElementById("lowStockCount")!;
    this.addForm = document.getElementById("addForm") as HTMLFormElement;
    this.addMessageDiv = document.getElementById("addMessage")!;
    this.editSearchInput = document.getElementById("editSearchName") as HTMLInputElement;
    this.editMessageDiv = document.getElementById("editMessage")!;
    this.deleteNameInput = document.getElementById("deleteName") as HTMLInputElement;
    this.deleteMessageDiv = document.getElementById("deleteMessage")!;
    this.searchInput = document.getElementById("searchInput") as HTMLInputElement;
    this.categoryFilter = document.getElementById("categoryFilter") as HTMLSelectElement;
    this.modal = document.getElementById("customModal")!;
    this.modalMessage = document.getElementById("modalMessage")!;
  }

  private attachEventListeners(): void {
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const tabId = target.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        target.classList.add("active");
        document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("active"));
        if (tabId === "add") document.getElementById("addPanel")?.classList.add("active");
        if (tabId === "edit") document.getElementById("editPanel")?.classList.add("active");
        if (tabId === "delete") document.getElementById("deletePanel")?.classList.add("active");
      });
    });

    // Add item
    this.addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newItem = {
        name: (document.getElementById("addName") as HTMLInputElement).value,
        category: (document.getElementById("addCategory") as HTMLSelectElement).value as Category,
        quantity: parseInt((document.getElementById("addQuantity") as HTMLInputElement).value),
        price: parseFloat((document.getElementById("addPrice") as HTMLInputElement).value),
        supplier: (document.getElementById("addSupplier") as HTMLInputElement).value,
        stockStatus: (document.getElementById("addStockStatus") as HTMLSelectElement).value as StockStatus,
        popular: (document.getElementById("addPopular") as HTMLSelectElement).value as PopularItem,
        comment: (document.getElementById("addComment") as HTMLInputElement).value || undefined
      };
      const result = this.manager.addItem(newItem);
      this.showMessage(this.addMessageDiv, result.message, result.success);
      if (result.success) this.addForm.reset();
    });

    // Update item
    const updateBtn = document.getElementById("updateBtn");
    updateBtn?.addEventListener("click", () => {
      const name = this.editSearchInput.value;
      const updates: Partial<InventoryItem> = {};
      const newName = (document.getElementById("editNewName") as HTMLInputElement).value;
      if (newName) updates.name = newName;
      const cat = (document.getElementById("editCategory") as HTMLSelectElement).value;
      if (cat) updates.category = cat as Category;
      const qty = (document.getElementById("editQuantity") as HTMLInputElement).value;
      if (qty !== "") updates.quantity = parseInt(qty);
      const price = (document.getElementById("editPrice") as HTMLInputElement).value;
      if (price !== "") updates.price = parseFloat(price);
      const supplier = (document.getElementById("editSupplier") as HTMLInputElement).value;
      if (supplier) updates.supplier = supplier;
      const stock = (document.getElementById("editStockStatus") as HTMLSelectElement).value;
      if (stock) updates.stockStatus = stock as StockStatus;
      const pop = (document.getElementById("editPopular") as HTMLSelectElement).value;
      if (pop) updates.popular = pop as PopularItem;
      const comment = (document.getElementById("editComment") as HTMLInputElement).value;
      if (comment !== "") updates.comment = comment;
      const result = this.manager.updateItemByName(name, updates);
      this.showMessage(this.editMessageDiv, result.message, result.success);
      if (result.success) {
        this.editSearchInput.value = "";
        (document.getElementById("editNewName") as HTMLInputElement).value = "";
        (document.getElementById("editQuantity") as HTMLInputElement).value = "";
        (document.getElementById("editPrice") as HTMLInputElement).value = "";
        (document.getElementById("editSupplier") as HTMLInputElement).value = "";
        (document.getElementById("editComment") as HTMLInputElement).value = "";
        (document.getElementById("editCategory") as HTMLSelectElement).value = "";
        (document.getElementById("editStockStatus") as HTMLSelectElement).value = "";
        (document.getElementById("editPopular") as HTMLSelectElement).value = "";
      }
    });

    // Delete with custom modal
    const deleteBtn = document.getElementById("deleteBtn");
    deleteBtn?.addEventListener("click", () => {
      const name = this.deleteNameInput.value.trim();
      if (!name) {
        this.showMessage(this.deleteMessageDiv, "Please enter an item name", false);
        return;
      }
      this.pendingDeleteName = name;
      this.modalMessage.innerText = `Are you sure you want to delete "${name}"?`;
      this.modal.style.display = "flex";
    });
    document.getElementById("modalConfirm")?.addEventListener("click", () => {
      const result = this.manager.deleteItemByName(this.pendingDeleteName);
      this.showMessage(this.deleteMessageDiv, result.message, result.success);
      if (result.success) this.deleteNameInput.value = "";
      this.modal.style.display = "none";
      this.pendingDeleteName = "";
    });
    document.getElementById("modalCancel")?.addEventListener("click", () => {
      this.modal.style.display = "none";
      this.pendingDeleteName = "";
    });

    // Search and filter
    document.getElementById("searchBtn")?.addEventListener("click", () => this.applyFilter());
    document.getElementById("showAllBtn")?.addEventListener("click", () => {
      this.searchInput.value = "";
      this.categoryFilter.value = "all";
      this.applyFilter();
    });
    document.getElementById("showPopularBtn")?.addEventListener("click", () => {
      this.currentDisplayItems = this.manager.getPopularItems();
      this.renderTable();
    });
    this.categoryFilter.addEventListener("change", () => this.applyFilter());
    document.getElementById("resetDataBtn")?.addEventListener("click", () => {
      if (confirm("Reset to sample data? All current changes will be lost.")) {
        this.manager.resetToSample();
        this.applyFilter();
      }
    });
  }

  private applyFilter(): void {
    let items = this.manager.searchByName(this.searchInput.value);
    const category = this.categoryFilter.value;
    if (category !== "all") {
      items = items.filter(i => i.category === category);
    }
    this.currentDisplayItems = items;
    this.renderTable();
  }

  private renderTable(): void {
    if (this.currentDisplayItems.length === 0) {
      this.inventoryListDiv.innerHTML = `<div class="message" style="text-align:center;">📭 No items to display</div>`;
      return;
    }
    const table = document.createElement("table");
    table.className = "inventory-table";
    table.innerHTML = `
      <thead>
        <tr><th>ID</th><th>Name</th><th>Category</th><th>Qty</th><th>Price</th><th>Supplier</th><th>Stock</th><th>Popular</th><th>Comment</th></tr>
      </thead>
      <tbody>
        ${this.currentDisplayItems.map(item => `
          <tr>
            <td>${item.id}</td>
            <td><strong>${this.escapeHtml(item.name)}</strong></td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${this.escapeHtml(item.supplier)}</td>
            <td><span class="stock-badge ${this.getStockClass(item.stockStatus)}">${item.stockStatus}</span></td>
            <td>${item.popular === PopularItem.Yes ? "⭐ Yes" : "No"}</td>
            <td>${this.escapeHtml(item.comment || "-")}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
    this.inventoryListDiv.innerHTML = "";
    this.inventoryListDiv.appendChild(table);
  }

  private refreshAll(): void {
    this.totalItemsSpan.innerText = this.manager.getTotalItems().toString();
    this.totalValueSpan.innerText = `$${this.manager.getTotalValue().toFixed(2)}`;
    this.lowStockSpan.innerText = this.manager.getLowStockCount().toString();
    this.applyFilter();
  }

  private showMessage(container: HTMLElement, msg: string, isSuccess: boolean): void {
    container.innerText = msg;
    container.className = `message ${isSuccess ? "success" : "error"}`;
    setTimeout(() => { container.innerText = ""; container.className = "message"; }, 3000);
  }

  private getStockClass(status: StockStatus): string {
    switch(status) {
      case StockStatus.InStock: return "stock-in";
      case StockStatus.LowStock: return "stock-low";
      default: return "stock-out";
    }
  }

  private escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, function(m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }
}

// 启动应用
document.addEventListener("DOMContentLoaded", () => {
  new InventoryUI();
});
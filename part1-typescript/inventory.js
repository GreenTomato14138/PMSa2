"use strict";
/**
 * PROG2005 Part 1 - Advanced Inventory Management System
 * Author: Boyuan_Liu
 * Student ID: 24832410
 */
// ==================== Enums & Interfaces ====================
var Category;
(function (Category) {
    Category["Electronics"] = "Electronics";
    Category["Furniture"] = "Furniture";
    Category["Clothing"] = "Clothing";
    Category["Tools"] = "Tools";
    Category["Miscellaneous"] = "Miscellaneous";
})(Category || (Category = {}));
var StockStatus;
(function (StockStatus) {
    StockStatus["InStock"] = "In Stock";
    StockStatus["LowStock"] = "Low Stock";
    StockStatus["OutOfStock"] = "Out of Stock";
})(StockStatus || (StockStatus = {}));
var PopularItem;
(function (PopularItem) {
    PopularItem["Yes"] = "Yes";
    PopularItem["No"] = "No";
})(PopularItem || (PopularItem = {}));
// ==================== Inventory Manager Class ====================
class InventoryManager {
    constructor() {
        this.items = [];
        this.nextId = 1;
        this.listeners = [];
        this.loadSampleData();
    }
    loadSampleData() {
        this.items = [
            { id: this.nextId++, name: "MacBook Pro", category: Category.Electronics, quantity: 10, price: 2499, supplier: "Apple", stockStatus: StockStatus.InStock, popular: PopularItem.Yes, comment: "M3 chip" },
            { id: this.nextId++, name: "Gaming Chair", category: Category.Furniture, quantity: 3, price: 399, supplier: "Secretlab", stockStatus: StockStatus.LowStock, popular: PopularItem.Yes },
            { id: this.nextId++, name: "Leather Jacket", category: Category.Clothing, quantity: 0, price: 150, supplier: "Zara", stockStatus: StockStatus.OutOfStock, popular: PopularItem.No },
            { id: this.nextId++, name: "Cordless Drill", category: Category.Tools, quantity: 8, price: 89, supplier: "Bosch", stockStatus: StockStatus.InStock, popular: PopularItem.No },
            { id: this.nextId++, name: "Desk Lamp", category: Category.Miscellaneous, quantity: 15, price: 25, supplier: "IKEA", stockStatus: StockStatus.InStock, popular: PopularItem.Yes }
        ];
    }
    resetToSample() {
        this.items = [];
        this.nextId = 1;
        this.loadSampleData();
        this.notifyListeners();
    }
    subscribe(listener) {
        this.listeners.push(listener);
    }
    notifyListeners() {
        this.listeners.forEach(l => l());
    }
    getAllItems() {
        return [...this.items];
    }
    getPopularItems() {
        return this.items.filter(i => i.popular === PopularItem.Yes);
    }
    addItem(item) {
        if (!item.name.trim())
            return { success: false, message: "Item name is required" };
        if (item.quantity < 0)
            return { success: false, message: "Quantity cannot be negative" };
        if (item.price <= 0)
            return { success: false, message: "Price must be positive" };
        if (this.items.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
            return { success: false, message: "Item name already exists" };
        }
        const newItem = { id: this.nextId++, ...item };
        this.items.push(newItem);
        this.notifyListeners();
        return { success: true, message: `Item "${item.name}" added successfully` };
    }
    updateItemByName(name, updates) {
        const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (index === -1)
            return { success: false, message: `Item "${name}" not found` };
        if (updates.name && updates.name.trim() !== "") {
            const newName = updates.name.trim();
            if (newName.toLowerCase() !== name.toLowerCase() && this.items.some(i => i.name.toLowerCase() === newName.toLowerCase())) {
                return { success: false, message: "New name already exists" };
            }
            this.items[index].name = newName;
        }
        if (updates.category !== undefined)
            this.items[index].category = updates.category;
        if (updates.quantity !== undefined && updates.quantity >= 0)
            this.items[index].quantity = updates.quantity;
        if (updates.price !== undefined && updates.price > 0)
            this.items[index].price = updates.price;
        if (updates.supplier !== undefined)
            this.items[index].supplier = updates.supplier;
        if (updates.stockStatus !== undefined)
            this.items[index].stockStatus = updates.stockStatus;
        if (updates.popular !== undefined)
            this.items[index].popular = updates.popular;
        if (updates.comment !== undefined)
            this.items[index].comment = updates.comment;
        this.notifyListeners();
        return { success: true, message: `Item "${name}" updated successfully` };
    }
    deleteItemByName(name) {
        const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (index === -1)
            return { success: false, message: `Item "${name}" not found` };
        this.items.splice(index, 1);
        this.notifyListeners();
        return { success: true, message: `Item "${name}" deleted` };
    }
    searchByName(name) {
        if (!name.trim())
            return this.getAllItems();
        return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
    }
    getTotalItems() { return this.items.length; }
    getTotalValue() { return this.items.reduce((sum, i) => sum + (i.quantity * i.price), 0); }
    getLowStockCount() { return this.items.filter(i => i.stockStatus === StockStatus.LowStock).length; }
}
// ==================== UI Controller ====================
class InventoryUI {
    constructor() {
        this.currentDisplayItems = [];
        this.pendingDeleteName = "";
        this.manager = new InventoryManager();
        this.manager.subscribe(() => this.refreshAll());
        this.cacheDomElements();
        this.attachEventListeners();
        this.refreshAll();
    }
    cacheDomElements() {
        this.inventoryListDiv = document.getElementById("inventoryList");
        this.totalItemsSpan = document.getElementById("totalItems");
        this.totalValueSpan = document.getElementById("totalValue");
        this.lowStockSpan = document.getElementById("lowStockCount");
        this.addForm = document.getElementById("addForm");
        this.addMessageDiv = document.getElementById("addMessage");
        this.editSearchInput = document.getElementById("editSearchName");
        this.editMessageDiv = document.getElementById("editMessage");
        this.deleteNameInput = document.getElementById("deleteName");
        this.deleteMessageDiv = document.getElementById("deleteMessage");
        this.searchInput = document.getElementById("searchInput");
        this.categoryFilter = document.getElementById("categoryFilter");
        this.modal = document.getElementById("customModal");
        this.modalMessage = document.getElementById("modalMessage");
    }
    attachEventListeners() {
        // Tab switching
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const target = e.target;
                const tabId = target.dataset.tab;
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                target.classList.add("active");
                document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("active"));
                if (tabId === "add")
                    document.getElementById("addPanel")?.classList.add("active");
                if (tabId === "edit")
                    document.getElementById("editPanel")?.classList.add("active");
                if (tabId === "delete")
                    document.getElementById("deletePanel")?.classList.add("active");
            });
        });
        // Add item
        this.addForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newItem = {
                name: document.getElementById("addName").value,
                category: document.getElementById("addCategory").value,
                quantity: parseInt(document.getElementById("addQuantity").value),
                price: parseFloat(document.getElementById("addPrice").value),
                supplier: document.getElementById("addSupplier").value,
                stockStatus: document.getElementById("addStockStatus").value,
                popular: document.getElementById("addPopular").value,
                comment: document.getElementById("addComment").value || undefined
            };
            const result = this.manager.addItem(newItem);
            this.showMessage(this.addMessageDiv, result.message, result.success);
            if (result.success)
                this.addForm.reset();
        });
        // Update item
        const updateBtn = document.getElementById("updateBtn");
        updateBtn?.addEventListener("click", () => {
            const name = this.editSearchInput.value;
            const updates = {};
            const newName = document.getElementById("editNewName").value;
            if (newName)
                updates.name = newName;
            const cat = document.getElementById("editCategory").value;
            if (cat)
                updates.category = cat;
            const qty = document.getElementById("editQuantity").value;
            if (qty !== "")
                updates.quantity = parseInt(qty);
            const price = document.getElementById("editPrice").value;
            if (price !== "")
                updates.price = parseFloat(price);
            const supplier = document.getElementById("editSupplier").value;
            if (supplier)
                updates.supplier = supplier;
            const stock = document.getElementById("editStockStatus").value;
            if (stock)
                updates.stockStatus = stock;
            const pop = document.getElementById("editPopular").value;
            if (pop)
                updates.popular = pop;
            const comment = document.getElementById("editComment").value;
            if (comment !== "")
                updates.comment = comment;
            const result = this.manager.updateItemByName(name, updates);
            this.showMessage(this.editMessageDiv, result.message, result.success);
            if (result.success) {
                this.editSearchInput.value = "";
                document.getElementById("editNewName").value = "";
                document.getElementById("editQuantity").value = "";
                document.getElementById("editPrice").value = "";
                document.getElementById("editSupplier").value = "";
                document.getElementById("editComment").value = "";
                document.getElementById("editCategory").value = "";
                document.getElementById("editStockStatus").value = "";
                document.getElementById("editPopular").value = "";
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
            if (result.success)
                this.deleteNameInput.value = "";
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
    applyFilter() {
        let items = this.manager.searchByName(this.searchInput.value);
        const category = this.categoryFilter.value;
        if (category !== "all") {
            items = items.filter(i => i.category === category);
        }
        this.currentDisplayItems = items;
        this.renderTable();
    }
    renderTable() {
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
            <td>${item.id}</td><td><strong>${this.escapeHtml(item.name)}</strong></td>
            <td>${item.category}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td>
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
    refreshAll() {
        this.totalItemsSpan.innerText = this.manager.getTotalItems().toString();
        this.totalValueSpan.innerText = `$${this.manager.getTotalValue().toFixed(2)}`;
        this.lowStockSpan.innerText = this.manager.getLowStockCount().toString();
        this.applyFilter();
    }
    showMessage(container, msg, isSuccess) {
        container.innerText = msg;
        container.className = `message ${isSuccess ? "success" : "error"}`;
        setTimeout(() => { container.innerText = ""; container.className = "message"; }, 3000);
    }
    getStockClass(status) {
        switch (status) {
            case StockStatus.InStock: return "stock-in";
            case StockStatus.LowStock: return "stock-low";
            default: return "stock-out";
        }
    }
    escapeHtml(str) {
        return str.replace(/[&<>]/g, function (m) {
            if (m === "&")
                return "&amp;";
            if (m === "<")
                return "&lt;";
            if (m === ">")
                return "&gt;";
            return m;
        });
    }
}
// 启动应用
document.addEventListener("DOMContentLoaded", () => {
    new InventoryUI();
});

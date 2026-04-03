/**
 * Inventory Management System - Part 1
 * Author: Boyuan_Liu
 * Student ID: 24832410
 * Date: March 2026
 * Description: Pure TypeScript app with session-based inventory management.
 * All interactions use innerHTML, no alerts.
 */

// Enums for strict typing
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

// Interface for inventory item
interface InventoryItem {
    id: number;
    name: string;
    category: Category;
    quantity: number;
    price: number;
    supplier: string;
    stockStatus: StockStatus;
    popular: PopularItem;
    comment?: string;   // optional
}

// Main manager class
class InventoryManager {
    private items: InventoryItem[] = [];
    private nextId: number = 1;

    constructor() {
        this.loadSampleData();
        this.attachEventListeners();
        this.displayAllItems();
    }

    // Populate with sample data
    private loadSampleData(): void {
        this.items.push({
            id: this.nextId++,
            name: "MacBook Pro",
            category: Category.Electronics,
            quantity: 12,
            price: 1999,
            supplier: "Apple Inc.",
            stockStatus: StockStatus.InStock,
            popular: PopularItem.Yes,
            comment: "M3 chip, 16GB RAM"
        });
        this.items.push({
            id: this.nextId++,
            name: "Office Desk",
            category: Category.Furniture,
            quantity: 5,
            price: 299,
            supplier: "IKEA",
            stockStatus: StockStatus.LowStock,
            popular: PopularItem.No,
            comment: "Black, 120x60cm"
        });
    }

    // Get all items (immutable copy)
    getAllItems(): InventoryItem[] {
        return [...this.items];
    }

    // Get popular items
    getPopularItems(): InventoryItem[] {
        return this.items.filter(item => item.popular === PopularItem.Yes);
    }

    // Add new item
    addItem(item: Omit<InventoryItem, 'id'>): { success: boolean; message: string } {
        // Check uniqueness by name (case-insensitive)
        const exists = this.items.some(i => i.name.toLowerCase() === item.name.toLowerCase());
        if (exists) {
            return { success: false, message: `Item "${item.name}" already exists.` };
        }
        // Validation: required fields (comment is optional)
        if (!item.name || !item.category || item.quantity === undefined || item.price === undefined || !item.supplier || !item.stockStatus || !item.popular) {
            return { success: false, message: "All fields except comment are required." };
        }
        if (item.quantity < 0 || item.price < 0) {
            return { success: false, message: "Quantity and price cannot be negative." };
        }

        const newItem: InventoryItem = {
            id: this.nextId++,
            ...item
        };
        this.items.push(newItem);
        return { success: true, message: `Item "${item.name}" added successfully.` };
    }

    // Update item by name
    updateItemByName(name: string, updates: Partial<InventoryItem>): { success: boolean; message: string } {
        const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (index === -1) {
            return { success: false, message: `Item "${name}" not found.` };
        }

        // Ensure unique name if name is being changed
        if (updates.name && updates.name.toLowerCase() !== name.toLowerCase()) {
            const exists = this.items.some(i => i.name.toLowerCase() === updates.name!.toLowerCase() && i.id !== this.items[index].id);
            if (exists) {
                return { success: false, message: `Item "${updates.name}" already exists.` };
            }
        }

        // Validate numeric fields if provided
        if (updates.quantity !== undefined && updates.quantity < 0) {
            return { success: false, message: "Quantity cannot be negative." };
        }
        if (updates.price !== undefined && updates.price < 0) {
            return { success: false, message: "Price cannot be negative." };
        }

        this.items[index] = { ...this.items[index], ...updates };
        return { success: true, message: `Item "${name}" updated successfully.` };
    }

    // Delete item by name with confirmation (prompt is allowed as it's a standard browser confirm)
    deleteItemByName(name: string): { success: boolean; message: string } {
        const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (index === -1) {
            return { success: false, message: `Item "${name}" not found.` };
        }
        const confirmDelete = confirm(`Are you sure you want to delete "${this.items[index].name}"?`);
        if (!confirmDelete) {
            return { success: false, message: "Deletion cancelled." };
        }
        this.items.splice(index, 1);
        return { success: true, message: `Item "${name}" deleted successfully.` };
    }

    // Search by name (partial match)
    searchByName(name: string): InventoryItem[] {
        if (!name.trim()) return [];
        return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
    }

    // Render table of items
    private renderTable(items: InventoryItem[], title?: string): string {
        if (!items.length) {
            return `<p class="message">No items to display.</p>`;
        }
        let html = title ? `<h3>${title}</h3>` : '';
        html += `<div style="overflow-x: auto;"><table>
            <thead>
                <tr><th>ID</th><th>Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Supplier</th><th>Stock</th><th>Popular</th><th>Comment</th></tr>
            </thead>
            <tbody>`;
        for (const item of items) {
            html += `<tr>
                <td>${item.id}</td>
                <td>${this.escapeHtml(item.name)}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${this.escapeHtml(item.supplier)}</td>
                <td>${item.stockStatus}</td>
                <td>${item.popular}</td>
                <td>${item.comment ? this.escapeHtml(item.comment) : '-'}</td>
            </tr>`;
        }
        html += `</tbody></table></div>`;
        return html;
    }

    // Helper to prevent XSS
    private escapeHtml(str: string): string {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Display message in UI
    private showMessage(msg: string, isError: boolean = false): void {
        const msgDiv = document.getElementById('messageArea');
        if (msgDiv) {
            msgDiv.innerHTML = `<div style="color: ${isError ? '#dc3545' : '#28a745'}">${this.escapeHtml(msg)}</div>`;
            setTimeout(() => {
                if (msgDiv) msgDiv.innerHTML = '';
            }, 3000);
        }
    }

    // Display all items
    displayAllItems(): void {
        const outputDiv = document.getElementById('inventoryDisplay');
        if (outputDiv) {
            outputDiv.innerHTML = this.renderTable(this.getAllItems(), 'All Inventory Items');
        }
    }

    // Display popular items
    displayPopularItems(): void {
        const outputDiv = document.getElementById('inventoryDisplay');
        if (outputDiv) {
            outputDiv.innerHTML = this.renderTable(this.getPopularItems(), '⭐ Popular Items');
        }
    }

    // Display search results
    displaySearchResults(searchTerm: string): void {
        const results = this.searchByName(searchTerm);
        const outputDiv = document.getElementById('inventoryDisplay');
        if (outputDiv) {
            if (results.length === 0 && searchTerm.trim() !== '') {
                outputDiv.innerHTML = `<p class="message">No items match "${this.escapeHtml(searchTerm)}".</p>`;
            } else {
                outputDiv.innerHTML = this.renderTable(results, `Search results for "${this.escapeHtml(searchTerm)}"`);
            }
        }
    }

    // Handle add form
    private handleAdd(): void {
        const name = (document.getElementById('itemName') as HTMLInputElement).value.trim();
        const category = (document.getElementById('category') as HTMLSelectElement).value as Category;
        const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value);
        const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
        const supplier = (document.getElementById('supplier') as HTMLInputElement).value.trim();
        const stockStatus = (document.getElementById('stockStatus') as HTMLSelectElement).value as StockStatus;
        const popular = (document.getElementById('popular') as HTMLSelectElement).value as PopularItem;
        const comment = (document.getElementById('comment') as HTMLInputElement).value.trim();

        if (!name || isNaN(quantity) || isNaN(price) || !supplier) {
            this.showMessage('Please fill all required fields (Name, Quantity, Price, Supplier).', true);
            return;
        }

        const result = this.addItem({
            name, category, quantity, price, supplier, stockStatus, popular, comment: comment || undefined
        });
        this.showMessage(result.message, !result.success);
        if (result.success) {
            this.displayAllItems();
            this.clearForm();
        }
    }

    // Handle update
    private handleUpdate(): void {
        const name = (document.getElementById('itemName') as HTMLInputElement).value.trim();
        if (!name) {
            this.showMessage('Please enter the item name to update.', true);
            return;
        }
        const updates: Partial<InventoryItem> = {};
        const category = (document.getElementById('category') as HTMLSelectElement).value;
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        const price = (document.getElementById('price') as HTMLInputElement).value;
        const supplier = (document.getElementById('supplier') as HTMLInputElement).value.trim();
        const stockStatus = (document.getElementById('stockStatus') as HTMLSelectElement).value;
        const popular = (document.getElementById('popular') as HTMLSelectElement).value;
        const comment = (document.getElementById('comment') as HTMLInputElement).value.trim();

        if (category) updates.category = category as Category;
        if (quantity !== '') updates.quantity = parseInt(quantity);
        if (price !== '') updates.price = parseFloat(price);
        if (supplier) updates.supplier = supplier;
        if (stockStatus) updates.stockStatus = stockStatus as StockStatus;
        if (popular) updates.popular = popular as PopularItem;
        if (comment !== '') updates.comment = comment || undefined;

        if (Object.keys(updates).length === 0) {
            this.showMessage('No fields to update.', true);
            return;
        }

        const result = this.updateItemByName(name, updates);
        this.showMessage(result.message, !result.success);
        if (result.success) {
            this.displayAllItems();
            this.clearForm();
        }
    }

    // Handle delete
    private handleDelete(): void {
        const name = (document.getElementById('itemName') as HTMLInputElement).value.trim();
        if (!name) {
            this.showMessage('Please enter the item name to delete.', true);
            return;
        }
        const result = this.deleteItemByName(name);
        this.showMessage(result.message, !result.success);
        if (result.success) {
            this.displayAllItems();
            this.clearForm();
        }
    }

    // Clear form inputs
    private clearForm(): void {
        (document.getElementById('itemName') as HTMLInputElement).value = '';
        (document.getElementById('category') as HTMLSelectElement).selectedIndex = 0;
        (document.getElementById('quantity') as HTMLInputElement).value = '';
        (document.getElementById('price') as HTMLInputElement).value = '';
        (document.getElementById('supplier') as HTMLInputElement).value = '';
        (document.getElementById('stockStatus') as HTMLSelectElement).selectedIndex = 0;
        (document.getElementById('popular') as HTMLSelectElement).selectedIndex = 0;
        (document.getElementById('comment') as HTMLInputElement).value = '';
    }

    // Attach event listeners to buttons
    private attachEventListeners(): void {
        document.getElementById('addBtn')?.addEventListener('click', () => this.handleAdd());
        document.getElementById('updateBtn')?.addEventListener('click', () => this.handleUpdate());
        document.getElementById('deleteBtn')?.addEventListener('click', () => this.handleDelete());
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            const searchTerm = (document.getElementById('searchName') as HTMLInputElement).value.trim();
            if (searchTerm === '') {
                this.displayAllItems();
            } else {
                this.displaySearchResults(searchTerm);
            }
        });
        document.getElementById('showAllBtn')?.addEventListener('click', () => this.displayAllItems());
        document.getElementById('showPopularBtn')?.addEventListener('click', () => this.displayPopularItems());
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});

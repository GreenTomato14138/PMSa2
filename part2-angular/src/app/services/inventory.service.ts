import { Injectable } from '@angular/core';
import { InventoryItem, Category, StockStatus, PopularItem } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private items: InventoryItem[] = [];
  private nextId = 1;

  constructor() {
    this.loadSampleData();
  }

  private loadSampleData(): void {
    this.items.push({
      id: this.nextId++,
      name: 'MacBook Pro',
      category: Category.Electronics,
      quantity: 12,
      price: 1999,
      supplier: 'Apple Inc.',
      stockStatus: StockStatus.InStock,
      popular: PopularItem.Yes,
      comment: 'M3 chip, 16GB RAM'
    });
    this.items.push({
      id: this.nextId++,
      name: 'Office Desk',
      category: Category.Furniture,
      quantity: 5,
      price: 299,
      supplier: 'IKEA',
      stockStatus: StockStatus.LowStock,
      popular: PopularItem.No,
      comment: 'Black, 120x60cm'
    });
  }

  getAllItems(): InventoryItem[] {
    return [...this.items];
  }

  getPopularItems(): InventoryItem[] {
    return this.items.filter(item => item.popular === PopularItem.Yes);
  }

  addItem(item: Omit<InventoryItem, 'id'>): { success: boolean; message: string } {
    const exists = this.items.some(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (exists) {
      return { success: false, message: `Item "${item.name}" already exists.` };
    }
    if (!item.name || !item.category || item.quantity === undefined || item.price === undefined || !item.supplier || !item.stockStatus || !item.popular) {
      return { success: false, message: 'All fields except comment are required.' };
    }
    if (item.quantity < 0 || item.price < 0) {
      return { success: false, message: 'Quantity and price cannot be negative.' };
    }

    const newItem: InventoryItem = {
      id: this.nextId++,
      ...item
    };
    this.items.push(newItem);
    return { success: true, message: `Item "${item.name}" added successfully.` };
  }

  updateItemByName(name: string, updates: Partial<InventoryItem>): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      return { success: false, message: `Item "${name}" not found.` };
    }

    if (updates.name && updates.name.toLowerCase() !== name.toLowerCase()) {
      const exists = this.items.some(i => i.name.toLowerCase() === updates.name!.toLowerCase() && i.id !== this.items[index].id);
      if (exists) {
        return { success: false, message: `Item "${updates.name}" already exists.` };
      }
    }

    if (updates.quantity !== undefined && updates.quantity < 0) {
      return { success: false, message: 'Quantity cannot be negative.' };
    }
    if (updates.price !== undefined && updates.price < 0) {
      return { success: false, message: 'Price cannot be negative.' };
    }

    this.items[index] = { ...this.items[index], ...updates };
    return { success: true, message: `Item "${name}" updated successfully.` };
  }

  deleteItemByName(name: string): { success: boolean; message: string } {
    const index = this.items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      return { success: false, message: `Item "${name}" not found.` };
    }
    const confirmDelete = confirm(`Are you sure you want to delete "${this.items[index].name}"?`);
    if (!confirmDelete) {
      return { success: false, message: 'Deletion cancelled.' };
    }
    this.items.splice(index, 1);
    return { success: true, message: `Item "${name}" deleted successfully.` };
  }

  searchByName(name: string): InventoryItem[] {
    if (!name.trim()) return [];
    return this.items.filter(i => i.name.toLowerCase().includes(name.toLowerCase()));
  }
}
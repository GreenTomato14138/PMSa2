/**
 * PROG2005 Part 2 - Aether Inventory
 * Author: Boyuan_Liu
 * Student ID: 24832410
 */
import { Injectable } from '@angular/core';
import { InventoryItem } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventory: InventoryItem[] = [
    {
      id: 'AETH-101',
      name: 'Lumina Wireless Headphones',
      category: 'Electronics',
      quantity: 42,
      price: 1299,
      supplier: 'SoniCore',
      stockStatus: 'In Stock',
      hotItem: 'Yes',
      comments: 'Active noise cancellation, 30h battery life'
    },
    {
      id: 'AETH-102',
      name: 'Elden Desk (Walnut)',
      category: 'Furniture',
      quantity: 8,
      price: 3899,
      supplier: 'Nordic Home',
      stockStatus: 'Low Stock',
      hotItem: 'Yes',
      comments: 'Eco-friendly, height adjustable'
    },
    {
      id: 'AETH-103',
      name: 'Crimson Silk Robe',
      category: 'Clothing',
      quantity: 25,
      price: 799,
      supplier: 'Atelier Azure',
      stockStatus: 'In Stock',
      hotItem: 'No',
      comments: '100% mulberry silk, unisex'
    },
    {
      id: 'AETH-104',
      name: 'Quantum Soldering Station',
      category: 'Tools',
      quantity: 0,
      price: 2450,
      supplier: 'TechPro Tools',
      stockStatus: 'Out of Stock',
      hotItem: 'No',
      comments: 'Precision temperature control, ESD safe'
    },
    {
      id: 'AETH-105',
      name: 'Starlight Projector',
      category: 'Electronics',
      quantity: 15,
      price: 549,
      supplier: 'Nebula Labs',
      stockStatus: 'In Stock',
      hotItem: 'Yes',
      comments: 'Galaxy & aurora effects, app-controlled'
    },
    {
      id: 'AETH-106',
      name: 'Zen Garden Mini Set',
      category: 'Misc',
      quantity: 33,
      price: 299,
      supplier: 'Mindful Objects',
      stockStatus: 'In Stock',
      hotItem: 'No',
      comments: 'Desktop relaxation kit with raked sand'
    }
  ];

  getAllItems(): InventoryItem[] {
    return [...this.inventory];
  }

  getItemById(id: string): InventoryItem | undefined {
    return this.inventory.find(item => item.id === id);
  }

  isIdUnique(id: string, excludeId?: string): boolean {
    return !this.inventory.some(item => 
      item.id === id && (!excludeId || item.id !== excludeId)
    );
  }

  addItem(item: InventoryItem): boolean {
    if (!this.isIdUnique(item.id)) return false;
    this.inventory.push({ ...item });
    return true;
  }

  updateItem(id: string, updatedItem: InventoryItem): boolean {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      this.inventory[index] = { ...updatedItem };
      return true;
    }
    return false;
  }

  deleteItemById(id: string): boolean {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      return true;
    }
    return false;
  }

  searchByName(keyword: string): InventoryItem[] {
    if (!keyword.trim()) return [...this.inventory];
    const lowerKeyword = keyword.toLowerCase();
    return this.inventory.filter(item => 
      item.name.toLowerCase().includes(lowerKeyword)
    );
  }

  getHotItems(): InventoryItem[] {
    return this.inventory.filter(item => item.hotItem === 'Yes');
  }

  searchWithFilters(keyword: string, category?: string, minPrice?: number, maxPrice?: number): InventoryItem[] {
    let results = this.searchByName(keyword);
    if (category && category !== 'All') {
      results = results.filter(item => item.category === category);
    }
    if (minPrice && minPrice > 0) {
      results = results.filter(item => item.price >= minPrice);
    }
    if (maxPrice && maxPrice > 0) {
      results = results.filter(item => item.price <= maxPrice);
    }
    return results;
  }
}
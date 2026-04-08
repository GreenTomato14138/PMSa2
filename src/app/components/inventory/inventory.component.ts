/**
 * PROG2005 Part 2 - Aether Inventory
 * Author: Boyuan_Liu
 * Student ID: 24832410
 */
import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: false,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  inventory: InventoryItem[] = [];
  displayItems: InventoryItem[] = [];
  editMode: boolean = false;
  editingId: string | null = null;
  showHotOnly: boolean = false;

  formData: InventoryItem = {
    id: '',
    name: '',
    category: 'Electronics',
    quantity: 0,
    price: 0,
    supplier: '',
    stockStatus: 'In Stock',
    hotItem: 'No',
    comments: ''
  };

  message: { text: string, isError: boolean } | null = null;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.inventory = this.inventoryService.getAllItems();
    this.updateDisplay();
  }

  updateDisplay(): void {
    if (this.showHotOnly) {
      this.displayItems = this.inventoryService.getHotItems();
    } else {
      this.displayItems = [...this.inventory];
    }
  }

  showMessage(msg: string, isError: boolean = false): void {
    this.message = { text: msg, isError: isError };
    setTimeout(() => {
      if (this.message?.text === msg) this.message = null;
    }, 3000);
  }

  resetForm(): void {
    this.editMode = false;
    this.editingId = null;
    this.formData = {
      id: '',
      name: '',
      category: 'Electronics',
      quantity: 0,
      price: 0,
      supplier: '',
      stockStatus: 'In Stock',
      hotItem: 'No',
      comments: ''
    };
  }

  startEdit(id: string): void {
    const item = this.inventoryService.getItemById(id);
    if (item) {
      this.editMode = true;
      this.editingId = id;
      this.formData = { ...item };
    }
  }

  onSubmit(): void {
    if (!this.formData.id || !this.formData.name || !this.formData.supplier) {
      this.showMessage('Please fill in all required fields (*)', true);
      return;
    }
    if (this.formData.quantity < 0 || isNaN(this.formData.quantity)) {
      this.showMessage('Quantity must be a number >= 0', true);
      return;
    }
    if (this.formData.price < 0 || isNaN(this.formData.price)) {
      this.showMessage('Price must be a number >= 0', true);
      return;
    }

    if (this.editMode && this.editingId) {
      if (this.inventoryService.updateItem(this.editingId, this.formData)) {
        this.showMessage(`Product "${this.formData.name}" updated successfully`);
        this.loadInventory();
        this.resetForm();
      } else {
        this.showMessage('Update failed', true);
      }
    } else {
      if (this.inventoryService.addItem(this.formData)) {
        this.showMessage(`Product "${this.formData.name}" added successfully`);
        this.loadInventory();
        this.resetForm();
      } else {
        this.showMessage(`Product ID ${this.formData.id} already exists`, true);
      }
    }
  }

  deleteItem(id: string): void {
    const item = this.inventoryService.getItemById(id);
    if (item && confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.inventoryService.deleteItemById(id);
      this.showMessage(`Product "${item.name}" deleted`);
      this.loadInventory();
      if (this.editMode && this.editingId === id) {
        this.resetForm();
      }
    }
  }

  toggleHotFilter(): void {
    this.showHotOnly = !this.showHotOnly;
    this.updateDisplay();
  }

  resetFilter(): void {
    this.showHotOnly = false;
    this.updateDisplay();
  }
}
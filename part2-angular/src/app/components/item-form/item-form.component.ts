import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { Category, StockStatus, PopularItem, InventoryItem } from '../../models/item.model';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit {
  categories = Object.values(Category);
  stockStatuses = Object.values(StockStatus);
  popularOptions = Object.values(PopularItem);

  newItem: Omit<InventoryItem, 'id'> = {
    name: '',
    category: Category.Electronics,
    quantity: 0,
    price: 0,
    supplier: '',
    stockStatus: StockStatus.InStock,
    popular: PopularItem.No,
    comment: ''
  };

  updateName: string = '';
  updateData: Partial<InventoryItem> = {};
  deleteName: string = '';

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  allItems: InventoryItem[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadAllItems();
  }

  loadAllItems(): void {
    this.allItems = this.inventoryService.getAllItems();
  }

  addItem(): void {
    const result = this.inventoryService.addItem(this.newItem);
    this.showMessage(result.message, result.success);
    if (result.success) {
      this.resetNewItem();
      this.loadAllItems();
    }
  }

  updateItem(): void {
    if (!this.updateName.trim()) {
      this.showMessage('Please enter an item name to update.', false);
      return;
    }
    const result = this.inventoryService.updateItemByName(this.updateName, this.updateData);
    this.showMessage(result.message, result.success);
    if (result.success) {
      this.resetUpdateForm();
      this.loadAllItems();
    }
  }

  deleteItem(): void {
    if (!this.deleteName.trim()) {
      this.showMessage('Please enter an item name to delete.', false);
      return;
    }
    const result = this.inventoryService.deleteItemByName(this.deleteName);
    this.showMessage(result.message, result.success);
    if (result.success) {
      this.deleteName = '';
      this.loadAllItems();
    }
  }

  private resetNewItem(): void {
    this.newItem = {
      name: '',
      category: Category.Electronics,
      quantity: 0,
      price: 0,
      supplier: '',
      stockStatus: StockStatus.InStock,
      popular: PopularItem.No,
      comment: ''
    };
  }

  private resetUpdateForm(): void {
    this.updateName = '';
    this.updateData = {};
  }

  private showMessage(msg: string, isSuccess: boolean): void {
    this.message = msg;
    this.messageType = isSuccess ? 'success' : 'error';
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
/**
 * PROG2005 Part 2 - Aether Inventory
 * Author: Boyuan_Liu
 * Student ID: 24832410
 */
import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory.model';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  keyword: string = '';
  selectedCategory: string = 'All';
  minPrice: number = 0;
  maxPrice: number = 0;
  searchResults: InventoryItem[] = [];
  categories: string[] = ['All', 'Electronics', 'Furniture', 'Clothing', 'Tools', 'Misc'];

  constructor(private inventoryService: InventoryService) {}

  onSearch(): void {
    this.searchResults = this.inventoryService.searchWithFilters(
      this.keyword,
      this.selectedCategory === 'All' ? undefined : this.selectedCategory,
      this.minPrice || undefined,
      this.maxPrice || undefined
    );
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedCategory = 'All';
    this.minPrice = 0;
    this.maxPrice = 0;
    this.searchResults = [];
  }

  getStockStatusClass(status: string): string {
    switch(status) {
      case 'In Stock': return 'in-stock';
      case 'Low Stock': return 'low-stock';
      default: return 'out-stock';
    }
  }
}
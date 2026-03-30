import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/item.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchTerm: string = '';
  searchResults: InventoryItem[] = [];
  showAll: boolean = true;

  constructor(private inventoryService: InventoryService) {
    this.showAllItems();
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.showAllItems();
      return;
    }
    this.searchResults = this.inventoryService.searchByName(this.searchTerm);
    this.showAll = false;
  }

  showAllItems(): void {
    this.searchResults = this.inventoryService.getAllItems();
    this.showAll = true;
    this.searchTerm = '';
  }

  showPopularItems(): void {
    this.searchResults = this.inventoryService.getPopularItems();
    this.showAll = false;
    this.searchTerm = '';
  }
}
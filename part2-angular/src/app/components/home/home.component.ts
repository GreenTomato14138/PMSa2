import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/item.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  popularItems: InventoryItem[] = [];
  allItemsCount: number = 0;

  constructor(private inventoryService: InventoryService) {
    this.popularItems = this.inventoryService.getPopularItems();
    this.allItemsCount = this.inventoryService.getAllItems().length;
  }
}
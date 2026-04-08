/**
 * PROG2005 Part 2 - Aether Inventory
 * Author: Boyuan_Liu
 * Student ID: 24832410
 */
import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  totalItems: number = 0;
  hotItemsCount: number = 0;
  categories: string[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    const items = this.inventoryService.getAllItems();
    this.totalItems = items.length;
    this.hotItemsCount = this.inventoryService.getHotItems().length;
    this.categories = [...new Set(items.map(item => item.category))];
  }
}
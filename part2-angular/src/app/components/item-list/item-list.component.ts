import { Component, Input } from '@angular/core';
import { InventoryItem } from '../../models/item.model';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent {
  @Input() items: InventoryItem[] = [];
  @Input() showActions: boolean = true; // whether to show edit/delete buttons
}
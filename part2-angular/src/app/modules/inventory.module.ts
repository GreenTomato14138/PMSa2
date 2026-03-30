import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomeComponent } from '../components/home/home.component';
import { ItemFormComponent } from '../components/item-form/item-form.component';
import { ItemListComponent } from '../components/item-list/item-list.component';
import { SearchComponent } from '../components/search/search.component';
import { PrivacyComponent } from '../components/privacy/privacy.component';
import { HelpComponent } from '../components/help/help.component';

@NgModule({
  declarations: [
    HomeComponent,
    ItemFormComponent,
    ItemListComponent,
    SearchComponent,
    PrivacyComponent,
    HelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class InventoryModule { }
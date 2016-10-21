import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { SeedComponent } from './seed.component';

@NgModule({
  imports: [ CommonModule, FormsModule ],
  declarations: [ SeedComponent ],
  exports: [ SeedComponent ]
})
export class SeedModule { }

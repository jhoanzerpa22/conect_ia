import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

// Component
import { PassCreateRoutingModule } from "./pass-create-routing.module";
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { ToastsResetContainer } from './toasts-container.component';

@NgModule({
  declarations: [
    BasicComponent,
    CoverComponent,
    ToastsResetContainer
  ],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    NgbToastModule,
    FormsModule,
    PassCreateRoutingModule
  ]
})
export class PassCreateModule { 
  
}

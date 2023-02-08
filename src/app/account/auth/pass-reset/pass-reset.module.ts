import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Component
import { PassResetRoutingModule } from "./pass-reset-routing.module";
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { ToastsRecoveryContainer } from './toasts-container.component';

@NgModule({
  declarations: [
    BasicComponent,
    CoverComponent,
    ToastsRecoveryContainer
  ],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    NgbToastModule,
    FormsModule,
    PassResetRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PassResetModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
 }

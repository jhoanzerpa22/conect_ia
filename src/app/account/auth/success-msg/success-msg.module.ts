import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Component
import { SuccessMsgRoutingModule } from "./success-msg-routing.module";
import { CoverComponent } from './cover/cover.component';
import { BasicComponent } from './basic/basic.component';
import { PasswordComponent } from './password/password.component';

@NgModule({
  declarations: [
    CoverComponent,
    BasicComponent,
    PasswordComponent
  ],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    SuccessMsgRoutingModule
  ]
})
export class SuccessMsgModule { }

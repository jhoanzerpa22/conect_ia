import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbProgressbarModule, NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

// Ng Search 
import { Ng2SearchPipeModule } from 'ng2-search-filter';

// Feather Icon
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
// Simple bar
import { SimplebarAngularModule } from 'simplebar-angular';
// Ck Editer
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// Flat Picker
import { FlatpickrModule } from 'angularx-flatpickr';
// File Uploads
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
// Ng Select
import { NgSelectModule } from '@ng-select/ng-select';

// Load Icon
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

import { ToastsProjectContainer } from './toasts-container.component';

// Component Pages
import { ProjectsRoutingModule } from './projects-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ListComponent } from './list/list.component';
import { OverviewComponent } from './overview/overview.component';
import { CreateComponent } from './create/create.component';
import { TypeComponent } from './create/type/type.component';
import { Step1Component } from "./create/step1/step1.component";
// Ngx Sliders
import { NgxSliderModule } from '@angular-slider/ngx-slider';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [
    ListComponent,
    OverviewComponent,
    CreateComponent,
    TypeComponent,
    Step1Component,
    ToastsProjectContainer
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbProgressbarModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbPaginationModule,
    FeatherModule.pick(allIcons),
    SimplebarAngularModule,
    CKEditorModule,
    FlatpickrModule,
    DropzoneModule,
    NgSelectModule,
    ProjectsRoutingModule,
    SharedModule,
    NgxSliderModule,
    Ng2SearchPipeModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
 }

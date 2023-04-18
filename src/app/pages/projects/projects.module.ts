import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbProgressbarModule, NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTypeaheadModule, NgbAccordionModule, NgbCollapseModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

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
import { InstallationsComponent } from "./installations/installations.component";import { InstallationsTypeComponent } from "./create/type/installations/installations.component";
import { AreasComponent } from "./areas/areas.component";
import { ProjectAnalityComponent } from "./project-anality/project-anality.component";
import { ConfigComponent } from "./config/config.component";
import { BodyLegalTypeComponent } from "./create/type/body-legal/body-legal.component";
import { BodyLegalDetailComponent } from "./create/type/body-legal/detail/body-legal-detail.component";
import { ComplianceComponent } from "./create/compliance/compliance.component";
import { ComplianceDetailComponent } from "./create/compliance/detail/compliance-detail.component";
import { ComplianceFollowComponent } from "./create/compliance/follow/follow.component";

// Ngx Sliders
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {A11yModule} from '@angular/cdk/a11y';

import {
  MatTreeModule,
} from '@angular/material/tree';
import {
  MatTableModule
} from '@angular/material/table';
import {
  MatSelectModule
} from '@angular/material/select';
import {
  MatPaginatorModule
} from '@angular/material/paginator';
import {
  MatExpansionModule
} from '@angular/material/expansion';

import { CountToModule } from 'angular-count-to';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
// Apex Chart Package
import { NgApexchartsModule } from 'ng-apexcharts';
// Swiper Slider
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';

import { WidgetModule } from '../../shared/widget/widget.module';

/*
import {
  MatExpansionModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatSelectModule,
  MatTableModule,
  MatTreeModule,
} from '@angular/material';*/

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
    ToastsProjectContainer,
    InstallationsComponent,
    AreasComponent,
    ProjectAnalityComponent,
    InstallationsTypeComponent,
    BodyLegalTypeComponent,
    BodyLegalDetailComponent,
    ComplianceComponent,
    ComplianceDetailComponent,
    ComplianceFollowComponent,
    ConfigComponent
  ],
  imports: [
    CommonModule,
    NgbToastModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbProgressbarModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbPaginationModule,
    FeatherModule.pick(allIcons),
    CountToModule,
    LeafletModule,
    NgApexchartsModule,
    NgxUsefulSwiperModule,
    WidgetModule,
    SimplebarAngularModule,
    CKEditorModule,
    FlatpickrModule,
    DropzoneModule,
    NgSelectModule,
    ProjectsRoutingModule,
    NgbTypeaheadModule,
    NgbAccordionModule, 
    NgbCollapseModule,
    SharedModule,
    NgxSliderModule,
    Ng2SearchPipeModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatTreeModule,
    ScrollingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
 }

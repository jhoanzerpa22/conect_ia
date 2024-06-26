import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbProgressbarModule, NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTypeaheadModule, NgbAccordionModule, NgbCollapseModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

// Ui Switch
import { UiSwitchModule } from 'ngx-ui-switch';
// Color Picker
import { ColorPickerModule } from 'ngx-color-picker';
// Mask
import { NgxMaskModule } from 'ngx-mask';
//Wizard
import { ArchwizardModule } from 'angular-archwizard';

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

import { ToastsNormsContainer } from './toasts-container.component';

// Component Pages
import { NormsRoutingModule } from './norms-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { NormsComponent } from './norms.component';
import { ArticlesComponent } from './articles/articles.component';
import { SubArticlesComponent } from './sub-articles/sub-articles.component';

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
    NormsComponent,
    ArticlesComponent,
    SubArticlesComponent,
    ToastsNormsContainer
  ],
  entryComponents: [
    ArticlesComponent,
    SubArticlesComponent
  ],
  exports: [
    ArticlesComponent
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
    NormsRoutingModule,
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
    ScrollingModule,
    UiSwitchModule,
    ColorPickerModule,
    NgxMaskModule.forRoot(),
    ArchwizardModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NormsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
 }

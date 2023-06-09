import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { BodyLegalTypeModel } from './body-legal.model';
import { BodyLegal } from './data';
import { BodyLegalService } from './body-legal.service';
import { NgbdBodyLegalTypeSortableHeader, SortEvent } from './body-legal-sortable.directive';
import { ProjectsService } from '../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from './toast-service';

@Component({
  selector: 'app-library',
  templateUrl: './body-legal.component.html',
  styleUrls: ['./body-legal.component.scss'],
  providers: [BodyLegalService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class BodyLegalTypeComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  BodyLegalData!: BodyLegalTypeModel[];
  checkedList: any;
  masterSelected!: boolean;
  BodyLegalDatas: any;

  // Table data
  BodyLegalList!: Observable<BodyLegalTypeModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdBodyLegalTypeSortableHeader) headers!: QueryList<NgbdBodyLegalTypeSortableHeader>;

  constructor(private modalService: NgbModal, public service: BodyLegalService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
    this.BodyLegalList = service.bodylegal$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Biblioteca' },
      { label: 'Cuerpos Legales', active: true }
    ];

    this.fetchData();

    /**
     * fetches data
     */
    this.BodyLegalList.subscribe(x => {
      this.BodyLegalDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.BodyLegalData = BodyLegal;
  //   this.BodyLegalDatas = Object.assign([], this.BodyLegalData);
  // }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService./*getBodyLegalALl(this.project_id, 1, 10)*/getBodyLegal(1).pipe().subscribe(
        (data: any) => {
          this.service.bodylegal_data = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  // PreLoader
  showPreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0.8";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "visible";
    }
  }

  // PreLoader
  hidePreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
    }
  }

}

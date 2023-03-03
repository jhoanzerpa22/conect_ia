import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { InstallationsTypeModel } from './installations.model';
import { Installations } from './data';
import { InstallationsService } from './installations.service';
import { NgbdInstallationsTypeSortableHeader, SortEvent } from './installations-sortable.directive';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../../../toast-service';

@Component({
  selector: 'app-installations-type',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.scss'],
  providers: [InstallationsService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class InstallationsTypeComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  InstallationData!: InstallationsTypeModel[];
  checkedList: any;
  masterSelected!: boolean;
  InstallationDatas: any;

  project_id: any = '';

  // Table data
  InstallationList!: Observable<InstallationsTypeModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdInstallationsTypeSortableHeader) headers!: QueryList<NgbdInstallationsTypeSortableHeader>;

  constructor(private modalService: NgbModal, public service: InstallationsService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
    this.InstallationList = service.installations$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Vinculación'},
      { label: 'Instalaciones y Procesos', active: true }
    ];

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.fetchData();
    });

    /**
     * fetches data
     */
    this.InstallationList.subscribe(x => {
      this.InstallationDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.InstallationData = Installation;
  //   this.InstallationDatas = Object.assign([], this.InstallationData);
  // }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getInstallations(this.project_id).pipe().subscribe(
        (data: any) => {
          this.service.installations_data = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }

  /**
  * Confirmation mail model
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
      this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          this.fetchData();
          document.getElementById('lj_'+id)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        });
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

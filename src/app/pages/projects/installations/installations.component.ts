import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { InstallationsModel } from './installations.model';
import { Installations } from './data';
import { InstallationsService } from './installations.service';
import { NgbdInstallationsSortableHeader, SortEvent } from './installations-sortable.directive';
import { ProjectsService } from '../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-installations',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.scss'],
  providers: [InstallationsService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class InstallationsComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  installationForm!: UntypedFormGroup;
  InstallationData!: InstallationsModel[];
  checkedList: any;
  masterSelected!: boolean;
  InstallationDatas: any;

  project_id: any = '';

  // Table data
  InstallationList!: Observable<InstallationsModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdInstallationsSortableHeader) headers!: QueryList<NgbdInstallationsSortableHeader>;

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
      { label: 'Instalaciones y Procesos', active: true }
    ];

    /**
     * Form Validation
     */
    this.installationForm = this.formBuilder.group({
      ids: [''],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });

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
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.installationForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.installationForm.controls;
  }

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
  * Save saveInstallation
  */
  saveInstallation() {
    if (this.installationForm.valid) {
      
      this.showPreLoader();
      if (this.installationForm.get('ids')?.value) {
        this.InstallationDatas = this.InstallationDatas.map((data: { id: any; }) => data.id === this.installationForm.get('ids')?.value ? { ...data, ...this.installationForm.value } : data)
      } else {
        const nombre = this.installationForm.get('nombre')?.value;
        const descripcion = this.installationForm.get('descripcion')?.value;
        this.InstallationDatas.push({
          nombre,
          descripcion
        });
        
        const installation: any = {
          nombre: nombre,
          descripcion: descripcion,
          proyectoId: this.project_id
        };
        
        this.projectsService.createInstallation(installation).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });
           this.fetchData();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
          this.modalService.dismissAll()
        });

      }
    }
    this.modalService.dismissAll();
    setTimeout(() => {
      this.installationForm.reset();
    }, 1000);
    this.submitted = true
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.InstallationDatas.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  /**
  * Confirmation mail model
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  /**
  * Multiple Delete
  */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    }
    else {
      Swal.fire({ text: 'Seleccione al menos una casilla de verificación', confirmButtonColor: '#299cdb', });
    }
    this.checkedValGet = checkedVal;

  }

  // Delete Data
  deleteData(id: any) {
    if (id) {
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
    else {
      this.checkedValGet.forEach((item: any) => {
        this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {
          //this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          this.fetchData();
          document.getElementById('lj_'+item)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        });
      });
    }
  }

  /**
  * Open modal
  * @param content modal content
  */
  editModal(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    //updateBtn.innerHTML = "Editar";
    updateBtn.style.visibility = "hidden";
    var listData = this.InstallationDatas.filter((data: { id: any; }) => data.id === id);
    this.installationForm.controls['nombre'].setValue(listData[0].nombre);
    this.installationForm.controls['descripcion'].setValue(listData[0].descripcion);
    this.installationForm.controls['ids'].setValue(listData[0].id);
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

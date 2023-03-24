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
  installation_id: any = '';
  installation_name: any = ''; 
  areas: any = [];
  area_id_select: any = [];

  items: any = [];

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
      descripcion: ['', [Validators.required]],
      area: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.installation_id = params['idInstallation'] ? params['idInstallation'] : null;
      this.installation_name = params['nameInstallation'] ? params['nameInstallation'] : null;

      if(this.installation_id){

        let crumb: any = [{label: 'Proyecto', active: false},{label: 'Instalaciones y Procesos', active: false}];
        let bread: any = this.installation_name.split('||');
        
        bread.forEach((item: any) => {
          crumb.push({label: item, active: false});
        });

        crumb[bread.length + 1].active = true;

        this.breadCrumbItems = crumb;
        /*this.breadCrumbItems = [
          { label: 'Proyecto' },
          { label: 'Instalaciones y Procesos' },
          { label: this.installation_name, active: true }
        ];*/

        this.fetchDataItems();
      }else{
        this.fetchData();
      }
      this.getAreas();
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

  goItems(data: any){
    let name_format: any = this.installation_id ? this.installation_name+'||'+data.nombre : data.nombre;
    this._router.navigate(['/projects/'+this.project_id+'/installations/'+data.id+'/'+name_format]);
  }

  /**
   * Form data get
   */
  get form() {
    return this.installationForm.controls;
  }

  private getAreas() {
    
    this.showPreLoader();
      this.projectsService.getAreas(this.project_id).pipe().subscribe(
        (data: any) => {
          //this.service.bodylegal_data = data.data;
          this.areas = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
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

  private fetchDataItems() {
    
    this.showPreLoader();
      this.projectsService.getInstallationsItems(this.installation_id).pipe().subscribe(
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

  selectArea(event: any){

    if(this.area_id_select.length > 0){
    
    let vacio = event.target.value > 0 ? 1 : 0;
    
    this.area_id_select.splice(0 + vacio, (this.area_id_select.length-(1+vacio)));
    
      if(event.target.value > 0){
        
        const index = this.areas.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.areas[index].nombre;

        this.area_id_select[0] = {value: event.target.value, label: nombre};
      }

    }else{
      
      const index2 = this.areas.findIndex(
        (co: any) =>
          co.id == event.target.value
      );

      let nombre2 = this.areas[index2].nombre;
      this.area_id_select.push({value: event.target.value, label: nombre2});
    }

    //this.area_id_select = event.target.value;
      this.items = [];
      this.getChildren(event.target.value);
  }

  selectAreaChildren(event: any, parent?: any){
    //this.addElement(parent);
      let vacio = event.target.value > 0 ? 2 : 1;
    
      this.area_id_select.splice((parent+vacio), (this.area_id_select.length-(parent+vacio)));

      if(event.target.value > 0){
        
        const index = this.items[parent].options.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.items[parent].options[index].nombre;

        this.area_id_select[parent+1] = {value: event.target.value, label: nombre};
      }

    //this.area_id_select = event.target.value;
      this.items.splice((parent+1), (this.items.length-(parent+1)));
      this.items[parent].value = event.target.value;
      this.getChildren(event.target.value);
  }

  getChildren(padre_id: any){
    if(padre_id > 0){
      this.showPreLoader();
      this.projectsService.getAreasItems(padre_id).pipe().subscribe(
        (data: any) => {
          if(data.data.length > 0){
            this.items.push({value: null, options: data.data});
          }
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }
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
          proyectoId: this.installation_id ? null : this.project_id,
          installationId: this.installation_id ? this.installation_id : null
        };
        
        this.projectsService.createInstallation(installation).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           if(this.installation_id){
            this.fetchDataItems();
           }else{
            this.fetchData();
           }
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
          
          if(this.installation_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }
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
          if(this.installation_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }

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

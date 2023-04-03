import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { AreasModel } from './areas.model';
import { Areas } from './data';
import { AreasService } from './areas.service';
import { NgbdAreasSortableHeader, SortEvent } from './areas-sortable.directive';
import { ProjectsService } from '../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss'],
  providers: [AreasService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class AreasComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  areaForm!: UntypedFormGroup;
  AreaData!: AreasModel[];
  checkedList: any;
  masterSelected!: boolean;
  AreaDatas: any;

  project_id: any = '';
  area_id: any = '';
  area_name: any = '';
  subtitle: any = 'Areas Administrativas';

  // Table data
  AreaList!: Observable<AreasModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdAreasSortableHeader) headers!: QueryList<NgbdAreasSortableHeader>;

  constructor(private modalService: NgbModal, public service: AreasService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
    this.AreaList = service.areas$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Areas Administrativas', active: true }
    ];

    /**
     * Form Validation
     */
    this.areaForm = this.formBuilder.group({
      ids: [''],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.area_id = params['idArea'] ? params['idArea'] : null;
      this.area_name = params['nameArea'] ? params['nameArea'] : null;

      if(this.area_id){

        let crumb: any = [{label: 'Proyecto', active: false},{label: 'Areas Administrativas', active: false}];
        let bread: any = this.area_name.split('||');
        
        bread.forEach((item: any) => {
          crumb.push({label: item, active: false});
        });

        crumb[bread.length + 1].active = true;
        this.subtitle = crumb[bread.length + 1].label;

        this.breadCrumbItems = crumb;
        /*this.breadCrumbItems = [
          { label: 'Proyecto' },
          { label: 'Areas Administrativas' },
          { label: this.area_name, active: true }
        ];*/

        this.fetchDataItems();
      }else{
        this.fetchData();
      }
    });

    /**
     * fetches data
     */
    this.AreaList.subscribe(x => {
      this.AreaDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.AreaData = Area;
  //   this.AreaDatas = Object.assign([], this.AreaData);
  // }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.areaForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
  }

  goItems(data: any){
    let name_format: any = this.area_id ? this.area_name+'||'+data.nombre : data.nombre;
    this._router.navigate(['/projects/'+this.project_id+'/areas/'+data.id+'/'+name_format]);
  }

  /**
   * Form data get
   */
  get form() {
    return this.areaForm.controls;
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getAreas(this.project_id).pipe().subscribe(
        (data: any) => {
          this.service.areas_data = data.data;
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
      this.projectsService.getAreasItems(this.area_id).pipe().subscribe(
        (data: any) => {
          this.service.areas_data = data.data;
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
  * Save saveArea
  */
  saveArea() {
    if (this.areaForm.valid) {
      
      this.showPreLoader();
      if (this.areaForm.get('ids')?.value) {
        this.AreaDatas = this.AreaDatas.map((data: { id: any; }) => data.id === this.areaForm.get('ids')?.value ? { ...data, ...this.areaForm.value } : data)
      } else {
        const nombre = this.areaForm.get('nombre')?.value;
        const descripcion = this.areaForm.get('descripcion')?.value;
        this.AreaDatas.push({
          nombre,
          descripcion
        });
        
        const area: any = {
          nombre: nombre,
          descripcion: descripcion,
          proyectoId: this.area_id ? null : this.project_id,
          areaId: this.area_id ? this.area_id : null
        };
        
        this.projectsService.createArea(area).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           if(this.area_id){
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
      this.areaForm.reset();
    }, 1000);
    this.submitted = true
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.AreaDatas.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  isChecked(){
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
      return true;
    }else{
      return false;
    }
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
      this.projectsService.deleteArea(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          if(this.area_id){
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
        this.projectsService.deleteArea(id)
      .subscribe(
        response => {
          //this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          if(this.area_id){
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
    var listData = this.AreaDatas.filter((data: { id: any; }) => data.id === id);
    this.areaForm.controls['nombre'].setValue(listData[0].nombre);
    this.areaForm.controls['descripcion'].setValue(listData[0].descripcion);
    this.areaForm.controls['ids'].setValue(listData[0].id);
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

import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { TokenStorageService } from '../../../core/services/token-storage.service';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface FoodNode {
  id: number;
  nombre: string;
  area?: string;
  area_principal?: string;
  descripcion?: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    id: 1,
    nombre: 'Instalacion 1',
    descripcion: ''
  }/*,
  {
    id: 2,
    nombre: 'Instalacion 2',
    children: [
      {
        id: 21,
        nombre: 'Instalacion 2-1',
        children: [
          {id: 211,nombre: 'Instalacion 2-1-1'}
        ]
      }
    ]
  }*/
];
@Component({
  selector: 'app-installations',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.scss'],
  providers: [InstallationsService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class InstallationsComponent implements OnInit{

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  installationForm!: UntypedFormGroup;
  InstallationData!: InstallationsModel[];
  checkedList: any;
  masterSelected!: boolean;
  InstallationDatas: any;
  userData: any;
  installations_all: any = [];

  project_id: any = '';
  installation_id: any = '';
  installation_name: any = ''; 
  areas: any = [];
  areas_all: any = [];
  areas_template: any = [];
  area_id_select: any = [];
  area_id: any = '';
  area_select: any = [];
  subtitle: any = 'Elementos y actividades';//'Instalaciones y procesos';

  items: any = [];
  tree_data: any = [];
  filtro: string = '';

  // Table data
  InstallationList!: Observable<InstallationsModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdInstallationsSortableHeader) headers!: QueryList<NgbdInstallationsSortableHeader>;

  displayedColumns: string[] = ['nombre','area_principal', 'area', 'descripcion', 'accion'];

  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      nombre: node.nombre,
      area: node.area,
      descripcion: node.descripcion,
      area_principal: node.area_principal,
      level: level
    };
  }

  treeControl = new FlatTreeControl<any/*ExampleFlatNode*/>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, 
      node => node.expandable, node => node.children);

      dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private modalService: NgbModal, public service: InstallationsService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService, private TokenStorageService: TokenStorageService) {
    this.InstallationList = service.installations$;
    this.total = service.total$;
  }

  hasChild = (_: number, node: any/*ExampleFlatNode*/) => node.expandable;

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Elementos y actividades', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    /**
     * Form Validation
     */
    this.installationForm = this.formBuilder.group({
      ids: [''],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      //area: ['']
    });

    this.project_id = this.userData._id;
      
    this.route.params.subscribe(params => {
    //this.project_id = params['id'];
    this.installation_id = params['idInstallation'] ? params['idInstallation'] : null;
      this.installation_name = params['nameInstallation'] ? params['nameInstallation'] : null;

      if(this.installation_id){

        let crumb: any = [{label: 'Proyecto', active: false},{label: 'Elementos y actividades', active: false}];
        let bread: any = this.installation_name.split('||');
        
        bread.forEach((item: any) => {
          crumb.push({label: item, active: false});
        });

        crumb[bread.length + 1].active = true;
        this.subtitle = crumb[bread.length + 1].label;

        this.breadCrumbItems = crumb;
        /*this.breadCrumbItems = [
          { label: 'Proyecto' },
          { label: 'Instalaciones y Procesos' },
          { label: this.installation_name, active: true }
        ];*/

        //this.fetchDataItems();
        this.getInstallations();
      }else{
        //this.fetchData();
        this.getInstallations();
      }
      this.getAreas();
      this.getAreasAll();
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
  openModal(content: any, instalationID?: any, instalacionName?: any) {
    this.submitted = false;
    this.installationForm.reset();
    this.area_id = '';
    this.area_select = [];

    for (let at in this.areas_template) {
      this.areas_template[at].valor = null;
      this.areas_template[at].disabled = false;
    }

    if(this.areas_all.length < 1){
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'No se puede crear un elemento o actividad sin antes haber creado al menos un área administrativa',
        showConfirmButton: true,
        timer: 5000,
      });
    }else{
      this.installation_id = instalationID;
      this.installation_name = instalacionName;
      //this.installationForm.controls['area'].setValue('');
     
      if(instalationID){
        const index = this.installations_all.findIndex(
          (co: any) =>
            co.id == instalationID
        );

        if(index != -1){

          this.area_id = this.installations_all[index].area_id;
          if(this.installations_all[index].area_id){
            this.setArea(this.installations_all[index].area_id, true);
          }
        }
      }
      this.modalService.open(content, { size: 'lg', centered: true });
    }
  }

  goItems(data: any){
    let name_format: any = this.installation_id ? this.installation_name+'||'+data.nombre : data.nombre;
    this._router.navigate(['/projects/config/'+this.project_id+'/installations/'+data.id+'/'+name_format]);
  }

  /**
   * Form data get
   */
  get form() {
    return this.installationForm.controls;
  }

  private getAreas() {
    
    this.showPreLoader();
      this.projectsService.getAreasUser()/*getAreas(this.project_id)*/.pipe().subscribe(
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

  private getItems(hijos: any, padre: any){
    let tree_data: any = [];
    
    this.areas_template.push({id: padre, valor: null, disabled: false});

    for (let d in hijos) {
        tree_data.push({ id: hijos[d].id, nombre: hijos[d].nombre, descripcion: hijos[d].descripcion, padre: padre, hijas: hijos[d].hijas.length > 0 ? true : false/*this.getItems(hijos[d].hijas, hijos[d].id) : null*/ });
        
        this.areas_all.push({ id: hijos[d].id, nombre: hijos[d].nombre, descripcion: hijos[d].descripcion, padre: padre, hijas: hijos[d].hijas.length > 0 ? true : false});
        
        if(hijos[d].hijas.length > 0){
          this.getItems(hijos[d].hijas, hijos[d].id);
        }
    }
    return tree_data;
  }

  private getAreasAll(){
    this.showPreLoader();
      this.projectsService.getAreasAll(this.project_id).pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          this.areas_all = [];
          
          if(obj.length > 0){
            this.areas_template.push({id: null, valor: null, disabled: false});
            for (let c in obj) {
              let padre: any = obj[c].padre;

              this.areas_all.push({ id: padre.id, nombre: padre.nombre, descripcion: padre.descripcion, padre: null, hijas: padre.hijas.length > 0 ? true : false/*this.getItems(padre.hijas, padre.id) : null*/ });

              if(padre.hijas.length > 0){
                this.getItems(padre.hijas, padre.id);
              }
            }
          }
          
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

  getAreasTemplate(padre: any){
    return this.areas_all.filter((a: any) => a.padre == padre);
  }

  showSelect(padre: any){
    const index = this.area_select.findIndex(
      (co: any) =>
        co.padre == padre
    ); 
    return index != -1;
  }

  selectAreaTemplate(event: any, position: any){

    this.areas_template[position].valor = event.target.value;
    
    this.area_id = event.target.value;

    if(this.area_select.length > 0){
    
      const index3 = this.area_select.findIndex(
        (co: any) =>
          co.position == position
      );

      if(index3 == -1){
        this.area_select.push({padre: event.target.value, position: position});
      }else{
        
        this.area_select[index3].padre = event.target.value;
        for (let p = 0; p < this.area_select.length; p++) {
          const element = this.area_select[p];

          if(position < this.area_select[p].position){
            this.area_select.splice(p, 1);
          }

        }
      }

    }else{
      
      const index2 = this.areas_all.findIndex(
        (co: any) =>
          co.id == event.target.value
      );

      let nombre2 = this.areas_all[index2].nombre;
      
      this.area_select.push({padre: event.target.value, position: position});
    }

  }

  setAreaPadre(area: any){

    const index = this.areas_all.findIndex(
      (co: any) =>
        co.id == area
    );
  
    if(index != -1){

      const index2 = this.areas_template.findIndex((t: any) =>
        t.id == this.areas_all[index].padre 
      );
      this.areas_template[index2].valor = area;
      this.areas_template[index2].disabled = true;

      this.area_select.push({padre: this.areas_all[index].id, position: index});

      if(this.areas_all[index].padre){
        this.setAreaPadre(this.areas_all[index].padre);
      }
      
    }
  }

  setArea(area: any, disabled: boolean){

    const index = this.areas_all.findIndex(
      (co: any) =>
        co.id == area
    );
  
    if(index != -1){

      this.area_select.push({padre: this.areas_all[index].id, position: index});

      const index2 = this.areas_template.findIndex((t: any) =>
        t.id == this.areas_all[index].padre 
      );
      this.areas_template[index2].valor = area;
      this.areas_template[index2].disabled = disabled;

      if(this.areas_all[index].padre){
        this.setAreaPadre(this.areas_all[index].padre);
      }
      
    }

    //console.log('setArea',this.area_select);
    //console.log('setAreaTemplate',this.areas_template);
  }

  getAreaPrincipal(area: any, area_nombre?: any): Promise<any>{
    const index = this.areas_all.findIndex(
      (co: any) =>
        co.id == area
    );
  
    if(index != -1){
      if(this.areas_all[index].padre){
        return this.getAreaPrincipal(this.areas_all[index].padre, this.areas_all[index].nombre);
      }else{
        return this.areas_all[index].nombre;
      }
    }else{
      return area_nombre ? area_nombre : '';
    }

  }

  isSelected(i: number, valor: number){
    const index = this.areas_template.findIndex(
      (co: any) =>
        co.id == (i > 0 ? i : null) && co.valor == valor
    );
  
    if(index != -1){
      return true;//this.area_select[index].padre;
    }else{
      return false;
    }
  }
  
  isDisabled(i: number){
    const index = this.areas_template.findIndex(
      (co: any) =>
        co.id == (i > 0 ? i : null) && co.disabled == true
    );
  
    if(index != -1){
      return true;
    }else{
      return false;
    }
  }

  private getInstallations(){
    this.showPreLoader();
      this.projectsService.getInstallationsAll(this.project_id).pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let tree_data: any = [];
          this.installations_all = [];
          for (let c in obj) {
            let padre: any = obj[c].padre;

            let area_principal: any = padre.area ? this.getAreaPrincipal(padre.area.id, padre.area.nombre) : '';
            
              this.installations_all.push({ id: padre.id, nombre: padre.nombre, area: padre.area ? padre.area.nombre : '', area_id: padre.area ? padre.area.id : '', area_principal: area_principal, descripcion: padre.descripcion });
              
              tree_data.push({ id: padre.id, nombre: padre.nombre, area: padre.area ? padre.area.nombre : '', area_id: padre.area ? padre.area.id : '', area_principal: area_principal, descripcion: padre.descripcion, children: padre.hijas.length > 0 ? this.getHijas(padre.hijas) : null });
          }
          this.tree_data = tree_data;
          this.service.installations_data = tree_data;    
          this.dataSource.data = tree_data;
          //console.log('data',tree_data);

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

  aplicarFiltro() {
    let filterText = this.filtro;
    this.dataSource.data = this.tree_data.filter((t: any) => t.nombre.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.descripcion.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.area.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.area_principal.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
  }
  
  private getHijas(hijos: any){
    let tree_data: any = [];
    for (let d in hijos) {
      
      let area_principal: any = hijos[d].area ? this.getAreaPrincipal(hijos[d].area.id, hijos[d].area.nombre) : '';

        this.installations_all.push({ id: hijos[d].id, nombre: hijos[d].nombre, area: hijos[d].area ? hijos[d].area.nombre : '', area_id: hijos[d].area ? hijos[d].area.id : '', area_principal: area_principal,descripcion: hijos[d].descripcion });

        tree_data.push({ id: hijos[d].id, nombre: hijos[d].nombre, area: hijos[d].area ? hijos[d].area.nombre : '', area_id: hijos[d].area ? hijos[d].area.id : '', area_principal: area_principal, descripcion: hijos[d].descripcion, children: hijos[d].hijas.length > 0 ? this.getHijas(hijos[d].hijas) : null });
    }
    return tree_data;
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getInstallationsUser()/*getInstallations(this.project_id)*/.pipe().subscribe(
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
      
      const nombre = this.installationForm.get('nombre')?.value;
      const descripcion = this.installationForm.get('descripcion')?.value;
        
      let area_id = this.area_id;//this.area_id_select[this.area_id_select.length - 1].value;
        
        const installation: any = {
          nombre: nombre,
          descripcion: descripcion,
          //proyectoId: this.installation_id ? null : this.project_id,
          installationId: this.installation_id ? this.installation_id : null,
          areaId: area_id ? area_id : null
        };

      if(area_id){
        
      if (this.installationForm.get('ids')?.value) {
        
        const idInstallation = this.installationForm.get('ids')?.value;
        this.InstallationDatas = this.InstallationDatas.map((data: { id: any; }) => data.id === this.installationForm.get('ids')?.value ? { ...data, ...this.installationForm.value } : data)

        this.projectsService.updateInstallation(installation, idInstallation).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           this.getInstallations();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
          this.modalService.dismissAll()
        });

      } else {
        this.InstallationDatas.push({
          nombre,
          descripcion
        });

        this.projectsService.createInstallation(installation).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           /*if(this.installation_id){
            this.fetchDataItems();
           }else{
            this.fetchData();
           }*/         
           this.getInstallations();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
          this.modalService.dismissAll()
        });

      }
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
      this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          /*if(this.installation_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }*/
          this.getInstallations();
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
          /*if(this.installation_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }*/
          this.getInstallations();

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
    this.modalService.open(content, { size: 'lg', centered: true });
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Editar";
    //updateBtn.style.visibility = "hidden";
    var listData = this.installations_all.filter((data: { id: any; }) => data.id === id);
    this.installationForm.controls['nombre'].setValue(listData[0].nombre);
    this.installationForm.controls['descripcion'].setValue(listData[0].descripcion);
    this.installationForm.controls['ids'].setValue(listData[0].id);

    this.area_select = [];    
    this.area_id = listData[0].area_id;

    this.setArea(listData[0].area_id, false);

    /*const index2 = this.areas_all.findIndex(
      (co: any) =>
        co.id == listData[0].area_id
    );

    if(index2 != -1){
      //this.installationForm.controls['area'].setValue(listData[0].area_id);

      let nombre2 = this.areas_all[index2].nombre;
      //this.area_id_select.push({value: listData[0].area_id, label: nombre2});
    }*/
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

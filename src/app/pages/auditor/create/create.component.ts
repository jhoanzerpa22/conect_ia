import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastService } from '../toast-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Create Component
 */
export class CreateComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  typeCreate: boolean = false;
  createForm!: UntypedFormGroup;
  auditoriaForm!: UntypedFormGroup;
  nombreProyecto: any = '';
  descripcionProyecto: any = '';
  types: any = [{id: 1, nombre: 'Fiscalización'},{id: 2, nombre: 'Auditoria de Cumplimiento'},{id: 3, nombre: 'Auditoria interna ISO 14001'},{id: 4, nombre: 'Auditoria interna ISO 18001'},{id: 5, nombre: 'Auditoria interna ISO 9001'},{id: 6, nombre: 'Auditoria interna ISO 50001'},{id: 7, nombre: 'Auditoria externa ISO 14001'},{id: 8, nombre: 'Auditoria externa ISO 18001'},{id: 9, nombre: 'Auditoria externa ISO 9001'},{id: 10, nombre: 'Auditoria externa ISO 50001'},{id: 11, nombre: 'Auditoria corporativa'},{id: 12, nombre: 'Gemba'},{id: 13, nombre: 'Inspección planeada'},{id: 14, nombre: 'Inspección no planeada'}];
  submitted = false;
  installationForm!: UntypedFormGroup; 
  installations: any = [];
  areas: any = [];
  area_id_select: any = [];
  
  items: any = [];
  activeTab: number = 1;
  selectChecked: any = [];
  installations_select: any = [];

  public Editor = ClassicEditor;

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private projectsService: ProjectsService,public toastService: ToastService, private modalService: NgbModal) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Requisitos legales' },
      { label: 'Proyectos' },
      { label: 'Crear Proyecto', active: true }
    ];

    this.createForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['']
    });

    this.auditoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      tipo: [''],
      fecha_inicio: [''],
      fecha_termino: [''],
      entidad: [''],
      auditor: [''],
      ambito: ['']
    });

    this.installationForm = this.formBuilder.group({
      ids: [''],
      area: ['']
    });

    //this.getTypes();
    this.getAreas();
    //this.getInstallations();
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.createForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

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
      this.getInstallationsByAreaId(event.target.value);
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
      this.getInstallationsByAreaId(event.target.value);
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

  private getInstallationsByAreaId(area_id: any) {
    
    this.showPreLoader();
    this.installations = [];

      this.projectsService.getInstallationByAreaId(area_id)/*getInstallationsUser()*/.pipe().subscribe(
        (data: any) => {
          this.installations = data.data ? data.data : [];
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  finalizar(){
    this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Auditoria creada',
      showConfirmButton: true,
      timer: 5000,
    });
  }

  changeTab(active: number){
    // stop here if form is invalid
    
    this.activeTab = active;
    if (this.auditoriaForm.invalid) {
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Rellene todos los campos..',
        showConfirmButton: true,
        timer: 5000,
      });

      return;
    }else{
      //this.nombreProyecto = this.f['nombre'].value;
      //this.descripcionProyecto = this.f['descripcion'].value;
      if(this.activeTab == 3 && this.installations_select < 1){
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'No posee instalaciones vinculadas..',
          showConfirmButton: true,
          timer: 5000,
        });
  
        return;
      }

    }
  }

   siguiente(){
    // stop here if form is invalid
    if (this.auditoriaForm.invalid) {
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Rellene todos los campos..',
        showConfirmButton: true,
        timer: 5000,
      });

      return;
    }else{
      //this.nombreProyecto = this.f['nombre'].value;
      //this.descripcionProyecto = this.f['descripcion'].value;
      if(this.activeTab == 2 && this.installations_select < 1){
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'No posee instalaciones vinculadas..',
          showConfirmButton: true,
          timer: 5000,
        });
  
        return;
      }else{

        this.activeTab = this.activeTab + 1;
      }

    }
   }

   getTypes(){
    this.projectsService.getTypes().pipe().subscribe(
      (data: any) => {
        this.types = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   saveInstallation(){
    this.installations_select = this.selectChecked;
    this.modalService.dismissAll();
   }

  checkedValGet: any[] = [];
  onCheckboxChange(e: any) {
    //const checkArray: UntypedFormArray = this.taskForm.get('responsable') as UntypedFormArray;
    //checkArray.push(new UntypedFormControl(e.target.value));
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations.length; i++) {
        result = this.installations[i];
        checkedVal.push(result);
        if(this.installations[i].id == e.target.value){
          this.selectChecked.push(this.installations[i]);
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }

    //this.checkedValGet = checkedVal
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

   saveProject(type: any){

    const project: any = {
      nombre: this.nombreProyecto,
      descripcion: this.descripcionProyecto,
      tipoProyectoId: type
    };

    this.showPreLoader();

    this.projectsService.create(project).pipe().subscribe(
      (data: any) => {
        
        this.hidePreLoader();
        localStorage.setItem('toast', 'true');
        let proyecto: any = data.data;
        //this._router.navigate(['/pages/'+proyecto.id+'/steps']);
        this._router.navigate(['/projects/'+proyecto.id+'/project-anality']);
        //this._router.navigate(['/projects']);
    },
    (error: any) => {
      
      this.hidePreLoader();
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
    
   }

   /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.installationForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
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

import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
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
  project: any = {};
  
  items: any = [];
  activeTab: number = 1;
  selectChecked: any = [];
  installations_select: any = [];
  installations_select_group: any = [];
  showBodyLegal: boolean = false;
  showBodyLegalDetail: boolean = false;

  project_id: any = null;
  installation_id: any = '';
  installation_nombre: any = '';
  cuerpo_id: any = '';

  public Editor = ClassicEditor;

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private projectsService: ProjectsService,public toastService: ToastService, private modalService: NgbModal, private route: ActivatedRoute) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Auditoria' },
      { label: 'Crear Auditoria', active: true }
    ];

    this.createForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['']
    });

    this.auditoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      fecha_inicio: ['', [Validators.required]],
      fecha_termino: ['', [Validators.required]],
      entidad: [''],
      auditor: [''],
      ambito: ['']
    });

    this.installationForm = this.formBuilder.group({
      ids: [''],
      area: ['']
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      
      if(this.project_id > 0){
        this.getProject(params['id']);
      }
    });

    //this.getTypes();
    this.getAreas();
    //this.getInstallations();
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.auditoriaForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

   setValue(data:any){
    this.auditoriaForm.controls['nombre'].setValue(data.nombre);
    this.auditoriaForm.controls['descripcion'].setValue(data.descripcion);
    this.auditoriaForm.controls['tipo'].setValue(data.tipoAuditoriaId);
    this.auditoriaForm.controls['fecha_inicio'].setValue(data.fecha_inicio);
    this.auditoriaForm.controls['fecha_termino'].setValue(data.fecha_termino);
    this.auditoriaForm.controls['entidad'].setValue(data.entidad);
    this.auditoriaForm.controls['auditor'].setValue(data.auditor);
    this.auditoriaForm.controls['ambito'].setValue(data.ambito);
   }

   getProject(idProject?: any){
    this.projectsService.getById(idProject).pipe().subscribe(
      (data: any) => {
        this.project = data.data;
        this.setValue(data.data);
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
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

          setTimeout(() => {
            this.validChecked();
          }, 1400);

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  saveAuditoria(){

    if(!this.project_id){

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
      let nombreAuditoria: any = this.f['nombre'].value;
      let descripcionAuditoria: any = this.f['descripcion'].value;
      let tipoAuditoriaId: any = this.f['tipo'].value;
      let fecha_inicio: any = this.f['fecha_inicio'].value;
      let fecha_termino: any = this.f['fecha_termino'].value;
      let entidad: any = this.f['entidad'].value;
      let auditor: any = this.f['auditor'].value;
      let ambito: any = this.f['ambito'].value;
      
      const auditoria: any = {
        nombre: nombreAuditoria,
        descripcion: descripcionAuditoria,
        tipoAuditoriaId: tipoAuditoriaId,
        fecha_inicio: fecha_inicio,
        fecha_termino: fecha_termino,
        entidad: entidad,
        auditor: auditor,
        ambito: ambito,
        tipoProyectoId: 3
      };

      this.showPreLoader();

      this.projectsService.create(auditoria).pipe().subscribe(
        (data: any) => {
          
          this.hidePreLoader();
          localStorage.setItem('toast', 'true');
          let proyecto: any = data.data;

          this.project_id = proyecto.id;
          this.activeTab = this.activeTab + 1;
      },
      (error: any) => {
        
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
    }
    }else{
      this.activeTab = this.activeTab + 1;
    }
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
    if(/*this.activeTab == 2 && */this.installations_select < 1){
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
   
      this.selectChecked.forEach((x: any) => {
        const index2 = this.installations_select.findIndex(
          (co2: any) =>
          co2.id == x.id
        );

        if(index2 == -1){
          this.installations_select.push(x);
        }
      })

      this.installations_select_group = [];
      this.installations_select.forEach((x: any) => {
        /*if(!this.installations_select_group.hasOwnProperty(x.area.nombre)){
          this.installations_select_group[x.area.nombre] = {
            installations: []
          }
        }
        
        //Agregamos los datos de profesionales. 
        this.installations_select_group[x.area.nombre].installations.push({x});*/
        
        const index = this.installations_select_group.findIndex(
          (co: any) =>
            co.areaId == x.areaId
        );

        if(index == -1){
          this.installations_select_group.push({
            areaId: x.areaId, areaNombre: x.area.nombre, installations: [x]
          });
        }else{
          this.installations_select_group[index].installations.push(x);
        }
      })

      console.log('installationGroup',this.installations_select_group);
      console.log('installationSelect',this.installations_select);

    this.installations = [];
    this.selectChecked = [];

    this.modalService.dismissAll();
   }

  checkedValGet: any[] = [];
  onCheckboxChange(e: any) {
    //checkArray.push(new UntypedFormControl(e.target.value));
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations.length; i++) {
        result = this.installations[i];
        checkedVal.push(result);
        if(this.installations[i].id == e.target.value){
          const index = this.selectChecked.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectChecked.splice(index, 1);
          }else{
            this.selectChecked.push(this.installations[i]);
          }
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

  validChecked(){
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      const index = this.installations_select.findIndex(
        (ins: any) =>
          ins.id == checkboxes[j].id
      );

      if(index != - 1){
        checkboxes[j].checked = true;
        this.selectChecked.push(this.installations_select[index]);
      }/*else{
        checkboxes[j].checked = false;
      }*/
    }
  }

   vincular(data: any){
    this.installation_id = data.id;
    this.installation_nombre = data.nombre;

    this.showBodyLegal = true;
    this.showBodyLegalDetail = false;
   }

   backEvent(data: any){
    this.showBodyLegal = false;
    this.showBodyLegalDetail = false;
   }

   backEvent2(data: any){
    this.showBodyLegal = true;
    this.showBodyLegalDetail = false;
   }

   conectarEvent(data: any){
    this.cuerpo_id = data;
    this.showBodyLegal = false;
    this.showBodyLegalDetail = true;
   }

   /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    
    this.installations = [];
    this.selectChecked = [];

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

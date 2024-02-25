import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { MatTable } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// Drag and drop
import { DndDropEvent } from 'ngx-drag-drop';

import { DecimalPipe, Location } from '@angular/common';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl, Validators, FormArray } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel, HallazgoModel, TaskModel } from './task-control.model';
import { folderData } from './data';
import { RecentService } from './task-control.service';
import { NgbdRecentSortableHeader, SortEvent } from './task-control-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { WorkPlanService } from '../../../../../core/services/workPlan.service';
import { UserProfileService } from '../../../../../core/services/user.service';
import { TokenStorageService } from '../../../../../core/services/token-storage.service';
import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';
import * as moment from 'moment';

import { estadosData } from '../../../estados';

@Component({
  selector: 'app-task-control',
  templateUrl: './task-control.component.html',
  styleUrls: ['./task-control.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * TaskControlComponent
 */
export class TaskControlComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  project: any = {};
  evaluation: any = {};
  cuerpo_id: any = '';
  cuerpoLegal: any = '';
  installation_id: any = null;
  installation_id_select: any = [];
  installation_nombre: any = null;
  detail: any = [];
  installations: any = [];
  installations_articles: any = [];

  folderData!: DetailModel[];
  submitted = false;
  submittedNotify = false;
  folderForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  taskForm!: UntypedFormGroup;
  hallazgoForm!: UntypedFormGroup;
  evaluacionForm!: UntypedFormGroup;
  notifyForm!: UntypedFormGroup;
  TaskData!: DetailModel[];
  recentDatas: any;
  articulosDatas: any;
  TaskDatas: any/* = []*/;
  simpleDonutChart: any;
  public isCollapsed: any = [];
  isCollapseArray: any = ['Encabezado'];
  showEncabezado: boolean = true;

  // Table data
  recentData!: Observable<recentModel[]>;
  articulosData!: Observable<ArticulosModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdRecentSortableHeader) headers!: QueryList<NgbdRecentSortableHeader>;

  htmlString: any = "";
  showRow: any = [];

  items: any = [];
  hallazgos: any = [];
  evaluations: any = [];
  
  hallazgosList!: HallazgoModel[];
  HallazgosDatas: any = [];
  term: any;
  term2: any;

  nombreHallazgo: any = '';
  idHallazgo: any = null;

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;

  public Editor = ClassicEditor;

  monolith!: string;
  nano!: string;

  modelValueAsDate: Date = new Date();

  responsables: any = [];
  articulo: any = {};
  userData: any;

  PlaceInput: any;
  public imagePath: any;
  imgURL: any;

  //selectedFile: File;
  selectedFile: any;
  selectedFileEvaluation: string [] = [];
  //pdfURL: any;
  imgEvaluations: any = [];
  imgHallazgos: any = {};

  //imageChangedEvent: any = '';
  //imgView: any;
  //imgView2: any = [];
  myFiles:string [] = [];
  activeTab: number = 1;
  status: any;
  evaluationDetail: any = {};
  showDetailEvaluation: boolean = false;
  
  estados_default: any = estadosData;
  estados: any = [];
  workPlan: any = {};

  active_notify: boolean = false;
  evaluation_id: any = '';
  descripcion: any;

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private workPlanService: WorkPlanService, private userService: UserProfileService, public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2, private TokenStorageService: TokenStorageService) {
    this.recentData = service.recents$;
    this.total = service.total$;
    
    flatpickr.localize(Spanish);
  }

  inlineDatePicker: Date = new Date();
  @ViewChild('dataTable')
  table!: MatTable<HallazgoModel>;
  displayedColumns: string[] = ['nombre', 'fecha', 'estado', 'action'];
  dataSource = [];

  @ViewChild('dataTable2')
  table2!: MatTable<TaskModel>;
  displayedColumns2: string[] = ['nombre', 'responsable', 'fecha_termino', 'estado', 'prioridad', 'action'];
  dataSource2 = [];

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Control' },
      { label: 'Tareas', active: true }
    ];

    document.body.classList.add('file-detail-show');
    
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    this.userData = this.TokenStorageService.getUser();

    /**
     * Form Validation
    */
    this.folderForm = this.formBuilder.group({
      title: ['', [Validators.required]]
    });

    this.evaluacionForm = this.formBuilder.group({
      fecha_evaluacion: ['', [Validators.required]],
      comentario: [''],
    });

    /**
     * Form Validation
     */
    this.taskForm = this.formBuilder.group({
      ids: [''],
      responsable: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      //fecha_inicio: [''],
      fecha_termino: [''],
      prioridad: [''],
      evaluationFindingId: [''],
      //is_image: [''],
      //is_file: ['']
    });
  
    this.hallazgoForm = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required]],
      //descripcion: [''],
      //fileHallazgo: ['']
    });
    
    this.notifyForm = this.formBuilder.group({
      fecha_vencimiento: ['', [Validators.required]],
      periodicidad: ['30', [Validators.required]]
    });

    /**
     * Recent Validation
    */
    this.recentForm = this.formBuilder.group({
      ids: [''],
      icon_name: ['', [Validators.required]]
    });
    
    this.HallazgosDatas = this.dataSource;
    this.TaskDatas = this.dataSource2;

    this.estados = this.estados_default.filter((estado: any) => {
      return !estado.type;
    });

    this.route.params.subscribe(params => {
      this.project_id = params['idProject'];
      this.cuerpo_id = params['id'];
      this.installation_id = params['idInstallation'] ? params['idInstallation'] : null;
      this.installation_nombre = params['nameInstallation'] ? params['nameInstallation'] : null;

        //this.getArticlesByInstallation(this.installation_id);
        this.getArticlesByInstallationBody(this.installation_id);      
        this.getEvaluations();
        //this.getEvaluationsByInstallationArticle();
        this.getFindingsByInstallationArticle();
        //this.getTasksByProyect();
        this.getResponsables(); 
        this.getProject();
    });

    // Data Get Function
    //this._fetchData();
  }

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }
  
  getProject(){
    this.projectsService.getById(this.project_id).pipe().subscribe(
      (data: any) => {
        this.project = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
 }

 getWorkPlan(){
  const evaluation: any = this.evaluations.findIndex(
    (co: any) =>
      co.active == true
  );

  const evaluation_id: any = evaluation != -1 ? this.evaluations[evaluation].id : null;

   this.workPlanService.getByParams(this.project_id, this.installation_id, this.articulo.normaId, evaluation_id).pipe().subscribe(
     (data: any) => {
       this.workPlan = data.data;
   },
   (error: any) => {
     //this.error = error ? error : '';
     //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
   });
}

 getEvaluations(){
  this.projectsService.getEvaluations(this.project_id).pipe().subscribe(
    (data: any) => {
      this.evaluation = data.data;
  },
  (error: any) => {
    //this.error = error ? error : '';
    //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
  });
}

  // Chat Data Fetch
  /*private _fetchData() {
    // Folder Data Fetch
    this.folderData = folderData;
    this.folderDatas = Object.assign([], this.folderData);

    // Recent Data Fetch
    this.recentData.subscribe(x => {
      this.recentDatas = Object.assign([], x);
    });
  }*/

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
    if (id) {
      /*this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {*/
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });

          const index = this.HallazgosDatas.findIndex(
            (co: any) =>
              co.id == id
          );

          this.HallazgosDatas.splice(index, 1);
          
          //document.getElementById('lj_'+id)?.remove();
          this.table.renderRows();
        /*},
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });*/
    }
  }

  // Delete Task
  deleteTask(id: any) {
    if (id) {
      this.workPlanService.deleteTask(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
        
          const index = this.TaskDatas.findIndex(
            (co: any) =>
              co.id == id
          );

          this.TaskDatas.splice(index, 1);
          
          //document.getElementById('lj_'+id)?.remove();
          this.table2.renderRows();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });
    }
  }
  
  deleteEvaluationImg(index: any){
    this.selectedFileEvaluation.splice(index,1);
    this.imgEvaluations.splice(index, 1);
  }

  deleteEvaluationImgAll(){
    this.selectedFileEvaluation = [];
    this.imgEvaluations = [];
  }

  deleteHallazgoImg(){
    this.selectedFile = [];
    this.imgHallazgos = {};
  }

  viewEvaluation(data: any){
    this.evaluationDetail = data;
    console.log('evaluationDetail', data);
    this.showDetailEvaluation = true;
  }

  hideDetailEvaluation(){
    this.showDetailEvaluation = false;
  }

  /**
   * Fetches the data
   */
  private _fetchData() {
    
    this.showPreLoader();
      this.projectsService.getBodyLegalByNorma(this.cuerpo_id).pipe().subscribe(
        (data: any) => {
          //this.service.bodylegal_data = data.data;
          this.detail = data.data;
          this.articulosDatas = data.data.EstructurasFuncionales ? data.data.EstructurasFuncionales : [];
          
          this.htmlString = this.sanitizer.bypassSecurityTrustHtml((this.detail.encabezado ? this.detail.encabezado.texto.replace(/\n/gi,'<br>') : ''));

          console.log('detail',this.detail);
          console.log('detailData',this.articulosDatas);
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getArticlesByInstallationBody(installation_id: any){

    this.showPreLoader();
      this.projectsService.getArticlesByInstallationBody(installation_id).pipe().subscribe(
        (data: any) => {
          this.detail = data.data;
          let cuerpos: any = data.data.data.length > 0 ? data.data.data : [];
          let cuerpo_articulos: any = [];

          for (var i = 0; i < cuerpos.length; i++) {
            if(cuerpos[i].articulos.length > 0){
              let procede: boolean = false;
              for (var j = 0; j < cuerpos[i].articulos.length; j++) {
                if(cuerpos[i].articulos[j].proyectoId == this.project_id && cuerpos[i].articulos[j].id == this.cuerpo_id){
                  procede = true;                
                }
              }
              if(procede){
                cuerpo_articulos.push(cuerpos[i]);
              }
            }
          }

          this.cuerpoLegal = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].cuerpoLegal : '';
          this.articulosDatas = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].articulos : [];/*data.data.data.length > 0 ? data.data.data[0].articulos : [];*/
          let articulo_filter: any = this.articulosDatas.filter((data: any) => {
            return data.id === parseInt(this.cuerpo_id);
          });

          this.articulo = articulo_filter.length > 0 ? articulo_filter[0] : {};
          //console.log('ARTICULO',this.articulo);
          if(this.articulo.project_article && this.articulo.project_article.articuloTipo){
            this.estados = this.estados_default.filter((estado: any) => {
              return estado.type == this.articulo.project_article.articuloTipo;
            });
          }

          if(this.articulo && this.articulo.evaluations && this.articulo.evaluations.notificaciones) {
            this.active_notify = this.articulo.evaluations.notificaciones;
          }else{
            this.active_notify = false;
          }
         
          this.getEvaluationsByInstallationArticle();
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  validateIdparte(idParte: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.articulo == idParte
    );

    return index == -1;
  }

  changeTab(active: number){
    this.activeTab = active;
  }

  changeStatusHallazgo(e: any,id: number, estado: number){
    const index = this.HallazgosDatas.findIndex(
      (h: any) =>
        h.id == id
    );

    let new_estado: any = estado == 1 ? 2 : 1;

    this.HallazgosDatas[index].estado = new_estado;
    
    var checkboxes: any = e.target.closest('tr').querySelector('#todo' + id);
    if(new_estado == 1){
      checkboxes.checked = true;
    }else{
      checkboxes.checked = false;
    }
  }
  
  private getInstallations() {
    
    this.showPreLoader();
      this.projectsService.getInstallationsUser()/*getInstallations(this.project_id)*/.pipe().subscribe(
        (data: any) => {
          //this.service.bodylegal_data = data.data;
          this.installations = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getArticlesByInstallation(installation_id: any){

    this.showPreLoader();
      this.projectsService.getArticlesByInstallation(installation_id).pipe().subscribe(
        (data: any) => {
          this.installations_articles = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }
  
  private getTasksByFinding(finding_id: any){

    this.showPreLoader();
      this.projectsService.getTasksByFinding(finding_id).pipe().subscribe(
        (data: any) => {
          this.TaskDatas = data.data;
          //console.log('TaskDatas', this.TaskDatas);
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }
  
  private getTasksByProyect(){
    this.showPreLoader();
      this.projectsService.getTasksByProyect(this.project_id).pipe().subscribe(
        (data: any) => {
          this.TaskDatas = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getResponsables() {

    this.showPreLoader();
      this.userService.getCoworkers().pipe().subscribe(
        (data: any) => {
          this.responsables = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }
  
  getCategoryStatus(estado?: any){
    if(estado){  
      const index = this.estados_default.findIndex(
        (es: any) =>
          es.value == estado
      );

      if(index != -1){
        return this.estados_default[index].category;
      }else{
        return null;
      }

    }else{
      return estado;
    }
    
  }

  saveEvaluation(){
    if(!this.status || (this.getCategoryStatus(this.status) != 'CUMPLE' && this.getCategoryStatus(this.status) != 'NO CUMPLE' && this.getCategoryStatus(this.status) != 'CUMPLE PARCIALMENTE') || (this.status && (this.getCategoryStatus(this.status) == 'NO CUMPLE' || this.getCategoryStatus(this.status) == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1)){

      if(this.status && (this.getCategoryStatus(this.status) == 'NO CUMPLE' || this.getCategoryStatus(this.status) == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1){
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Debe asignar hallazgos a la evaluación.',
          showConfirmButton: true,
          timer: 5000,
        });
      }else{
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Debe asignar un estado a la evaluación y cargar una imagen o comentario.',
          showConfirmButton: true,
          timer: 5000,
        });
      }

  } else{
    
    this.showPreLoader();

    let fecha_evaluacion: any = this.evaluacionForm.get('fecha_evaluacion')?.value;
    let comentario: any = this.evaluacionForm.get('comentario')?.value;
    let hallazgos: any = [];

    for (var h = 0; h < this.HallazgosDatas.length; h++) {
      const index4 = this.hallazgos.findIndex(
        (ha: any) =>
          ha.id == this.HallazgosDatas[h].id
      );

      if(index4 == -1){
        hallazgos.push({nombre: this.HallazgosDatas[h].nombre, descripcion: this.HallazgosDatas[h].descripcion, estado: this.HallazgosDatas[h].estado, installationArticleId: this.cuerpo_id });
      }
    }

    const evaluations: any = {
      fecha_evaluacion: fecha_evaluacion,
      hallazgos: hallazgos,
      estado: this.status,
      installationArticleId: this.cuerpo_id,
      comentario: comentario,
      proyectoId: this.project_id,
      evaluationProyectId: this.evaluation_id,
      active: true
    };

    const formData = new FormData();
    
    for (var j = 0; j < this.selectedFileEvaluation.length; j++) { 
      formData.append("evaluacionImg", this.selectedFileEvaluation[j]);
    }

    for (var i = 0; i < this.myFiles.length; i++) { 
      formData.append("hallazgoImg", this.myFiles[i]);
    }
    
    formData.append('data', JSON.stringify(evaluations));
    
    this.projectsService.saveEvaluation(formData).pipe().subscribe(
      (data: any) => {     
       this.hidePreLoader();
       
       Swal.fire({
        title: 'Evaluación actualizada!',
        //text: 'You clicked the button!',
        icon: 'success',
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonColor: '#364574',
        cancelButtonColor: 'rgb(243, 78, 78)',
        confirmButtonText: 'OK',
        timer: 5000
      });
        
        this.evaluacionForm.reset();
        this.deleteEvaluationImgAll();
        this.getArticlesByInstallationBody(this.installation_id);
    },
    (error: any) => {
      
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
      this.modalService.dismissAll()
    })
  }
  }

  saveHallazgo(){
    if (this.hallazgoForm.valid) {
    let nombre: any = this.hallazgoForm.get('nombre')?.value;
    let descripcion: any = null;//this.hallazgoForm.get('descripcion')?.value;
    //this.hallazgos.push({id: (this.hallazgos.length + 1), nombre: nombre});
    let fecha: any = new Date();
    //let fecha: any = fecha_format.getDate()+'/'+(fecha_format.getMonth() + 1)+'/'+fecha_format.getFullYear();
    let id: any = (this.HallazgosDatas && this.HallazgosDatas.length > 0 ? (this.HallazgosDatas[this.HallazgosDatas.length-1].id + 101) : 1);
    let estado: any = 2;
    let cuerpo_id: any = this.cuerpo_id;

    const hallazgo_data: any = {id: id, nombre: nombre,/* descripcion: descripcion,*/ fecha: fecha, estado: estado, installationArticleId: this.cuerpo_id};
    
    this.HallazgosDatas.push({
      id,
      nombre,
      fecha,
      estado,
      cuerpo_id
    });
  
    this.table.renderRows();
    
    this.myFiles.push(this.selectedFile);
      
    this.hallazgoForm.reset();
    this.modalService.dismissAll()
  }
  }
  
  changeStatus(e: any){
    this.status = e.target.value;
  } 

  onFileSelected(event: any){
    //this.imageChangedEvent = event;
    let selectedFileNow: any = <File>event[0];
    this.selectedFile = selectedFileNow;
    
    //console.log('selectedFile',selectedFileNow);
    let name_file: any = selectedFileNow.name;
    let size_file: any = (selectedFileNow.size / 1000000).toFixed(2) + "MB";

  var reader = new FileReader();
    reader.readAsDataURL(selectedFileNow);
    reader.onload = (_event) => {
      //console.log(reader.result);
      this.imgHallazgos = {name: name_file, size: size_file, imagen: reader.result };
      }
  }
  
  onFileSelectedEvaluation(event: any){
    let selectedFileEvaluationNow: any = <File>event[0];
    this.selectedFileEvaluation.push(selectedFileEvaluationNow);

    let name_file: any = selectedFileEvaluationNow.name;
    let size_file: any = (selectedFileEvaluationNow.size / 1000000).toFixed(2) + "MB";
    var reader = new FileReader();
    reader.readAsDataURL(selectedFileEvaluationNow);
    reader.onload = (_event) => {
      //console.log(reader.result);
      this.imgEvaluations.push({name: name_file, size: size_file, imagen: reader.result });
      }
  }

  sendTask(task: any){
    this.projectsService.createTask(task).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           //this.getTasksByFinding(this.idHallazgo);
           this.getFindingsByInstallationArticle();

           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
          this.modalService.dismissAll()
        });
        
          this.modalService.dismissAll();
          setTimeout(() => {
            this.taskForm.reset();
          }, 1000);
          this.submitted = true
  }

  /**
  * Save saveTask
  */
  saveTask() {
    if (this.taskForm.valid) {
      
      this.showPreLoader();
      if (this.taskForm.get('ids')?.value) {
        
        const idTask = this.taskForm.get('ids')?.value;
        
        this.TaskDatas = this.TaskDatas.map((data: { id: any; }) => data.id === this.taskForm.get('ids')?.value ? { ...data, ...this.taskForm.value } : data)
        const responsable2 = this.taskForm.get('responsable')?.value;
        const nombre2 = this.taskForm.get('nombre')?.value;
        const descripcion2 = this.taskForm.get('descripcion')?.value;
        const fecha_termino2 = this.taskForm.get('fecha_termino')?.value;
        const evaluationFindingId2 = this.taskForm.get('evaluationFindingId')?.value;
        const prioridad2 = this.taskForm.get('prioridad')?.value;

        const task2: any = {
          responsableId: responsable2,
          nombre: nombre2,
          descripcion: descripcion2,
          fecha_termino: fecha_termino2,
          evaluationFindingId: evaluationFindingId2,
          prioridad: prioridad2
        };

        this.projectsService.updateTask(task2, idTask).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido editado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           this.getFindingsByInstallationArticle();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
          this.modalService.dismissAll()
        });

      } else {
        const responsable = this.taskForm.get('responsable')?.value;
        const nombre = this.taskForm.get('nombre')?.value;
        const descripcion = this.taskForm.get('descripcion')?.value;
        const fecha_inicio = Date.now();//this.taskForm.get('fecha_inicio')?.value;
        const fecha_termino = this.taskForm.get('fecha_termino')?.value;
        const prioridad = this.taskForm.get('prioridad')?.value;
        const evaluationFindingId = this.taskForm.get('evaluationFindingId')?.value;
        //const is_image = this.taskForm.get('is_image')?.value;
        //const is_file = this.taskForm.get('is_file')?.value;

        const index = this.TaskDatas/*.length > 0*/ ? this.TaskDatas.findIndex(
          (t: any) =>
            (moment(fecha_inicio).format() > t.fecha_inicio && moment(fecha_inicio).format() < t.fecha_termino) || (moment(fecha_termino).format() > t.fecha_inicio && moment(fecha_termino).format() < t.fecha_termino) || (moment(fecha_inicio).format() < t.fecha_inicio && moment(fecha_termino).format() > t.fecha_termino)
        ) : -1;

        const task: any = {
          responsableId: responsable,
          nombre: nombre,
          descripcion: descripcion,
          fecha_inicio: fecha_inicio,
          fecha_termino: fecha_termino,
          evaluationFindingId: evaluationFindingId,//this.idHallazgo,
          estado: 'CREADA',
          prioridad: prioridad,
          type: 'findingTaks',
          //is_image: is_image,
          //is_file: is_file,
          installationId: this.installation_id,
          proyectoId: this.project_id,
          workPlanId: this.workPlan ? this.workPlan.id : null,
          empresaId: this.userData.empresaId
        };

        if(index != -1){
          
          this.hidePreLoader();
          Swal.fire({
            title: 'Existe otra tarea creada en el rango de fecha ingresado. ¿Desea continuar?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Si',
            denyButtonText: 'No',
            customClass: {
              actions: 'my-actions',
              //cancelButton: 'order-1 right-gap',
              confirmButton: 'order-2',
              denyButton: 'order-3',
            }
          }).then((result) => {
            if (result.isConfirmed) {

              this.showPreLoader();
              /*this.TaskDatas.push({
                responsable,
                nombre,
                descripcion,
                fecha_inicio,
                fecha_termino,
                evaluationFindingId
              });*/
          
              this.sendTask(task);
            } else if (result.isDenied) {
              
            }
          });
        }else{
        
        /*this.TaskDatas.push({
          responsable,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_termino,
          evaluationFindingId
        });*/
        if(!this.workPlan || !this.workPlan.id){
          
          const user_id = this.userData.id ? this.userData.id : (this.userData._id ? this.userData._id : null);

          const dataWorkPlan: any = {
                  fecha_inicio: fecha_inicio,
                  fecha_termino: fecha_termino,
                  type: 'auditoria',      
                  articulo: this.articulo.articulo,
                  cuerpoLegal: this.cuerpoLegal,
                  normaId: this.articulo.normaId,
                  articuloId: this.articulo.articuloId,
                  installationId: this.installation_id,
                  responsableId: user_id,
                  descripcion: null,
                  proyectoId: this.project_id,
                  evaluationProyectId: this.evaluation_id,
                  empresaId: this.userData.empresaId
                };
            
            this.workPlanService.create(dataWorkPlan).pipe().subscribe(
            (data: any) => {
              this.workPlan = data.data;
              this.saveTask();
          },
          (error: any) => {
            
            this.hidePreLoader();
            this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
            this.modalService.dismissAll()
          });
  
          }else{
            this.sendTask(task);
          }
        }

      }
    }
  }

  changeStatusTask(e: any, id: number, estado: any){
    
    //this.showPreLoader();
    const index = this.TaskDatas.findIndex(
      (t: any) =>
        t.id == id
    );
    
    let new_estado: any = estado == 'CREADA' ? 'INICIADA' : (estado == 'INICIADA' ? 'COMPLETADA' : 'INICIADA');

    this.TaskDatas[index].estado = new_estado;

    const task: any = {
      estado: new_estado
    };

    const formData = new FormData();
    
    formData.append('data', JSON.stringify(task));
    
    this.projectsService.updateTaskStatus(id, formData).pipe().subscribe(
      (data: any) => {     
       //this.hidePreLoader();
       
        /*Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Tarea actualizada',
          showConfirmButton: true,
          timer: 5000,
        });*/

    },
    (error: any) => {
      
      //this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
    });

  }


  selectInstallation(event: any){

    if(this.installation_id_select.length > 0){
    
    let vacio = event.target.value > 0 ? 1 : 0;
    
    this.installation_id_select.splice(0 + vacio, (this.installation_id_select.length-(1+vacio)));
    
      if(event.target.value > 0){
        
        const index = this.installations.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.installations[index].nombre;

        this.installation_id_select[0] = {value: event.target.value, label: nombre};
      }

    }else{
      
      const index2 = this.installations.findIndex(
        (co: any) =>
          co.id == event.target.value
      );

      let nombre2 = this.installations[index2].nombre;
      this.installation_id_select.push({value: event.target.value, label: nombre2});
    }

    //this.installation_id_select = event.target.value;
      this.items = [];
      this.getChildren(event.target.value);
  }

  selectInstallationChildren(event: any, parent?: any){
    //this.addElement(parent);
      let vacio = event.target.value > 0 ? 2 : 1;
    
      this.installation_id_select.splice((parent+vacio), (this.installation_id_select.length-(parent+vacio)));

      if(event.target.value > 0){
        
        const index = this.items[parent].options.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.items[parent].options[index].nombre;

        this.installation_id_select[parent+1] = {value: event.target.value, label: nombre};
      }

    //this.installation_id_select = event.target.value;
      this.items.splice((parent+1), (this.items.length-(parent+1)));
      this.items[parent].value = event.target.value;
      this.getChildren(event.target.value);
  }

  getChildren(padre_id: any){
    if(padre_id > 0){
      this.showPreLoader();
      this.projectsService.getInstallationsItems(padre_id).pipe().subscribe(
        (data: any) => {
          if(data.data.length > 0){
            this.items.push({value: null, options: data.data});
          }
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }
  }

  private getEvaluationsByInstallationArticle(){
    this.projectsService.getEvaluationsByInstallationArticle(this.cuerpo_id).pipe().subscribe(
      (data: any) => {
        this.evaluations = data.data;
        this.getWorkPlan();
    },
    (error: any) => {
      this.hidePreLoader();
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
    document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getFindingsByInstallationArticle(){

    this.showPreLoader();
      this.projectsService.getFindingsByInstallationArticle(this.cuerpo_id).pipe().subscribe(
        (data: any) => {
          const hallazgos_data = data.data;
          //console.log('hallazgos', this.hallazgos);
          //this.HallazgosDatas = data.data;
          //console.log('hallazgosDatas',this.HallazgosDatas);

          let tareas: any = [];
          for (var i = 0; i < hallazgos_data.length; i++) {
            
            const index = this.HallazgosDatas.findIndex(
              (h: any) =>
                h.id == hallazgos_data[i].id
            );
      
            if(index == -1){
            
                    this.hallazgos.push(hallazgos_data[i]);
                    
                    this.HallazgosDatas.push({id: hallazgos_data[i].id, nombre: hallazgos_data[i].nombre, fecha: hallazgos_data[i].createdAt, estado: hallazgos_data[i].estado, installationArticleId: hallazgos_data[i].installationArticleId});
            }    

                if(hallazgos_data[i].tasks.id != null){
                    tareas.push(hallazgos_data[i].tasks);          
                    //this.TaskDatas.push({id: this.hallazgos[i].tasks.id, nombre: this.hallazgos[i].tasks.nombre, responsable: this.hallazgos[i].tasks.responsable ? this.hallazgos[i].tasks.responsable.nombre : '', fecha_termino: this.hallazgos[i].tasks.fecha_termino, estado: this.hallazgos[i].tasks.estado, prioridad: this.hallazgos[i].tasks.prioridad});
                }
          }

          this.TaskDatas = tareas;
          //console.log('Hallazgos',this.HallazgosDatas);
          //console.log('tareas',this.TaskDatas);
          this.table.renderRows();
          this.table2.renderRows();
          
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }
  
  removeTags(str: any) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    return str.replace( /(<([^>]+)>)/ig, '');
}

parseHtmlString(texto: any){
  return this.sanitizer.bypassSecurityTrustHtml(texto);
}
  
  addElement(parent?: any) {
    
    const select: HTMLParagraphElement = this.renderer.createElement('div');
    
    if(this.installation_id_select/*parent > 0*/){
      let zone: any = document.getElementById('zone-'+(parent+1));
      if(zone){
        this.renderer.removeChild(select, zone?.lastElementChild);
      }
    }

    select.innerHTML = '<div id="zone-'+(parent+1)+'"> <div class="col-xxl-12 col-lg-12"><p><b>Instalación o proceso</b></p><select class="form-select" placeholder="Selecciona instalación o proceso '+(parent+1)+'" data-choices data-choices-search-false id="choices-priority-input" (change)="selectInstallation($event,'+(parent+1)+')"> <option value="">Selecciona instalación o proceso</option> <option  value="4">Prueba</option></select></div>';

    this.renderer.appendChild(this.zone?.nativeElement, select);
  }

  checkedValGet: any[] = [];
  onCheckboxChange(e: any) {
    //const checkArray: UntypedFormArray = this.taskForm.get('responsable') as UntypedFormArray;
    //checkArray.push(new UntypedFormControl(e.target.value));
    this.taskForm.get('responsable')?.setValue(e.target.value);
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.responsables.length; i++) {
     // if (this.responsables[i].state == true) {
        result = this.responsables[i];
        checkedVal.push(result);
     // }
    }
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        checkboxes[j].checked = false;
      }
    }

    //this.checkedValGet = checkedVal
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";

  }

  checkedValGet2: any[] = [];
  onCheckboxChange2(e: any) {
    this.taskForm.get('evaluationFindingId')?.setValue(e.target.value);
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.hallazgos.length; i++) {
        result = this.hallazgos[i];
        checkedVal.push(result);
    }
    var checkboxes: any = document.getElementsByName('checkAll2');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        checkboxes[j].checked = false;
      }
    }
  }

  saveInstallation(){
    this.installation_id = this.installation_id_select[this.installation_id_select.length - 1].value;
    /*const index = this.installations.findIndex(
      (co: any) =>
        co.id == this.installation_id
    );*/

    this.installation_nombre = /*this.installations[index].nombre*/this.installation_id_select[this.installation_id_select.length - 1].label;
    this.getArticlesByInstallation(this.installation_id);
  }

  selectTask(id: any, nombre:any){
    this.nombreHallazgo = nombre;
    this.idHallazgo = id;
    this.getTasksByFinding(this.idHallazgo);
  }
  
  imgError(ev: any){

    let source = ev.srcElement;
    let imgSrc = 'assets/images/new-document.png';//'assets/images/logo_conect_ia.png';

    source.src = imgSrc;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;

    this.selectedFile = [];
    this.imgHallazgos = {};
    this.modalService.open(content, { size: 'lg', centered: true });
  }
  
  editModal(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'lg', centered: true });
    var updateBtn = document.getElementById('add-btn2') as HTMLAreaElement;
    updateBtn.innerHTML = "Editar";
    
    var listData = this.TaskDatas.filter((data: { id: any; }) => data.id === id);
    this.taskForm.controls['responsable'].setValue(listData[0].responsableId.toString());
    this.taskForm.controls['nombre'].setValue(listData[0].nombre);
    this.taskForm.controls['descripcion'].setValue(listData[0].descripcion);
    this.descripcion = listData[0].descripcion;
    this.taskForm.controls['fecha_termino'].setValue(listData[0].fecha_termino);
    this.taskForm.controls['evaluationFindingId'].setValue(listData[0].evaluationFindingId.toString());
    this.taskForm.controls['prioridad'].setValue(listData[0].prioridad);
    this.taskForm.controls['ids'].setValue(listData[0].id);
  }

  /**
  * Form data get
  */
  get form() {
    return this.taskForm.controls;
  }

  /*isCollapsed(idParte: any){
    const index = this.isCollapseArray.findIndex(
      (co: any) =>
        co == idParte
    );
    return index >= 0;
    return true;
  }*/

  formatArticle(texto:any, idParte: any){
    
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1 ? texto : texto.substr(0,450)+'...';
  }

  getRetraso(fecha_vencimiento: any){
    var fecha1 = moment(fecha_vencimiento);
    var fecha2 = moment(Date.now());

    return fecha2.diff(fecha1, 'days') > 0 ? fecha2.diff(fecha1, 'days') : 0;
  }

  showText(idParte: any){
    this.showRow.push(idParte);
  }

  hideText(idParte: any){
    
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idParte
    );

    this.showRow.splice(index, 1);
  }

  validatShow(idParte: any){
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1;
  }

  // Folder Filter
  folderSearch() {
    var type = (document.getElementById("file-type") as HTMLInputElement).value;
    if (type) {
      this.folderDatas = this.folderData.filter((data: any) => {
        return data.title === type;
      });
    }
    else {
      this.folderDatas = this.folderData
    }
  }

  /**
   * Active Star
   */
  activeMenu(id: any) {
    document.querySelector('.star-' + id)?.classList.toggle('active');
  }

  /**
   * Open Recent modal
   * @param content modal content
   */
  openRecentModal(recentContent: any) {
    this.submitted = false;
    this.modalService.open(recentContent, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form1() {
    return this.recentForm.controls;
  }

  /**
  * Product Filtering  
  */
  changeProducts(e: any, name: any, index?: any) {

    //this.collapse?.nativeElement.toggle();
    //this.collapse?.nativeElement.classList.toggle('active');

    this.showEncabezado = name == 'r-Encabezado';

    this.isCollapseArray = name;
    (document.getElementById(name) as HTMLElement).scrollIntoView({behavior: 'smooth'});

    /*(document.getElementById("folder-list") as HTMLElement).style.display = "none";
    this.recentData.subscribe(x => {
      this.recentDatas = x.filter((product: any) => {
        return product.type === name;
      });
    });*/
  }

  /**
   * on dragging task
   * @param item item dragged
   * @param list list from item dragged
   */
  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  /**
   * On task drop event
   */
  onDrop(event: DndDropEvent, filteredList?: any[], targetStatus?: string) {
    if (filteredList && event.dropEffect === 'move') {
      let index = event.index;
      if (typeof index === 'undefined') {
        index = filteredList.length;
      }
      filteredList.splice(index, 0, event.data);
    }
  }

  // Todo Drag and droup data
  todoTable(event: CdkDragDrop<HallazgoModel[]>): void {
    moveItemInArray(this.HallazgosDatas, event.previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  todoTable2(event: CdkDragDrop<HallazgoModel[]>): void {
    moveItemInArray(this.TaskDatas, event.previousIndex, event.currentIndex);
    this.table2.renderRows();
  }

  // Checked Selected
  checkUncheckAll(e: any, id: any) {
    var checkboxes: any = e.target.closest('tr').querySelector('#todo' + id);
    var status: any = e.target.closest('tr').querySelector('.status');
    if (checkboxes.checked) {
      this.changeStatusHallazgo(e, id, 1);
      status.innerHTML = '<span class="badge text-uppercase badge-soft-success">Completada</span>'
    }
    else {
      this.changeStatusHallazgo(e, id, 2); 
      status.innerHTML = '<span class="badge text-uppercase badge-soft-warning">Pendiente</span>'
    }
  }
  
  verifyNotify(event: any, evaluation_id: any, contentNotify: any) {  
    const active: boolean = !this.active_notify;
    
    if(active){
      this.active_notify = true;

      this.submittedNotify = false;
      this.evaluation_id = evaluation_id;
      this.modalService.open(contentNotify, { size: 'sm', centered: true });

    }else{
      
      this.active_notify = false;
          
      const dataNotify: any = {
        notificaciones: false,
        fecha_active: null,
        fecha_vencimiento: null,
        fecha_notificacion: null,
        fecha_notificacion5: null,
        fecha_notificacion10: null,
        fecha_notificacion15: null,
        fecha_notificacion30: null,
        fecha_notificada: null,
        periodicidad: null,
        fecha: null
      };

      this.saveNotify(evaluation_id, dataNotify);

    }

  }

  addDays(days: number): Date {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
  
  deleteDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
  }
  
  activeNotify() {  
    if (this.notifyForm.valid) {
      
      const fecha_vencimiento = this.notifyForm.get('fecha_vencimiento')?.value;
      const periodicidad = this.notifyForm.get('periodicidad')?.value;

      const fecha_active = Date.now();
      const fecha_notificacion = this.addDays(parseInt(periodicidad));
      console.log('fecha_notificacion',fecha_notificacion);
      const dias30 = Math.floor(periodicidad * 30 / 100);
      const dias15 = Math.floor(periodicidad * 15 / 100);
      const dias10 = Math.floor(periodicidad * 10 / 100);
      const dias5 = Math.floor(periodicidad * 5 / 100); 

      const fecha_notificacion30 = this.deleteDays(fecha_notificacion, dias30);
      const fecha_notificacion15 = this.deleteDays(fecha_notificacion, dias15);
      const fecha_notificacion10 = this.deleteDays(fecha_notificacion, dias10);
      const fecha_notificacion5 = this.deleteDays(fecha_notificacion, dias5);
    
      const dataNotify: any = {
        notificaciones: true,
        fecha_active: fecha_active,
        fecha_vencimiento: fecha_vencimiento,
        fecha_notificacion: fecha_notificacion,
        fecha_notificacion5: fecha_notificacion5 > new Date(fecha_active) ? fecha_notificacion5 : null,
        fecha_notificacion10: fecha_notificacion10 > new Date(fecha_active) ? fecha_notificacion10 : null,
        fecha_notificacion15: fecha_notificacion15 > new Date(fecha_active) ? fecha_notificacion15 : null,
        fecha_notificacion30: fecha_notificacion30 > new Date(fecha_active) ? fecha_notificacion30 : null,
        fecha_notificada: null,
        periodicidad: periodicidad
      };

      this.saveNotify(this.evaluation_id, dataNotify, true);
  
    }
    
    this.submitted = true

  }

  saveNotify(evaluation_id: any, dataNotify: any, modal?: boolean){
    
    this.showPreLoader();
    
    this.projectsService.saveNotify(evaluation_id,dataNotify).pipe().subscribe(
      (data: any) => {
      
        if(modal){
          Swal.fire({
            title: 'Notificacion guardada!',
            //text: 'You clicked the button!',
            icon: 'success',
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonColor: '#364574',
            cancelButtonColor: 'rgb(243, 78, 78)',
            confirmButtonText: 'OK',
            timer: 2000
          });
          this.modalService.dismissAll();
        }
        this.hidePreLoader();
      
      },
      (error: any) => {
        
        if(modal){
          this.modalService.dismissAll();
        }

        this.hidePreLoader();
        this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        
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

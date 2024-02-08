import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2/*, ChangeDetectorRef*/ } from '@angular/core';

import { MatTable } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// Drag and drop
import { DndDropEvent } from 'ngx-drag-drop';

import { DecimalPipe, Location } from '@angular/common';

import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel, HallazgoModel, TaskModel } from './follow.model';
import { folderData } from './data';
import { RecentService } from './follow.service';
import { NgbdRecentSortableHeader, SortEvent } from './follow-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { UserProfileService } from '../../../../../core/services/user.service';
import { TokenStorageService } from '../../../../../core/services/token-storage.service';

import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { estadosData } from '../../../estados';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-follow-evaluation',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * EvaluationFollowComponent
 */
export class EvaluationFollowComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  project: any = {};
  idEvaluation: any = '';
  evaluations: any = '';
  count_evaluations: number = 0;
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
  folderForm!: UntypedFormGroup;
  taskForm!: UntypedFormGroup;
  hallazgoForm!: UntypedFormGroup;
  evaluacionForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  recentDatas: any;
  articulosDatas: any;
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
  articulo: any = {};

  items: any = [];
  hallazgos: any = [];
  hallazgosList!: HallazgoModel[];
  HallazgosDatas: any/* = []*/;
  term: any;
  term2: any;

  status: any;

  PlaceInput: any;
  public imagePath: any;
  imgURL: any;

  selectedFile: any;
  //selectedFile:string [] = [];
  selectedFileEvaluation: string [] = [];
  //pdfURL: any;
  imgEvaluations: any = [];
  imgHallazgos: any = {};
  TaskData!: DetailModel[];
  TaskDatas: any/* = []*/;

  //imageChangedEvent: any = '';
  //imgView: any;
  //imgView2: any = [];
  myFiles:string [] = [];

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;

  public Editor = ClassicEditor;

  monolith!: string;
  nano!: string;

  modelValueAsDate: Date = new Date();

  estados_default: any = estadosData;
  /*estados_default: any = [
    //*DEFAULT
    {value: 'CUMPLE', label: 'Cumple', type: null, category: 'CUMPLE'},
    {value: 'CUMPLE PARCIALMENTE', label: 'Cumple parcial', type: null, category: 'CUMPLE PARCIALMENTE'},
    {value: 'NO CUMPLE', label: 'No cumple', type: null, category: 'NO CUMPLE'},
    //PERMISOS
    {value: 'Aprobado y vigente', label: 'Aprobado y vigente', type: 'permiso', category: 'CUMPLE'},
    {value: 'Actualizado/Regularizado', label: 'Actualizado/Regularizado', type: 'permiso', category: 'CUMPLE'},
    {value: 'Desmovilizado', label: 'Desmovilizado', type: 'permiso', category: 'CUMPLE PARCIALMENTE'},
    {value: 'Desactualizado', label: 'Desactualizado', type: 'permiso', category: 'CUMPLE PARCIALMENTE'}, 
    {value: 'Rechazado', label: 'Rechazado', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'Caducado', label: 'Caducado', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'Suspendido', label: 'Suspendido', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'Revocado', label: 'Revocado', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'Por Gestionar', label: 'Por Gestionar', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'En elaboración', label: 'En elaboración', type: 'permiso', category: 'NO CUMPLE'},
    {value: 'En trámite', label: 'En trámite', type: 'permiso', category: 'NO CUMPLE'},
    //REPORTES
    {value: 'Reporte Regularizado', label: 'Reporte Regularizado', type: 'reporte', category: 'CUMPLE'},
    {value: 'Reportado dentro del plazo sin desviaciones', label: 'Reportado dentro del plazo sin desviaciones', type: 'reporte', category: 'CUMPLE'},
    {value: 'Reportado fuera de plazo con desviaciones', label: 'Reportado fuera de plazo con desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'},
    {value: 'Reportado fuera de plazo sin desviaciones', label: 'Reportado fuera de plazo sin desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'}, 
    {value: 'Reportado dentro del plazo con desviaciones', label: 'Reportado dentro del plazo con desviaciones', type: 'reporte', category: 'CUMPLE PARCIALMENTE'}, 
    {value: 'No reportado', label: 'No reportado', type: 'reporte', category: 'NO CUMPLE'},
    //MONITOREOS
    {value: 'Monitoreo Regularizado', label: 'Monitoreo Regularizado', type: 'monitoreo', category: 'CUMPLE'},
    {value: 'Ejecutado dentro del plazo sin desviaciones', label: 'Ejecutado dentro del plazo sin desviaciones', type: 'monitoreo', category: 'CUMPLE'},
    {value: 'Ejecutado fuera de plazo con desviaciones', label: 'Ejecutado fuera de plazo con desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'},
    {value: 'Ejecutado fuera de plazo sin desviaciones', label: 'Ejecutado fuera de plazo sin desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'}, 
    {value: 'Ejecutado dentro del plazo con desviaciones', label: 'Ejecutado dentro del plazo con desviaciones', type: 'monitoreo', category: 'CUMPLE PARCIALMENTE'}, 
    {value: 'No reportado', label: 'No reportado', type: 'monitoreo', category: 'NO CUMPLE'}
  ];*/

  estados: any = [];
  evaluation: any = {};

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private userService: UserProfileService, public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2,private _location: Location/*, private ref: ChangeDetectorRef*/, private TokenStorageService: TokenStorageService) {
    this.recentData = service.recents$;
    this.total = service.total$;

    flatpickr.localize(Spanish);
  }
  
  @ViewChild('dataTable')
  table!: MatTable<HallazgoModel>;
  displayedColumns: string[] = ['nombre', 'fecha', 'estado', 'action'];
  dataSource = [];
  
  @ViewChild('dataTable2')
  table2!: MatTable<TaskModel>;
  displayedColumns2: string[] = ['nombre', 'responsable', 'fecha_termino', 'estado', 'prioridad', 'action'];
  dataSource2 = [];

  responsables: any = [];
  userData: any;

  inlineDatePicker: Date = new Date();

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Evaluar Cumplimiento' },
      { label: 'Registrar cumplimiento', active: true }
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

    this.hallazgoForm = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required]],
      //descripcion: [''],
      //fileHallazgo: ['']
    });

    this.evaluacionForm = this.formBuilder.group({
      fecha_evaluacion: ['', [Validators.required]],
      //fecha_termino: [''],
      comentario: [''],
      //reportable: [''],
      //monitoreo: [''],
      //permiso: ['']
    });
    
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
      this.idEvaluation = params['idEvaluation'];

        this.getArticlesByInstallationBody(this.installation_id);
        this.getEvaluations();
        this.getEvaluationsByInstallationArticle();
        //this.getFindingsByInstallationArticle();
        this.getResponsables();
        this.getProject();
      
    });
  }
  
 getEvaluations(){
  this.projectsService.getEvaluations(this.project_id).pipe().subscribe(
    (data: any) => {
      const evaluation_data = data.data;
      const index = evaluation_data.findIndex(
        (ev: any) =>
          ev.id == this.idEvaluation
      );
      this.count_evaluations = evaluation_data.lenght;
      this.evaluation = index != -1 ? evaluation_data[index] : {};
  },
  (error: any) => {
    //this.error = error ? error : '';
    //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
  });
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
          //console.log('ARTICULOS:', this.articulo);
          
          if(this.articulo.project_article && this.articulo.project_article.articuloTipo){
            this.estados = this.estados_default.filter((estado: any) => {
              return estado.type == this.articulo.project_article.articuloTipo;
            });
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

  private getEvaluationsByInstallationArticle(){
    this.projectsService.getEvaluationsByInstallationArticle(this.cuerpo_id).pipe().subscribe(
      (data: any) => {
        this.evaluations = data.data;
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
          
          let tareas: any = [];
          for (var i = 0; i < hallazgos_data.length; i++) {
                    if(hallazgos_data[i].evaluationId == this.idEvaluation){
                      
                        this.hallazgos = hallazgos_data[i];
                        this.HallazgosDatas.push({id: hallazgos_data[i].id, nombre: hallazgos_data[i].nombre, fecha: hallazgos_data[i].createdAt, estado: hallazgos_data[i].estado, installationArticleId: hallazgos_data[i].installationArticleId});
                    
                        if(hallazgos_data[i].tasks.id != null){
                            tareas.push(hallazgos_data[i].tasks);
                        }
                    }
          }

          this.TaskDatas = tareas;
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

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  validateIdparte(idParte: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.articulo == idParte
    );

    return index == -1;
  }

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
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
  
  changeStatus(e: any){
    this.status = e.target.value;
  }

  changeStatusHallazgo(e: any, id: number, estado: number){
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
  
  saveHallazgo(){
    
    if (this.hallazgoForm.valid) {
      let nombre: any = this.hallazgoForm.get('nombre')?.value;
      let descripcion: any = null;//this.hallazgoForm.get('descripcion')?.value;
      //this.hallazgos.push({id: (this.hallazgos.length + 1), nombre: nombre});
      let fecha_format: any = new Date();
      let fecha: any = fecha_format.getDate()+'/'+(fecha_format.getMonth() + 1)+'/'+fecha_format.getFullYear();
      let id: any = (this.HallazgosDatas && this.HallazgosDatas.length > 0 ? (this.HallazgosDatas[this.HallazgosDatas.length-1].id + 1) : 1);
      let estado: any = 2;

      const hallazgo_data: any = {id: id, nombre: nombre,/* descripcion: descripcion,*/ fecha: fecha, estado: estado};
      
        this.HallazgosDatas.push({
          id,
          nombre,
          fecha,
          estado
        });
      
      this.table.renderRows(); 
      //this.ref.detectChanges();
      //this.dataSource.push(hallazgo_data);

      this.myFiles.push(this.selectedFile);
      //this.imgView2.push(this.imgView);
      
      /*Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Hallazgo agregado',
        showConfirmButton: true,
        timer: 5000,
      });*/
      this.hallazgoForm.reset();
      this.modalService.dismissAll()
    }
  }

  /**
  * Save saveTask
  */
  saveTask() {
    if (this.taskForm.valid) {
      
      this.showPreLoader();
      if (this.taskForm.get('ids')?.value) {
        this.hidePreLoader();
        this.TaskDatas = this.TaskDatas.map((data: { id: any; }) => data.id === this.taskForm.get('ids')?.value ? { ...data, ...this.taskForm.value } : data)
      } else {
        const responsable = this.taskForm.get('responsable')?.value;
        const nombre = this.taskForm.get('nombre')?.value;
        const descripcion = this.taskForm.get('descripcion')?.value;
        const fecha_inicio = new Date();//this.taskForm.get('fecha_inicio')?.value;
        const fecha_termino = this.taskForm.get('fecha_termino')?.value;
        const prioridad = this.taskForm.get('prioridad')?.value;
        const evaluationFindingId = this.taskForm.get('evaluationFindingId')?.value;
        //const is_image = this.taskForm.get('is_image')?.value;
        //const is_file = this.taskForm.get('is_file')?.value;

        const index = this.TaskDatas/*.length > 0*/ ? this.TaskDatas.findIndex(
          (t: any) =>
            (/*moment(*/fecha_inicio/*).format()*/ > t.fecha_inicio && /*moment(*/fecha_inicio/*).format()*/ < t.fecha_termino) || (moment(fecha_termino).format() > t.fecha_inicio && moment(fecha_termino).format() < t.fecha_termino) || (/*moment(*/fecha_inicio/*).format()*/ < t.fecha_inicio && moment(fecha_termino).format() > t.fecha_termino)
        ) : -1;

        if(index != -1){
          
          this.hidePreLoader();
          Swal.fire({
            title: 'Existe otra tarea creada en el rango de fecha ingresado. Desea continuar?',
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

              const task: any = {
                responsableId: responsable,
                nombre: nombre,
                descripcion: descripcion,
                fecha_inicio: fecha_inicio,
                fecha_termino: fecha_termino,
                evaluationFindingId: evaluationFindingId,
                estado: 'CREADA',
                prioridad: prioridad,
                type: 'findingTaks',
                installationId: this.installation_id,
                proyectoId: this.project_id,
                empresaId: this.userData.empresaId
              };
              
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
            } else if (result.isDenied) {
              
            }
          });
        }else{
                
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
          installationId: this.installation_id,
          proyectoId: this.project_id,
          empresaId: this.userData.empresaId
        };
        
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

      }
    }
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
    if(!this.status || (this.getCategoryStatus(this.status) != 'CUMPLE' && this.getCategoryStatus(this.status) != 'NO CUMPLE' && this.getCategoryStatus(this.status) != 'CUMPLE PARCIALMENTE') || (this.getCategoryStatus(this.status) && (this.getCategoryStatus(this.status) == 'NO CUMPLE' || this.getCategoryStatus(this.status) == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1)){

      if(this.getCategoryStatus(this.status) && (this.getCategoryStatus(this.status) == 'NO CUMPLE' || this.getCategoryStatus(this.status) == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1){
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
    //let fecha_termino: any = null;//this.evaluacionForm.get('fecha_termino')?.value;
    let comentario: any = this.evaluacionForm.get('comentario')?.value;
    //let reportable: any = null;//this.evaluacionForm.get('reportable')?.value;
    //let monitoreo: any = null;//this.evaluacionForm.get('monitoreo')?.value;
    //let permiso: any = null;//this.evaluacionForm.get('permiso')?.value;
    //let hallazgoImg: any = this.myFiles;
    let hallazgos: any = [];

    for (var h = 0; h < this.HallazgosDatas.length; h++) { 
      hallazgos.push({nombre: this.HallazgosDatas[h].nombre, descripcion: this.HallazgosDatas[h].descripcion, estado: this.HallazgosDatas[h].estado, installationArticleId: this.cuerpo_id});
    }

    /*let tipoArticulo: any = [];

    if(reportable){
      tipoArticulo.push('reportable');
    }
    
    if(monitoreo){
      tipoArticulo.push('monitoreo');
    }

    if(permiso){
      tipoArticulo.push('permiso');
    }*/

    const evaluations: any = {
      fecha_evaluacion: fecha_evaluacion,
      //fecha_termino: fecha_termino,
      hallazgos: /*this.status == 'CUMPLE' ? [] : */hallazgos,
      estado: this.status,
      installationArticleId: this.cuerpo_id,
      //tipoArticulo: tipoArticulo,
      comentario: comentario,
      //hallazgoImg: hallazgoImg
      //articuloId: this.cuerpo_id,
      //installationId: this.installation_id,
      proyectoId: this.project_id,
      evaluationProyectId: this.idEvaluation,
      active: this.evaluations.active || this.count_evaluations < 2 ? true : false
    };

    const formData = new FormData();
    //if(this.status == 'CUMPLE'){
      //formData.append('evaluacionImg', this.selectedFileEvaluation);
    //}else{
      //formData.append('hallazgoImg', this.myFiles[0]);
    //}
    
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
        
        this._location.back();
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
  //console.log('selectedFile',selectedFileEvaluationNow);
  let name_file: any = selectedFileEvaluationNow.name;
  let size_file: any = (selectedFileEvaluationNow.size / 1000000).toFixed(2) + "MB";
  var reader = new FileReader();
  reader.readAsDataURL(selectedFileEvaluationNow);
  reader.onload = (_event) => {
    //console.log(reader.result);
    this.imgEvaluations.push({name: name_file, size: size_file, imagen: reader.result });
    //this.imgView = reader.result;
    //this.pdfURL = this.selectedFile.name;
    //this.formUsuario.controls['img'].setValue(this.selectedFile);
    }
}

imgError(ev: any){

  let source = ev.srcElement;
  let imgSrc = 'assets/images/logo_conect_ia.png';

  source.src = imgSrc;
}

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    
    //this.myFiles = [];
    this.selectedFile = [];
    this.imgHallazgos = {};
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  /**
  * Form data get
  */
  get form() {
    return this.folderForm.controls;
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

    return index != -1 ? texto : texto.substr(0,850)+'...';
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
  
  removeTags(str: any) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    return str.replace( /(<([^>]+)>)/ig, '');
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
      //status.innerHTML = '<span class="badge text-uppercase badge-soft-success">Completada</span>'
    }
    else{
      this.changeStatusHallazgo(e, id, 2);
      //status.innerHTML = '<span class="badge text-uppercase badge-soft-warning">Pendiente</span>'
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

  // Delete Data
  deleteData(id: any) {
    if (id) {
      /*this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {*/
          //document.getElementById('row-' + id)?.remove();
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
            const index = this.HallazgosDatas.findIndex(
              (co: any) =>
                co.id == id
            );

            this.HallazgosDatas.splice(index, 1);
            //this.myFiles.splice(index, 1);

            this.table.renderRows();
          //document.getElementById('lj_'+id)?.remove();
        /*},
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });*/
    }
  }

  deleteEvaluationImg(index: any){
    this.selectedFileEvaluation.splice(index,1);
    this.imgEvaluations.splice(index, 1);
  }

  deleteHallazgoImg(){
    this.selectedFile = [];
    this.imgHallazgos = {};
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

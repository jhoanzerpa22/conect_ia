import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl, Validators, FormArray } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './task.model';
import { folderData } from './data';
import { RecentService } from './task.service';
import { NgbdRecentSortableHeader, SortEvent } from './task-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { UserProfileService } from '../../../../../core/services/user.service';import { TokenStorageService } from '../../../../../core/services/token-storage.service';
import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-auditor-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * ComplianceTaskComponent
 */
export class ComplianceTaskComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  @Input('project_id') project_id: any;
  @Input('installation_id') installation_id: any;
  @Input('installation_nombre') installation_nombre: any;
  @Input('cuerpo_id') cuerpo_id: any;
  
  installation_id_select: any = [];
  
  detail: any = [];
  installations: any = [];
  installations_articles: any = [];

  folderData!: DetailModel[];
  submitted = false;
  folderForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  taskForm!: UntypedFormGroup;
  TaskData!: DetailModel[];
  recentDatas: any;
  articulosDatas: any;
  TaskDatas: any;
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
  HallazgosDatas: any = [];

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
  
  @Output() backFunction = new EventEmitter();
  @Output() completarFunction = new EventEmitter();

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private userService: UserProfileService, public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2, private TokenStorageService: TokenStorageService) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  inlineDatePicker: Date = new Date();

  ngOnInit(): void {

    document.body.classList.add('file-detail-show');

    this.userData = this.TokenStorageService.getUser();

    /**
     * Form Validation
    */
    this.folderForm = this.formBuilder.group({
      title: ['', [Validators.required]]
    });

    /**
     * Form Validation
     */
    this.taskForm = this.formBuilder.group({
      ids: [''],
      responsable: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      fecha_inicio: [''],
      fecha_termino: [''],
      evaluationFindingId: [''],
      is_image: [''],
      is_file: ['']
    });

    /**
     * Recent Validation
    */
    this.recentForm = this.formBuilder.group({
      ids: [''],
      icon_name: ['', [Validators.required]]
    });

        //this.getArticlesByInstallation(this.installation_id);
        this.getArticlesByInstallationBody(this.installation_id);
        this.getFindingsByInstallationArticle();
        //this.getTasksByProyect();
        this.getResponsables();

    // Data Get Function
    //this._fetchData();
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

  backClicked(){
    this.backFunction.emit();
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
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          document.getElementById('lj_'+id)?.remove();
        /*},
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });*/
    }
  }
  
  completarClicked(id: any){
    this.completarFunction.emit(id);
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
          let articulos: any = data.data.data.length > 0 ? data.data.data : [];
          let cuerpo_articulos: any = [];

          for (var i = 0; i < articulos.length; i++) {
            if(articulos[i].articulos.length > 0){
              let procede: boolean = false;
              for (var j = 0; j < articulos[i].articulos.length; j++) {
                if(articulos[i].articulos[j].proyectoId == this.project_id){
                  procede = true;                
                }
              }
              if(procede){
                cuerpo_articulos.push(articulos[i]);
              }
            }
          }

          this.articulosDatas = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].articulos : [];/*data.data.data.length > 0 ? data.data.data[0].articulos : [];*/
          
          let articulo_filter: any = this.articulosDatas.filter((data: any) => {
            return data.id === parseInt(this.cuerpo_id);
          });

          this.articulo = articulo_filter.length > 0 ? articulo_filter[0] : {};

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
        const fecha_inicio = this.taskForm.get('fecha_inicio')?.value;
        const fecha_termino = this.taskForm.get('fecha_termino')?.value;
        const evaluationFindingId = this.taskForm.get('evaluationFindingId')?.value;
        const is_image = this.taskForm.get('is_image')?.value;
        const is_file = this.taskForm.get('is_file')?.value;
        
        const index = this.TaskDatas.findIndex(
          (t: any) =>
            (moment(fecha_inicio).format() > t.fecha_inicio && moment(fecha_inicio).format() < t.fecha_termino) || (moment(fecha_termino).format() > t.fecha_inicio && moment(fecha_termino).format() < t.fecha_termino) || (moment(fecha_inicio).format() < t.fecha_inicio && moment(fecha_termino).format() > t.fecha_termino)
        );

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
              /*this.TaskDatas.push({
                responsable,
                nombre,
                descripcion,
                fecha_inicio,
                fecha_termino,
                evaluationFindingId
              });*/
              
              const task: any = {
                responsableId: responsable,
                nombre: nombre,
                descripcion: descripcion,
                fecha_inicio: fecha_inicio,
                fecha_termino: fecha_termino,
                evaluationFindingId: evaluationFindingId,//this.idHallazgo,
                estado: 'CREADA',
                type: 'findingTaks',
                is_image: is_image,
                is_file: is_file,
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
        
        /*this.TaskDatas.push({
          responsable,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_termino,
          evaluationFindingId
        });*/
        
        const task: any = {
          responsableId: responsable,
          nombre: nombre,
          descripcion: descripcion,
          fecha_inicio: fecha_inicio,
          fecha_termino: fecha_termino,
          evaluationFindingId: evaluationFindingId,//this.idHallazgo,
          estado: 'CREADA',
          type: 'findingTaks',
          is_image: is_image,
          is_file: is_file,
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

  private getFindingsByInstallationArticle(){

    this.showPreLoader();
      this.projectsService.getFindingsByInstallationArticle(this.cuerpo_id).pipe().subscribe(
        (data: any) => {
          this.hallazgos = data.data;
          this.HallazgosDatas = data.data;

          let tareas: any = [];
          for (var i = 0; i < this.hallazgos.length; i++) {
                if(this.hallazgos[i].findings.tasks.id != null){
                    tareas.push(this.hallazgos[i].findings.tasks);
                }
          }

          this.TaskDatas = tareas;
          
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
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

  getRetraso(fecha_vencimiento: any){
    var fecha1 = moment(fecha_vencimiento);
    var fecha2 = moment(Date.now());

    return fecha2.diff(fecha1, 'days') > 0 ? fecha2.diff(fecha1, 'days') : 0;
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
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
  * Form data get
  */
  get form() {
    //return this.folderForm.controls;
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

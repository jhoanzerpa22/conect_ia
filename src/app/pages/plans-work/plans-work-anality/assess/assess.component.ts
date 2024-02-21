import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe, Location } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './assess.model';
import { folderData } from './data';
import { RecentService } from './assess.service';
import { NgbdRecentSortableHeader, SortEvent } from './assess-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { ToastService } from '../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-plans-assess',
  templateUrl: './assess.component.html',
  styleUrls: ['./assess.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * PlansAssessComponent
 */
export class PlansAssessComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  tarea_id: any = '';
  detail: any = [];

  folderData!: DetailModel[];
  submitted = false;
  folderForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  taskForm!: UntypedFormGroup;
  recentDatas: any;
  simpleDonutChart: any;
  public isCollapsed: any = [];
  isCollapseArray: any = ['Encabezado'];
  showEncabezado: boolean = true;

  // Table data
  recentData!: Observable<recentModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdRecentSortableHeader) headers!: QueryList<NgbdRecentSortableHeader>;

  htmlString: any = "";
  showRow: any = [];
  showRow2: any = [];
  showRow3: any = [];
  tarea: any = {};

  items: any = [];

  status: any = 'CREADA';//'CREADA', 'INICIADA', 'COMPLETADA';

  PlaceInput: any;
  public imagePath: any;
  imgURL: any;

  //selectedFile: File;
  selectedFile: any;
  pdfURL: any;

  imageChangedEvent: any = '';
  imgView: any;
  imgView2: any = [];

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;

  public Editor = ClassicEditor;

  monolith!: string;
  nano!: string;

  modelValueAsDate: Date = new Date();

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2,private _location: Location) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  inlineDatePicker: Date = new Date();

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Planes de trabajo' },
      { label: 'Plan de Trabajo' },
      { label: 'Tareas' },
      { label: 'Registrar Cumplimiento', active: true }
    ];

    document.body.classList.add('file-detail-show');

    /**
     * Form Validation
    */
    this.folderForm = this.formBuilder.group({
      title: ['', [Validators.required]]
    });

    /**
     * Recent Validation
    */
    this.recentForm = this.formBuilder.group({
      ids: [''],
      icon_name: ['', [Validators.required]]
    });

    this.taskForm = this.formBuilder.group({
      comentario: ['']
    });

    this.route.params.subscribe(params => {
      this.project_id = params['idProject'];
      this.tarea_id = params['id'];
        this.getTaskById(this.tarea_id);
    });

    // Data Get Function
    //this._fetchData();
  }
  private getTaskById(tarea_id: any){

    this.showPreLoader();
      this.projectsService.getTaskById(tarea_id).pipe().subscribe(
        (data: any) => {
          this.tarea = data.data;
          this.status = data.data.estado;
          
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  changeStatus(status: any){
    this.status = status;
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

  imgError(ev: any){

    let source = ev.srcElement;
    let imgSrc = 'assets/images/new-document.png';//'assets/images/logo_conect_ia.png';

    source.src = imgSrc;
  }
   
onFileSelectedEvaluation(event: any){
  this.selectedFile = <File>event[0];

var reader = new FileReader();
  reader.readAsDataURL(this.selectedFile);
  reader.onload = (_event) => {
    console.log(reader.result);
    //this.imgView = reader.result;
    //this.pdfURL = this.selectedFile.name;
    //this.formUsuario.controls['img'].setValue(this.selectedFile);
    }
}
  
  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
  * Form data get
  */
  get form() {
    return this.folderForm.controls;
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

  
  formatTask(texto:any, idParte: any){
    
    const index = this.showRow2.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1 ? texto : texto.substr(0,450)+'...';
  }

  showText2(idParte: any){
    this.showRow2.push(idParte);
  }

  hideText2(idParte: any){
    
    const index = this.showRow2.findIndex(
      (co: any) =>
        co == idParte
    );

    this.showRow2.splice(index, 1);
  }

  validatShow2(idParte: any){
    const index = this.showRow2.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1;
  }

  formatTask2(texto:any, idParte: any){
    
    const index = this.showRow3.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1 ? texto.replace('<', '').replace("/", '').replace('p>', '').replace('<', '').replace('p>', '') : texto.substr(0,450).replace('<', '').replace("/", '').replace('p>', '').replace('<', '').replace('p>', '')+'...';
  }

  showText3(idParte: any){
    this.showRow3.push(idParte);
  }

  hideText3(idParte: any){
    
    const index = this.showRow3.findIndex(
      (co: any) =>
        co == idParte
    );

    this.showRow3.splice(index, 1);
  }

  validatShow3(idParte: any){
    const index = this.showRow3.findIndex(
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
  
  editTask(){
    
    this.showPreLoader();

    let comentario: any = this.taskForm.get('comentario')?.value;
    const task: any = {
      estado: this.status,
      comentario: comentario
    };

    const formData = new FormData();

    formData.append('evidenciaFile', this.selectedFile);
    
    formData.append('data', JSON.stringify(task));
    
    this.projectsService.updateTaskStatus(this.tarea_id, formData).pipe().subscribe(
      (data: any) => {     
       this.hidePreLoader();
       
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Tarea actualizada',
          showConfirmButton: true,
          timer: 5000,
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

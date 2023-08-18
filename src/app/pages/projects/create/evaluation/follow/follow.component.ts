import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe, Location } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './follow.model';
import { folderData } from './data';
import { RecentService } from './follow.service';
import { NgbdRecentSortableHeader, SortEvent } from './follow-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';

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
  HallazgosDatas: any = [];

  status: any;

  PlaceInput: any;
  public imagePath: any;
  imgURL: any;

  //selectedFile: File;
  selectedFile: any;
  selectedFileEvaluation: any;
  pdfURL: any;

  imageChangedEvent: any = '';
  imgView: any;
  imgView2: any = [];
  myFiles:string [] = [];

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
      { label: 'Proyecto' },
      { label: 'Evaluar Cumplimiento' },
      { label: 'Registrar cumplimiento', active: true }
    ];

    document.body.classList.add('file-detail-show');

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

    /**
     * Recent Validation
    */
    this.recentForm = this.formBuilder.group({
      ids: [''],
      icon_name: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.project_id = params['idProject'];
      this.cuerpo_id = params['id'];
      this.installation_id = params['idInstallation'] ? params['idInstallation'] : null;
      this.installation_nombre = params['nameInstallation'] ? params['nameInstallation'] : null;

        this.getArticlesByInstallationBody(this.installation_id);
        this.getProject();
      
    });
  }

  getProject(){
    this.projectsService.getById(this.project_id).pipe().subscribe(
      (data: any) => {
        this.project = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
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

          this.cuerpoLegal = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].cuerpoLegal : '';
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }
  
  changeStatus(status: any){
    this.status = status;
  }

  changeStatusHallazgo(id: number, estado: number){
    const index = this.HallazgosDatas.findIndex(
      (h: any) =>
        h.id == id
    );

    let new_estado: any = estado == 1 ? 2 : (estado == 2 ? 3 : 1);

    this.HallazgosDatas[index].estado = new_estado;
  }
  
  saveHallazgo(){
    
    if (this.hallazgoForm.valid) {
      let nombre: any = this.hallazgoForm.get('nombre')?.value;
      let descripcion: any = null;//this.hallazgoForm.get('descripcion')?.value;
      //this.hallazgos.push({id: (this.hallazgos.length + 1), nombre: nombre});
      let fecha: any = new Date();
      
      this.HallazgosDatas.push({id: (this.HallazgosDatas.length > 0 ? (this.HallazgosDatas[this.HallazgosDatas.length-1].id + 1) : 1), nombre: nombre, descripcion: descripcion, fecha: fecha.getDate()+'/'+(fecha.getMonth() + 1)+'/'+fecha.getFullYear(), estado: 2});

      //this.myFiles.push(this.selectedFile);
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

  saveEvaluation(){
    if(!this.status || (this.status != 'CUMPLE' && this.status != 'NO CUMPLE' && this.status != 'CUMPLE PARCIALMENTE') || (this.status && (this.status == 'NO CUMPLE' || this.status == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1)){

      if(this.status && (this.status == 'NO CUMPLE' || this.status == 'CUMPLE PARCIALMENTE') && this.HallazgosDatas.length < 1){
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
    let fecha_termino: any = null;//this.evaluacionForm.get('fecha_termino')?.value;
    let comentario: any = this.evaluacionForm.get('comentario')?.value;
    let reportable: any = null;//this.evaluacionForm.get('reportable')?.value;
    let monitoreo: any = null;//this.evaluacionForm.get('monitoreo')?.value;
    let permiso: any = null;//this.evaluacionForm.get('permiso')?.value;
    let hallazgoImg: any = this.myFiles;
    let hallazgos: any = [];

    for (var h = 0; h < this.HallazgosDatas.length; h++) { 
      hallazgos.push({nombre: this.HallazgosDatas[h].nombre, descripcion: this.HallazgosDatas[h].descripcion});
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
      hallazgos: this.status == 'CUMPLE' ? /*JSON.stringify(*/[]/*)*/ : /*JSON.stringify(*/hallazgos/*)*/,
      estado: this.status,
      installationArticleId: this.cuerpo_id,
      //tipoArticulo: tipoArticulo,
      comentario: comentario,
      //hallazgoImg: hallazgoImg
      //articuloId: this.cuerpo_id,
      //installationId: this.installation_id,
      //projectId: this.project_id
    };

    const formData = new FormData();
    if(this.status == 'CUMPLE'){
      formData.append('evaluacionImg', this.selectedFileEvaluation);
    }else{
      formData.append('hallazgoImg', this.myFiles[0]);
    }
    formData.append('data', JSON.stringify(evaluations));
 
    /*for (var i = 0; i < this.myFiles.length; i++) { 
      //formData.append("hallazgoImg[]", this.myFiles[i]);
    }*/
    
    this.projectsService.saveEvaluation(formData).pipe().subscribe(
      (data: any) => {     
       this.hidePreLoader();
       
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Evaluación actualizada',
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
    })
  }
  }

onFileSelected(event: any){

  this.imageChangedEvent = event;
  this.selectedFile = <File>event.target.files[0];
  //console.log(this.selectedFile);
  //console.log(this.selectedFile.name);

var reader = new FileReader();
  reader.readAsDataURL(this.selectedFile);
  reader.onload = (_event) => {
    //console.log(reader.result);
    this.imgView = reader.result;
    //this.pdfURL = this.selectedFile.name;
    //this.formUsuario.controls['img'].setValue(this.selectedFile);
    }
}
  
onFileSelectedEvaluation(event: any){
  this.selectedFileEvaluation = <File>event[0];

var reader = new FileReader();
  reader.readAsDataURL(this.selectedFileEvaluation);
  reader.onload = (_event) => {
    console.log(reader.result);
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
    this.modalService.open(content, { size: 'md', centered: true });
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
            this.myFiles.splice(index, 1);

          //document.getElementById('lj_'+id)?.remove();
        /*},
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        });*/
    }
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

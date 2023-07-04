import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './body-legal-detail.model';
import { folderData } from './data';
import { RecentService } from './body-legal-detail.service';
import { NgbdRecentSortableHeader, SortEvent } from './body-legal-detail-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { ToastService } from '../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {Location} from '@angular/common';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-body-legal-detail-id',
  templateUrl: './body-legal-detail.component.html',
  styleUrls: ['./body-legal-detail.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * BodyLegalDetail Component
 */
export class BodyLegalDetailIdComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  cuerpo_id: any = '';
  detail: any = [];
  installations_articles: any = [];
  articles_proyects: any = [];

  folderData!: DetailModel[];
  submitted = false;
  folderForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  recentDatas: any;
  articulosDatas: any;
  simpleDonutChart: any;
  public isCollapsed: any = 'Encabezado';
  public isCollapsed2: any = '';
  public isCollapsed3: any = '';
  public isCollapsed4: any = '';
  public isCollapsed5: any = '';
  public isCollapsed6: any = '';
  public isCollapsed7: any = '';
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
  total_cuerpos: number = 0;
  total_articulos: number = 0;

  showMenu: boolean = true;
  showDetail: boolean = true;

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2, private _location: Location) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Identificación'},
      { label: 'Cuerpos Legales' },
      { label: 'Detalle', active: true }
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

    this.route.params.subscribe(params => {
      this.project_id = params['idProject'];
      this.cuerpo_id = params['id'];
      this.getArticleProyect(this.project_id);
        //this.getArticlesByInstallation(this.installation_id);
      
    });

    // Data Get Function
    this._fetchData();
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  /*validateIdparte(idParte: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index == -1;
  }*/

  validateIdparte(idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index == -1;
  }

  isValidMonitoreo(idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index != -1 ? this.articles_proyects[index].monitoreo : false;
  }

  monitoreoArticle(e: any, idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects[index].monitoreo = e.currentTarget.checked; 
    }
  }

  isValidReporte(idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index != -1 ? this.articles_proyects[index].reporte : false;
  }

  reporteArticle(e: any, idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects[index].reporte = e.currentTarget.checked; 
    }
  }

  isValidPermiso(idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index != -1 ? this.articles_proyects[index].permiso : false;
  }

  permisoArticle(e: any, idParte: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects[index].permiso = e.currentTarget.checked; 
    }
  }

  clickMenu(){
    this.showMenu = !this.showMenu;
  }

  clickDetail(){
    this.showDetail = !this.showDetail;
  }

  clickEncabezado(){
    this.showEncabezado = !this.showEncabezado;
  }

  private getArticlesByInstallation(installation_id: any){

    this.showPreLoader();
      this.projectsService.getArticlesByInstallation(installation_id).pipe().subscribe(
        (data: any) => {
          this.installations_articles = data.data;

          let total_articulos: any = [];
          let total_cuerpos: any = [];

          
          for (var j = 0; j < this.installations_articles.length; j++) {
            if(this.installations_articles[j].proyectoId == this.project_id){
              total_articulos.push(this.installations_articles[j]);
              
              const index = total_cuerpos.findIndex(
                (cu: any) =>
                  cu == this.installations_articles[j].cuerpoLegal
              );

              if(index == -1){
                total_cuerpos.push(this.installations_articles[j].cuerpoLegal);
              }

            }
          }
          this.total_articulos = total_articulos.length;
          this.total_cuerpos = total_cuerpos.length;

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getArticleProyect(project_id: any){

    this.showPreLoader();
      this.projectsService.getArticleProyect(project_id).pipe().subscribe(
        (data: any) => {
          this.articles_proyects = data.data;
          console.log('articles_proyects', this.articles_proyects);

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

  /*isCollapsedActive(idParte: any){
    const index = this.isCollapsed.findIndex(
      (co: any) =>
        co == idParte
    );
    if(index != -1){
      this.isCollapseArray[index] = false;
    }else{
      this.isCollapsed.push({idParte: true});
    }

    console.log('Collapse',this.isCollapsed);
    //return index != -1;
    //return true;
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

  /** Get is Expanded */
  isExpanded(id?: any, nivel?: number) {

    switch (nivel) {
      case 1:
        return this.isCollapsed == 'r-'+id;
        break;
        case 2:
          return this.isCollapsed2 == 'r-'+id;
          break;
          case 3:
            return this.isCollapsed3 == 'r-'+id;
            break;
            case 4:      
              return this.isCollapsed4 == 'r-'+id;  
              break;
              case 5:      
                return this.isCollapsed5 == 'r-'+id;  
                break;
                case 6:      
                  return this.isCollapsed6 == 'r-'+id;  
                  break;
                  case 7:      
                    return this.isCollapsed7 == 'r-'+id;  
                    break;
    
      default:
        return this.isCollapsed == 'r-'+id;
        break;
    }
  }

  /**
  * Product Filtering  
  */
  changeProducts(e: any, name: any, index?: any, nivel?: number) {

    //this.collapse?.nativeElement.toggle();
    //this.collapse?.nativeElement.classList.toggle('active');

    //this.showEncabezado = name == 'r-Encabezado';

    this.isCollapseArray.push(name);

    switch (nivel) {
      case 1:
        this.isCollapsed = this.isCollapsed == name ? '' : name;
        break;
        case 2:
          this.isCollapsed2 = this.isCollapsed2 == name ? '' : name;
          break;
          case 3:
            this.isCollapsed3 = this.isCollapsed3 == name ? '' : name;
            break;
            case 4:
              this.isCollapsed4 = this.isCollapsed4 == name ? '' : name;
              break;
              case 5:
                this.isCollapsed5 = this.isCollapsed5 == name ? '' : name;
                break;
                case 6:
                  this.isCollapsed6 = this.isCollapsed6 == name ? '' : name;
                  break;
                  case 7:
                    this.isCollapsed7 = this.isCollapsed7 == name ? '' : name;
                    break;
    
      default:
        //this.isCollapsed = this.isCollapsed == name ? '' : name;
        break;
    }
    
    (document.getElementById(name) as HTMLElement).scrollIntoView({behavior: 'smooth'});

    /*(document.getElementById("folder-list") as HTMLElement).style.display = "none";
    this.recentData.subscribe(x => {
      this.recentDatas = x.filter((product: any) => {
        return product.type === name;
      });
    });*/
  }

  cancelar() {
    this._location.back();
  }

  saveArticles(){
    
    this.showPreLoader();
    
    for (var j = 0; j < this.articles_proyects.length; j++) {
    
    this.projectsService.conectArticleProyect(this.articles_proyects[j]).pipe().subscribe(
      (data: any) => {     
       //this.hidePreLoader();
       //this.installations_articles.push({articuloId: article_id});
       //this.getArticlesByInstallation(this.installation_id);
       
       /*Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Artículo conectado',
          showConfirmButton: true,
          timer: 5000,
        });*/
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

    this.hidePreLoader();
       Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Artículo conectado',
          showConfirmButton: true,
          timer: 5000,
        });

        setTimeout(() => {
          this._location.back();
        }, 5000);
    
  }

  conectArticle(article_id?: any, tituloParte?: any, tipoParte?: any, texto?: any){
    
    //this.showPreLoader();
    
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.articuloId == article_id && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects.splice(index, 1);
    }else{

    const article: any = tituloParte ? tituloParte : (texto ? (texto.split(".")[0].length > 10 ? texto.split(".")[0] : tipoParte) : tipoParte);
    const description: any = texto ? texto : tipoParte;

    const article_installation: any = {
      articuloId: article_id,
      articulo: article,
      descripcion: description,
      tipoParte: tipoParte,
      normaId: this.cuerpo_id,
      cuerpoLegal: this.detail.identificador ? this.detail.identificador.tipoNorma+' '+this.detail.identificador.numero : null,
      proyectoId: this.project_id,
      monitoreo: false,
      reporte: false,
      permiso: false
    };

    this.articles_proyects.push(article_installation);
    
    /*this.projectsService.conectArticleInstallation(this.installation_id,article_installation).pipe().subscribe(
      (data: any) => {     
       this.hidePreLoader();
       this.installations_articles.push({articuloId: article_id});
       this.getArticlesByInstallation(this.installation_id);
       
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Artículo conectado',
          showConfirmButton: true,
          timer: 5000,
        });
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

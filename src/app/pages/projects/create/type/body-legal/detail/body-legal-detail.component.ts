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
import { ProjectsService } from '../../../../../../core/services/projects.service';
import { ToastService } from '../../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-body-legal-detail',
  templateUrl: './body-legal-detail.component.html',
  styleUrls: ['./body-legal-detail.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * BodyLegalDetail Component
 */
export class BodyLegalDetailComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  cuerpo_id: any = '';
  installation_id: any = null;
  installation_id_select: any = [];
  installation_nombre: any = null;
  detail: any = [];
  installations: any = [];
  installations_articles: any = [];

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

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Vinculación'},
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
      this.installation_id = params['idInstallation'] ? params['idInstallation'] : null;
      this.installation_nombre = params['nameInstallation'] ? params['nameInstallation'] : null;

      if(!this.installation_id){
        this.getInstallations();
      }else{
        this.getArticlesByInstallation(this.installation_id);
      }
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

  validateIdparte(idParte: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.articuloId == idParte && co.proyectoId == this.project_id
    );

    return index == -1;
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }
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


  saveInstallation(){
    this.installation_id = this.installation_id_select[this.installation_id_select.length - 1].value;
    /*const index = this.installations.findIndex(
      (co: any) =>
        co.id == this.installation_id
    );*/

    this.installation_nombre = /*this.installations[index].nombre*/this.installation_id_select[this.installation_id_select.length - 1].label;
    this.getArticlesByInstallation(this.installation_id);
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

  conectArticle(article_id?: any, tituloParte?: any, tipoParte?: any, texto?: any){
    
    this.showPreLoader();

    const article: any = tituloParte ? tituloParte : (texto ? (texto.split(".")[0].length > 10 ? texto.split(".")[0] : tipoParte) : tipoParte);
    const description: any = texto ? texto : tipoParte;

    const article_installation: any = {
      articuloId: article_id,
      articulo: article,
      descripcion: description,
      tipoParte: tipoParte,
      normaId: this.cuerpo_id,
      cuerpoLegal: this.detail.identificador ? this.detail.identificador.tipoNorma+' '+this.detail.identificador.numero : null,
      proyectoId: this.project_id
    };
    
    this.projectsService.conectArticleInstallation(this.installation_id,article_installation).pipe().subscribe(
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

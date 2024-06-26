import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { SubArticlesModel, recentModel } from './sub-articles.model';
import { folderData } from './data';
import { RecentService } from './sub-articles.service';
import { NgbdRecentSortableHeader, SortEvent } from './sub-articles-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { ToastService } from '../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {Location} from '@angular/common';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sub-articles',
  templateUrl: './sub-articles.component.html',
  styleUrls: ['./sub-articles.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * SubArticles Component
 */
export class SubArticlesComponent implements OnInit {

  @Output() backFunction = new EventEmitter();
  @Output() addFunction = new EventEmitter();
  
  @Input('articulo_padre') articulo_padre: any;

  articulo: any = {};
  articulos_padres: any = [];
  index_padre: number = 0;

  // bread crumb items
  breadCrumbItems!: Array<{
    active?: boolean;
    label?: string;
  }>;

  cuerpo_id: any = '';
  detail: any = [];
  
  folderData!: SubArticlesModel[];
  submitted = false;
  folderForm!: UntypedFormGroup;
  folderDatas: any;
  recentForm!: UntypedFormGroup;
  busquedaForm!: UntypedFormGroup;
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
  articulosData!: Observable<SubArticlesModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdRecentSortableHeader) headers!: QueryList<NgbdRecentSortableHeader>;

  htmlString: any = "";
  htmlStringArticle: any = "";
  tituloModal: any = "";
  showRow: any = [];

  items: any = [];

  showMenu: boolean = true;
  showDetail: boolean = true;
  
  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;
  buscar: any;
  addSubArticle: boolean = false;
  editSubArticle: boolean = false;
  search: any;

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2, private _location: Location) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: this.articulo_padre.titulo, active: true }
    ];

    this.articulos_padres.push(this.articulo_padre);
    this.articulo = this.articulo_padre;

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
    
    this.busquedaForm = this.formBuilder.group({
      busqueda: ['']
    });

    this.route.params.subscribe(params => {
      this.cuerpo_id = params['id'];
    });

  }
  
  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  showDetailArticle(titulo: any, texto: any, content: any) {
      this.submitted = false;
      this.modalService.open(content, {/* size: 'lg', */centered: true });

      this.tituloModal = titulo;
      this.htmlStringArticle = this.sanitizer.bypassSecurityTrustHtml((texto ? texto.replace(/\n/gi,'<br>') : ''));    
  }

  showDetailEncabezado(texto: any, content: any){
    this.modalService.open(content, {/* size: 'lg', */centered: true});
    this.htmlString = this.sanitizer.bypassSecurityTrustHtml((texto ? texto.replace(/\n/gi,'<br>') : ''));

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
    return index != 1;
    //return true;
  }*/

  formatArticle(texto:any, idParte: any){
    
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idParte
    );

    return index != -1 ? texto : texto.substr(0,450)+'...';
  }
  
  formatEncabezado(texto:any){
    return texto ? texto.substr(0,450)+'...' : '';
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
  
  clickMenu(){
    this.showMenu = !this.showMenu;
  }

  clickDetail(){
    this.showDetail = !this.showDetail;
  }
  
  clickEncabezado(){
    this.showEncabezado = !this.showEncabezado;
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

  onFindPage($event: any){
  const searchText = this.buscar.toLowerCase();
  // Recorrer todos los elementos de la página.
  const elements: any = document.querySelectorAll('.articles');

  // Comparar el texto del elemento de entrada con el texto de cada elemento.
  for (let i = 0; i < elements.length; i++) {
    const elementText = elements[i].textContent.toLowerCase();

    // Si el texto del elemento de entrada coincide con el texto de un elemento de la página, resalta ese elemento.
    if (elementText.includes(searchText)) {
      elements[i].style.backgroundColor = '#d9e1fd';
    }
  }

  }

  /**
  * Product Filtering  
  */
  changeProducts(e: any, name: any, index?: any, nivel?: number) {

    //this.collapse?.nativeElement.toggle();
    //this.collapse?.nativeElement.classList.toggle('active');

    //this.showEncabezado = name == 'r-Encabezado';

    this.isCollapseArray = [name];switch (nivel) {
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
  
  getBreadCrumbItems(){
    this.breadCrumbItems = [];
    for (let index = 0; index < this.articulos_padres.length; index++) {
      
      this.breadCrumbItems.push({ label: this.articulos_padres[index].titulo, active: index == (this.articulos_padres.length - 1) ? true : false });
      
    }
  }

  openAddSubArticle(index: number, articulo?: any){
    this.index_padre = index;
    this.articulos_padres.push(articulo);
    this.articulo = articulo;
    this.getBreadCrumbItems();
  }

  showAddSubArticle(){
    this.addSubArticle = true;
  }
  
  showEditArticle(index: number, articulo_padre?: any){

    this.articulo_padre = articulo_padre;
    this.index_padre = index;
    this.editSubArticle = true;
  }

  hideAddSubArticle(event?: any){
    this.addSubArticle = false;
    this.editSubArticle = false;
  }
  
  deleteArticle(index: number, articulo?: any){

    if(!articulo.id || (articulo.id && parseInt(articulo.id) < 1)){
      this.articulo.articulos.splice(index,1);
    }else if(articulo.id && parseInt(articulo.id) > 0){
      this.articulo.articulos[index].eliminado = true;

      if(this.articulo.articulos[index].articulos.length > 0){
        
        for (let j = 0; j < this.articulo.articulos[index].articulos.length; j++) {
          this.articulo.articulos[index].articulos[j].eliminado = true;

          if(this.articulo.articulos[index].articulos[j].articulos.length > 0){
        
            for (let z = 0; z < this.articulo.articulos[index].articulos[j].articulos.length; z++) {
              this.articulo.articulos[index].articulos[j].articulos[z].eliminado = true;
            }
          }
        }
      }
    }
  }
  
  backClicked(){
    
    if(this.articulos_padres.length > 1){

      this.articulo = this.articulos_padres[this.articulos_padres.length - 2];
      this.articulos_padres.pop();
      this.getBreadCrumbItems();
      
    }else{
      this.backFunction.emit();
    }
  }
  
  saveClicked(){
    if(this.articulos_padres.length > 1){
      console.log('Guardar SUBSUB',this.articulo);
      this.articulos_padres[this.articulos_padres.length - 1] = this.articulo;

      this.articulo = this.articulos_padres[this.articulos_padres.length - 2];
      this.articulos_padres.pop();
      this.getBreadCrumbItems();

    }else{
      this.articulo_padre = this.articulo;
      this.addFunction.emit(this.articulo_padre);
    }
  }
  
  saveArticulos(article?: any){
    
    this.articulo.articulos.push(article);

    console.log('SubArticulo_add', article);
    console.log('SubArticulos', this.articulo.articulos);
    this.hideAddSubArticle();
  }
  
  editSubArticulos(article?: any){
    this.articulo.articulos[this.index_padre] = article;
    
    console.log('SubArticulo_add', article);
    console.log('SubArticulos', this.articulo.articulos);
    this.hideAddSubArticle();
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

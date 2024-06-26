import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { ArticlesModel, recentModel } from './articles.model';
import { folderData } from './data';
import { RecentService } from './articles.service';
import { NgbdRecentSortableHeader, SortEvent } from './articles-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { ToastService } from '../toast-service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {Location} from '@angular/common';
import * as moment from 'moment';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * Articles Component
 */
export class ArticlesComponent implements OnInit {
  
  @Output() backFunction = new EventEmitter();
  @Output() addFunction = new EventEmitter();
  @Output() editFunction = new EventEmitter();

  @Input('articulo_data') articulo_data: any;

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  cuerpo_id: any = '';
  detail: any = [];
  
  folderData!: ArticlesModel[];
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
  articulosData!: Observable<ArticlesModel[]>;
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
  
  articuloForm!: UntypedFormGroup;
  userData: any;
  
  public Editor = ClassicEditor;

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2, private _location: Location, private TokenStorageService: TokenStorageService) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Biblioteca' },
      { label: 'Cuerpos Legales' },
      { label: 'Detalle', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

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
    
    this.articuloForm = this.formBuilder.group({
      titulo: ['', [Validators.required]],
      contenido: [''],
      tipoParte: ['']
    });

    this.route.params.subscribe(params => {
      this.cuerpo_id = params['id'];
    });

    if(this.articulo_data){
      this.setValue(this.articulo_data);
    }

    // Data Get Function
    //this._fetchData();
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.articuloForm.controls; }

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
  
  setValue(data:any){
    this.articuloForm.controls['titulo'].setValue(data.titulo);
    this.articuloForm.controls['contenido'].setValue(data.contenido);
    this.articuloForm.controls['tipoParte'].setValue(data.tipoParte == 'Artículo' ? true : false);
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
  
  backClicked(){
    this.backFunction.emit();
  }

  quitarEtiquetasPTags(texto: string): string {
    if(texto){
      if (texto.startsWith('<p>') && texto.endsWith('</p>')) {
        return texto.slice(3, -4);
      } else {
        return texto;
      }
    }else{
      return texto;
    }
  }

  generateAlphanumericId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }
    return id;
  }
  
  saveClicked(){
    this.submitted = true;
    // stop here if form is invalid
    if (this.articuloForm.invalid) {
      return;
    }

    const fecha = Date.now();

    if(this.articulo_data && this.articulo_data.id/* > 0*/){
    
      const articulo_edit: any = {
        id: this.articulo_data.id,
        titulo: this.articuloForm.get('titulo')?.value,
        contenido: this.quitarEtiquetasPTags(this.articuloForm.get('contenido')?.value),
        created_at: this.articulo_data.created_at,
        updated_at: moment(fecha).format('DD-MM-yyyy'),
        usuario_id: this.userData.id,
        usuario: this.userData,
        tipoParte: this.articuloForm.get('tipoParte')?.value ? 'Artículo' : 'Título',
        articulos: this.articulo_data.articulos,
        eliminado: false
      }
      this.editFunction.emit(articulo_edit);

    }else{

      const articulo: any = {
        id: this.generateAlphanumericId(4),//null,
        titulo: this.articuloForm.get('titulo')?.value,
        contenido: this.quitarEtiquetasPTags(this.articuloForm.get('contenido')?.value),
        created_at: moment(fecha).format('DD-MM-yyyy'),
        updated_at: moment(fecha).format('DD-MM-yyyy'),
        usuario_id: this.userData.id,
        usuario: this.userData,
        tipoParte: this.articuloForm.get('tipoParte')?.value ? 'Artículo' : 'Título',
        articulos: [],
        eliminado: false
      }
      this.addFunction.emit(articulo);
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

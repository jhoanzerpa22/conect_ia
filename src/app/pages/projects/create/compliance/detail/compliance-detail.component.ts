import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './compliance-detail.model';
import { folderData } from './data';
import { RecentService } from './compliance-detail.service';
import { NgbdRecentSortableHeader, SortEvent } from './compliance-detail-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { TokenStorageService } from '../../../../../core/services/token-storage.service';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';

@Component({
  selector: 'app-compliance-detail',
  templateUrl: './compliance-detail.component.html',
  styleUrls: ['./compliance-detail.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * ComplianceDetail Component
 */
export class ComplianceDetailComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  installation_id: any = null;
  detail: any = [];
  cuerpos_articulos: any = [];
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
  public isCollapsed: any = [];
  isCollapseArray: any = ['Encabezado'];
  showEncabezado: boolean = true;

  // Table data
  recentData!: Observable<recentModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdRecentSortableHeader) headers!: QueryList<NgbdRecentSortableHeader>;

  htmlString: any = "";
  showRow: any = [];
  userData:any;

  items: any = [];
  cuerpo_select: any = '';

  cumple: number = 0;
  nocumple: number = 0;
  parcial: number = 0;
  avance: number = 0;
  total_articulos: number = 0;

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;

  constructor(private modalService: NgbModal, public service: RecentService, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2,private TokenStorageService : TokenStorageService) {
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Evaluar Cumplimiento' },
      { label: 'Detalle', active: true }
    ];

    document.body.classList.add('file-detail-show');

    this.userData = this.TokenStorageService.getUser();

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
      this.installation_id = params['id'];

        this.getArticlesByInstallationBody(this.installation_id);
      
    });

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

  /**
   * Fetches the data
   */
  private _fetchData() {
    
    this.showPreLoader();
      this.projectsService.getBodyLegalByNorma(null).pipe().subscribe(
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

  validateIdparte(idParte: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.articulo == idParte
    );

    return index == -1;
  }

  selectCuerpo(cuerpo: any){
    
    this.showPreLoader();
    this.cuerpo_select = cuerpo;
    this.articulosDatas = this.detail.data.filter((data: any) => {
      return data.cuerpoLegal === cuerpo;
    })[0].articulos;
    
    this.hidePreLoader();
  }

  validateCuerpo(cuerpo: any){
    return this.cuerpo_select == cuerpo;
 }

  private getArticlesByInstallationBody(installation_id: any){

    this.showPreLoader();
      this.projectsService.getArticlesByInstallationBody(installation_id).pipe().subscribe(
        (data: any) => {
          this.detail = data.data;
          let articulos: any = data.data.data.length > 0 ? data.data.data : [];
          let cuerpo_articulos: any = [];
          //this.installations_articles = data.data;

          let cumple: number = 0;
          let nocumple: number = 0;
          let parcial: number = 0;
          let avance: number = 0;
          let total: number = 0;

          for (var i = 0; i < articulos.length; i++) {
            if(articulos[i].articulos.length > 0){
              //total += articulos[i].articulos.length;
              let procede: boolean = false;
              for (var j = 0; j < articulos[i].articulos.length; j++) {
                if(articulos[i].articulos[j].proyectoId == this.project_id){
                  total += 1;
                  procede = true;
                  if(articulos[i].articulos[j].evaluations.estado){
                    switch (articulos[i].articulos[j].evaluations.estado) {
                      case 'CUMPLE':
                        cumple ++;
                        break;

                      case 'NO CUMPLE':
                          nocumple ++;
                        break;
                      
                      case 'CUMPLE PARCIALMENTE':
                        parcial ++;
                        break;
                    
                      default:
                        break;
                    }
                    
                  }
                }
              }
              if(procede){
                cuerpo_articulos.push(articulos[i]);
              }
            }
          }

          avance = total > 0 ? ((((cumple * 100) + (nocumple * 0) + (parcial * 50)) * 100) / (total * 100)) : 0;

          this.avance = round(avance, 0);
          this.total_articulos = total;

          this.cumple = cumple;
          this.nocumple = nocumple;
          this.parcial = parcial;

          //this.articulosDatas = articulos.length > 0 ? articulos[0].articulos : [];
          this.articulosDatas = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].articulos : [];

          //this.cuerpo_select = articulos.length > 0 ? articulos[0].cuerpoLegal : '';
          this.cuerpo_select = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].cuerpoLegal : '';
          this.cuerpos_articulos = cuerpo_articulos;

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
  
  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
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

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
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

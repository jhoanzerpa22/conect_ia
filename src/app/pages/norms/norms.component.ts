import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { NormsModel } from './norms.model';
import { Norms } from './data';
import { NormsService } from './norms.service';
import { NgbdNormsSortableHeader, SortEvent } from './norms-sortable.directive';
import { ProjectsService } from '../../core/services/projects.service';
import { NormasArticlesAllService } from '../../core/services/normas_articles.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from './toast-service';
import { round } from 'lodash';
import { TokenStorageService } from '../../core/services/token-storage.service';
//import { filter } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-norms',
  templateUrl: './norms.component.html',
  styleUrls: ['./norms.component.scss'],
  providers: [NormsService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class NormsComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  BodyLegalData!: NormsModel[];
  checkedList: any;
  masterSelected!: boolean;
  BodyLegalDatas: any;
  body_legal_data: any = [];

  // Table data
  BodyLegalList!: Observable<NormsModel[]>;
  total: Observable<number>;
  total_body: number = 0;
  total_paginate: number = 0;
  @ViewChildren(NgbdNormsSortableHeader) headers!: QueryList<NgbdNormsSortableHeader>;
  page: number = 1;
  term:any;
  busquedaForm!: UntypedFormGroup;
  cuerpoForm!: UntypedFormGroup;
  search: any = '';
  type_search: any = 'by_texto';
  userData: any;

  addArticle: boolean = false;
  addSubArticle: boolean = false;
  editArticle: boolean = false;

  cuerpoLegal: any = {
    normaId: '',
    titulo: '',
    subtitulo: '',
    organismo: '',
    ambito: '',
    encabezado: '',
    articulos: []
  };
  resumen: any = {
    normaId: '',
    titulo: '',
    subtitulo: '',
    organismo: '',
    ambito: '',
    encabezado: '',
    articulos: []
  };
  //articulos: any = [];
  articulo_padre: any = {};
  index_padre: number = 0;
  
  index_resumen: number = 0;
  subArticles: any = [];
  
  showRow: any = [];
  showContainerArticles: any = [];

  accion: any = 'crear';
  norma_id: any = null;
  norma_data: any = {};

  constructor(private modalService: NgbModal, public service: NormsService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService, private TokenStorageService: TokenStorageService, private normasService: NormasArticlesAllService) {
    this.BodyLegalList = service.bodylegal$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Cuerpos Legales' },
      { label: 'Crear', active: true }
    ];
    
    this.userData = this.TokenStorageService.getUser();

    this.busquedaForm = this.formBuilder.group({
      busqueda: [''],
      tipo_busqueda: ['by_texto']
    });

    this.cuerpoForm = this.formBuilder.group({    
      normaId: ['', [Validators.required]],
      titulo: ['', [Validators.required]],
      subtitulo: ['', [Validators.required]],
      organismo: [''],
      ambito: [''],
      encabezado: ['']
    });

    //this.fetchData();

    /**
     * fetches data
     */
    this.BodyLegalList.subscribe(x => {
      this.BodyLegalDatas = Object.assign([], x);
    });
    
    this.route.params.subscribe(params => {
      this.accion = params['id'] > 0 ? 'editar' : 'crear';
      this.norma_id = params['id'] > 0 ? params['id'] : null;
      
      if(params['id'] > 0){
        this.getNormaId(params['id']);
      }
    });
    
    /*const search: any = this.route.snapshot.queryParams['search'];
    if(search && search != '' && search != undefined ? search : ''){
      const type_search: any = this.route.snapshot.queryParams['type_search'];
      const paginate: any = this.route.snapshot.queryParams['paginate'];
      this.search = search;
      this.type_search = type_search;
      this.page = paginate;
      this.busquedaNorma(search, type_search, paginate);
    }else{
      this.busquedaNorma('', 'by_texto', 1);
    }*/
    
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.cuerpoForm.controls; }

  setValue(data:any, articulos: any){
    this.cuerpoForm.controls['normaId'].setValue(data.normaId);
    this.cuerpoForm.controls['titulo'].setValue(data.cuerpoLegal);
    this.cuerpoForm.controls['subtitulo'].setValue(data.tituloNorma);
    this.cuerpoForm.controls['organismo'].setValue(data.organismo);
    this.cuerpoForm.controls['ambito'].setValue(data.ambito);
    this.cuerpoForm.controls['encabezado'].setValue(data.encabezado);

    const cuerpoLegal: any = {
      normaId: data.normaId,
      titulo: data.cuerpoLegal,
      subtitulo: data.tituloNorma,
      organismo: data.organismo,
      encabezado: data.encabezado,
      ambito: data.ambito,
      articulos: articulos
    }

    this.cuerpoLegal = cuerpoLegal;
    this.resumen = this.cuerpoLegal;
   }

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  busquedaNorma(search?:any, type_search?: any, paginate?: any){    
    let busqueda: any = search ? search : this.busquedaForm.get('busqueda')?.value;
    let tipo_busqueda: any = type_search ? type_search : this.busquedaForm.get('tipo_busqueda')?.value;
    let page = paginate ? paginate : this.page;

    this.search = busqueda;
    this.type_search = tipo_busqueda;
    this.page = page;
    //if(busqueda && busqueda != '' && busqueda != undefined && busqueda != null){
      this.showPreLoader();
      
      this._router.navigate(['/library'], { queryParams: { search: busqueda, type_search: tipo_busqueda, paginate: page} });

      if(tipo_busqueda == 'by_texto'){
      this.projectsService./*getBodyLegalSearch(1, busqueda, 100)*/getBodyLegalSearchChile(page, busqueda, 10).pipe().subscribe(
        (data: any) => {
          console.log(data.data);
          if(data && data.data){
            this.service.bodylegal_data = data.data ? data.data.normas : [];
            this.body_legal_data = data.data ? data.data.normas : [];
            this.total_body = data.data ? (data.data.normas.length > 0 ? data.data.total : 0) : 0;
            this.total_paginate = data.data ? (data.data.normas.length > 0 ? data.data.total : 0) : 0;
            //this.total_paginate = data.data.total > 180 ? 180 : data.data.total;
          }else{
            this.service.bodylegal_data = [];
            this.body_legal_data = [];
            this.total_body = 0;
            this.total_paginate = 0;
            
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'No se encontraron registros',
              showConfirmButton: true,
              timer: 5000,
            });
            
          }
          
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      }else{
        this.projectsService.getBodyLegalByNorma(busqueda).pipe().subscribe(
          (data: any) => {
            console.log(data.data);
            if(data && data.data){
              const detail: any = data.data;
              const info: any = data.data ? [{FechaPublicacion: detail.dates.fechaPublicacionNorma ? detail.dates.fechaPublicacionNorma : '', InicioDeVigencia: detail.dates.fechaVigenciaNorma ? detail.dates.fechaVigenciaNorma : '', idNorma: detail.normaId, TipoNumero: {Compuesto: detail.identificador ? (detail.identificador.tipoNorma ? detail.identificador.tipoNorma+' '+detail.identificador.numero : '') : ''} , TituloNorma: detail.tituloNorma }] : [];

              this.service.bodylegal_data = info;
              this.body_legal_data = info;
              this.total_body = data.data ? 1 : 0;
              this.total_paginate = data.data > 0 ? 1 : 0;
              //this.total_paginate = data.data.total > 180 ? 180 : data.data.total;
            }else{
              this.service.bodylegal_data = [];
              this.body_legal_data = [];
              this.total_body = 0;
              this.total_paginate = 0;
              
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'No se encontraron registros',
                showConfirmButton: true,
                timer: 5000,
              });
              
            }
            
            this.hidePreLoader();
        },
        (error: any) => {
          this.hidePreLoader();
          //this.error = error ? error : '';
          this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
        });
      }

      document.getElementById('elmLoader')?.classList.add('d-none')
    //}
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.BodyLegalData = BodyLegal;
  //   this.BodyLegalDatas = Object.assign([], this.BodyLegalData);
  // }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getBodyLegalALl(1, this.page, 20)/*getBodyLegal(1)*/.pipe().subscribe(
        (data: any) => {
          this.service.bodylegal_data = data.data.data;
          this.total_body = data.data.total;
          this.total_paginate = data.data.total > 180 ? 180 : data.data.total;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  showAddArticle(){
    this.addArticle = true;
  }

  hideAddArticle(event?: any){
    this.addArticle = false;
    this.editArticle = false;
  }
  
  showAddSubArticle(index: number, articulo_padre?:any){
    this.articulo_padre = articulo_padre;
    this.index_padre = index;
    this.addSubArticle = true;
  }

  showEditArticle(index: number, articulo_padre?: any){

    this.articulo_padre = articulo_padre;
    this.index_padre = index;
    this.editArticle = true;
  }

  hideAddSubArticle(event?: any){
    this.addSubArticle = false;
  }

  deleteArticle(index: number, articulo?: any){

    if(!articulo.id){
      this.cuerpoLegal.articulos.splice(index,1);
    }else{
      this.cuerpoLegal.articulos[index].eliminado = true;

      if(this.cuerpoLegal.articulos[index].articulos.length > 0){
        
        for (let j = 0; j < this.cuerpoLegal.articulos[index].articulos.length; j++) {
          this.cuerpoLegal.articulos[index].articulos[j].eliminado = true;

          if(this.cuerpoLegal.articulos[index].articulos[j].articulos.length > 0){
        
            for (let z = 0; z < this.cuerpoLegal.articulos[index].articulos[j].articulos.length; z++) {
              this.cuerpoLegal.articulos[index].articulos[j].articulos[z].eliminado = true;
            }
          }
        }
      }
    }
    
    this.resumen = this.cuerpoLegal;
  }

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }

  pageChange(page: any){
    //console.log('Pagina Cambiada',page);
      this.page = page;
      this.busquedaNorma(this.search, this.type_search, page);
  }

  saveCuerpoLegal(){
    this.submitted = true;
    // stop here if form is invalid
    if (this.cuerpoForm.invalid) {
      return;
    }

    const cuerpoLegal: any = {
      normaId: this.cuerpoForm.get('normaId')?.value,
      titulo: this.cuerpoForm.get('titulo')?.value,
      subtitulo: this.cuerpoForm.get('subtitulo')?.value,
      organismo: this.cuerpoForm.get('organismo')?.value,
      encabezado: this.cuerpoForm.get('encabezado')?.value,
      ambito: this.cuerpoForm.get('ambito')?.value,
      articulos: this.cuerpoLegal && this.cuerpoLegal.articulos && this.cuerpoLegal.articulos.length > 0 ? this.cuerpoLegal.articulos : []
    }

    this.cuerpoLegal = cuerpoLegal;
    this.resumen = this.cuerpoLegal;
    console.log('CuerpoLegal', cuerpoLegal);
  }

  saveArticulos(article?: any){
    //this.articulos.push(article);
    this.cuerpoLegal.articulos.push(article);
    this.resumen = this.cuerpoLegal;

    console.log('Articulo_add', article);
    console.log('Articulos', this.cuerpoLegal.articulos);
    this.hideAddArticle();
  }
  
  editArticulos(article?: any){
    this.cuerpoLegal.articulos[this.index_padre] = article;
    this.resumen = this.cuerpoLegal;

    console.log('Articulo_add', article);
    console.log('Articulos', this.cuerpoLegal.articulos);
    this.hideAddArticle();
  }
  
  saveSubArticulos(articles?: any){
    this.cuerpoLegal.articulos[this.index_padre] = articles;
    this.resumen = this.cuerpoLegal;

    console.log('SubArticulos_add', articles);
    console.log('Articulos', this.cuerpoLegal.articulos[this.index_padre]);
    this.hideAddSubArticle();
  }

  viewResumen(index: number, articulo?: any){
    this.index_resumen = index;
    this.subArticles.push(articulo);
    this.resumen = articulo;
  }

  hideResumen(){
    if(this.subArticles.length > 0){

      this.resumen = this.cuerpoLegal;
      this.subArticles.pop();
      
    }
  }
  
  validNormaId(normaId: string) {
    if(normaId && normaId != '' && normaId != this.norma_id){
      this.showPreLoader();

      this.normasService.getById(normaId).pipe().subscribe(
        (data: any) => {     
         this.hidePreLoader();
         
        if(data.data && data.data.length > 0){
         Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'El id Norma ya esta registrado',
          showConfirmButton: true,
          timer: 5000,
          });
          this.cuerpoForm.controls['normaId'].setValue('');
        }
  
      },
      (error: any) => {
        
        this.hidePreLoader();

        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'El id Norma ya esta registrado',
          showConfirmButton: true,
          timer: 5000,
        });

      });

    }
  }

  getArticles(articuloPadre: any, articulos_all: any){

    let articulos: any = [];

    for (let index = 0; index < articulos_all.length; index++) {
      if(articulos_all[index].articuloPadre && articulos_all[index].articuloPadre == articuloPadre){
        articulos.push({id: articulos_all[index].id, encabezado: articulos_all[index].articulo, titulo: articulos_all[index].articuloTitulo, contenido: articulos_all[index].descripcion, tipoParte: articulos_all[index].tipoParte ,created_at: moment(articulos_all[index].createdAt).format('DD-MM-yyyy'), updated_at: moment(articulos_all[index].updatedAt).format('DD-MM-yyyy'), usuario_id: this.userData.id, usuario: this.userData, articulos: this.getArticles(articulos_all[index].id, articulos_all), eliminado: false });
      }
    }

    return articulos;
  }
  
  getNormaId(normaId: string) {
    if(normaId && normaId != ''){
      this.showPreLoader();

      this.normasService.getById(normaId).pipe().subscribe(
        (data: any) => {     
         this.hidePreLoader();
         
        if(data.data && data.data.length > 0){
         this.norma_data = data.data[0];
         let articulos_all = data.data;
         let articulos = [];

          for (let index = 0; index < articulos_all.length; index++) {
            if(!articulos_all[index].articuloPadre){
              articulos.push({id: articulos_all[index].id, encabezado: articulos_all[index].articulo, titulo: articulos_all[index].articuloTitulo, contenido: articulos_all[index].descripcion, tipoParte: articulos_all[index].tipoParte ,created_at: moment(articulos_all[index].createdAt).format('DD-MM-yyyy'), updated_at: moment(articulos_all[index].updatedAt).format('DD-MM-yyyy'), usuario_id: this.userData.id, usuario: this.userData, articulos: this.getArticles(articulos_all[index].id, articulos_all), eliminado: false });
            }
          }
         this.setValue(this.norma_data, articulos);
        }
  
      },
      (error: any) => {
        
        this.hidePreLoader();

        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'La Norma no existe',
          showConfirmButton: true,
          timer: 5000,
        });

      });

    }
  }

  showArticles(i: any){
    this.showContainerArticles.push(i);
  }
  
  hideArticles(i: any){
    
    const index = this.showContainerArticles.findIndex(
      (co: any) =>
        co == i
    );
  
    this.showContainerArticles.splice(index, 1);
  }
  
  validateShowArticles(i: any){
    const index = this.showContainerArticles.findIndex(
      (co: any) =>
        co == i
    );
  
    return index == -1;
  }
  
  validatShow(idParte: any){
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idParte
    );
  
    return index != -1;
  }  

  saveAllCuerpo(){
    
    if (this.cuerpoForm.valid) {
      
    this.showPreLoader();

      if(this.norma_id > 0){
        this.normasService.update(this.cuerpoLegal, this.norma_id).pipe().subscribe(
          (data: any) => {     
          this.hidePreLoader();
          this.toastService.show('El registro ha sido modificado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
            this._router.navigate(['/library']);

        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
          this.modalService.dismissAll()
        });
      }else{

        this.normasService.create(this.cuerpoLegal).pipe().subscribe(
          (data: any) => {     
          this.hidePreLoader();
          this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
            this._router.navigate(['/library']);

        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
          this.modalService.dismissAll()
        });
      }
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

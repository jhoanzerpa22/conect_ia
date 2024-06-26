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
import { UserProfileService } from '../../core/services/user.service';
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
  search: any;
  type_search: any = 'by_texto';
  userData: any;

  addArticle: boolean = false;
  addSubArticle: boolean = false;
  editArticle: boolean = false;

  tipo: any = 'requisito';

  cuerpoLegal: any = {
    normaId: '',
    titulo: '',
    subtitulo: '',
    organismo: '',
    ambito: '',
    encabezado: '',
    fechaPublicacion: '',
    fechaPromulgacion: '',
    tipo: 'requisito',
    articulos: [],
    empresas: []
  };
  resumen: any = {
    normaId: '',
    titulo: '',
    subtitulo: '',
    organismo: '',
    ambito: '',
    encabezado: '',
    tipo: 'requisito',
    fechaPublicacion: '',
    fechaPromulgacion: '',
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
  
  empresas: any = [];
  ambitos: any = [];

  constructor(private modalService: NgbModal, public service: NormsService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService, private TokenStorageService: TokenStorageService, private normasService: NormasArticlesAllService, private userService: UserProfileService) {
    this.BodyLegalList = service.bodylegal$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Cuerpo Legal' },
      { label: 'Crear', active: true }
    ];
    
    this.userData = this.TokenStorageService.getUser();

    this.busquedaForm = this.formBuilder.group({
      busqueda: [''],
      tipo_busqueda: ['by_texto']
    });

    this.cuerpoForm = this.formBuilder.group({    
      normaId: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      titulo: ['', [Validators.required]],
      subtitulo: [''],
      organismo: [''],
      ambito: [''],
      encabezado: [''],      
      fechaPublicacion: [''],
      fechaPromulgacion: [''],
      tipo: ['requisito'],
      busqueda: [''],
      empresas: [['']]
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

      if(params['type'] && params['type'] != '' && params['type'] != undefined){
        this.getAmbitos(params['type']);
        this.tipo = params['type'];  
        this.cuerpoForm.controls['tipo'].setValue(params['type']);
    
        this.breadCrumbItems = [
          { label: this.getTitulo() },
          { label: params['id'] > 0 ? 'Editar' : 'Crear', active: true }
        ];
      }
      
      if(params['id'] > 0){
        this.getNormaId(params['id']);
      }
    });

    this.getEmpresas();
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.cuerpoForm.controls; }
 
  private getAmbitos(tipo?: any){
    let ambitos_select: any = [];
    switch (tipo) {
      case 'requisito':
        ambitos_select = [
          {value: 'GENERAL', label: 'Normativa general'},
          {value: 'MA', label: 'Normativa ambiental'},
          {value: 'SST', label: 'Normativa SST'},
          {value: 'LABORAL', label: 'Normativa laboral'},
          {value: 'ENERGIA', label: 'Normativa de energía'}
        ];
        break;

        
      case 'ambiental':
        ambitos_select = [
          {value: 'RCA', label: 'RCA'},
          {value: 'PERTINENCIA', label: 'Pertinencias'},
          {value: 'PDC', label: 'PDC'},
          {value: 'REP', label: 'REP'},
          {value: 'OTROS', label: 'Otros'}
        ];
        break;

      case 'sectorial':
        ambitos_select = [
          {value: 'SANITARIO', label: 'Sanitarios'},
          {value: 'MUNICIPAL', label: 'Municipales'},
          {value: 'ELECTRICO', label: 'Eléctricos'},
          {value: 'COMBUSTIBLE', label: 'Combustibles'},
          {value: 'OTROS', label: 'Otros'}
        ];
        break;
        
      case 'social':
        ambitos_select = [
          {value: 'DONACION', label: 'Donaciones'},
          {value: 'PATROCINIO', label: 'Patrocinios'},
          {value: 'FONDO', label: 'Fondos concursables'},
          {value: 'CONVENIO', label: 'Convenios'},
          {value: 'OTROS', label: 'Otros'}
        ];
        break;
        
      case 'otros':
        ambitos_select = [
          {value: 'NORMA', label: 'Normas'},
          {value: 'POLITICA', label: 'Políticas'},
          {value: 'PLAN', label: 'Planes'},
          {value: 'PROCEDIMIENTO', label: 'Procedimientos'},
          {value: 'OTROS', label: 'Otros'}
        ];
        break;

      default:
        ambitos_select = [
          {value: 'GENERAL', label: 'Normativa general'},
          {value: 'MA', label: 'Normativa ambiental'},
          {value: 'SST', label: 'Normativa SST'},
          {value: 'LABORAL', label: 'Normativa laboral'},
          {value: 'ENERGIA', label: 'Normativa de energía'}
        ];
        break;
    }
    
    this.ambitos = ambitos_select;

  }

  private getEmpresas(){
    
    //this.showPreLoader();
    this.userService.get().pipe().subscribe(
      (obj: any) => {
        const usuarios = obj.data;
        
        const empresas_all = usuarios.filter((us: any) => us.rol.includes(2) && us.active == true);

        for (let index = 0; index < empresas_all.length; index++) {

          if(this.empresas.findIndex((em: any) => em.value == empresas_all[index].empresaId) == -1){
            this.empresas.push({value: empresas_all[index].empresaId, label: empresas_all[index].empresa ? empresas_all[index].empresa : empresas_all[index].nombre+' '+empresas_all[index].apellido});  
          }
        }
        
      }
    );
      //document.getElementById('elmLoader')?.classList.add('d-none')
}

getTitulo(){
  switch (this.tipo) {
    case 'requisito':
      return 'Cuerpo Legal';
      break;
      case 'ambiental':
        return 'Permiso Ambiental';
        break;
        case 'sectorial':
          return 'Permiso Sectorial';
          break;
          case 'social':
            return 'Acuerdo Social';
            break;
            case 'otros':
              return 'Documento';
              break;
  
    default:
      return 'Cuerpo Legal';
      break;
  }
}

  setValue(data:any, articulos: any, empresas: any){
        this.tipo = data.tipo;
        
        this.getAmbitos(data.tipo);  
        
        this.breadCrumbItems = [
          { label: this.getTitulo() },
          { label: 'Editar', active: true }
        ];

    this.cuerpoForm.controls['normaId'].setValue(data.normaId);
    this.cuerpoForm.controls['titulo'].setValue(data.cuerpoLegal);
    this.cuerpoForm.controls['subtitulo'].setValue(data.tituloNorma);
    this.cuerpoForm.controls['organismo'].setValue(data.organismo);
    this.cuerpoForm.controls['ambito'].setValue(data.ambito);
    this.cuerpoForm.controls['encabezado'].setValue(data.encabezado);
    this.cuerpoForm.controls['tipo'].setValue(data.tipo);
    this.cuerpoForm.controls['fechaPublicacion'].setValue(data.fechaPublicacion);
    this.cuerpoForm.controls['fechaPromulgacion'].setValue(data.fechaPromulgacion);

    let empresas_select = [];
    for (let index = 0; index < empresas.length; index++) {
      empresas_select.push(empresas[index].empresaId);
      
    }
    
    this.cuerpoForm.controls['empresas'].setValue(empresas_select);

    const cuerpoLegal: any = {
      normaId: data.normaId,
      titulo: data.cuerpoLegal,
      subtitulo: data.tituloNorma,
      organismo: data.organismo,
      encabezado: data.encabezado,
      ambito: data.ambito,
      tipo: data.tipo,
      fechaPublicacion: data.fechaPublicacion,
      fechaPromulgacion: data.fechaPromulgacion,
      articulos: articulos,
      empresas: empresas_select
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

    if(!articulo.id || (articulo.id && parseInt(articulo.id) < 1)){
      this.cuerpoLegal.articulos.splice(index,1);
    }else if(articulo.id && parseInt(articulo.id) > 0){
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
      tipo: this.cuerpoForm.get('tipo')?.value,
      fechaPublicacion: this.cuerpoForm.get('fechaPublicacion')?.value,
      fechaPromulgacion: this.cuerpoForm.get('fechaPromulgacion')?.value,
      articulos: this.cuerpoLegal && this.cuerpoLegal.articulos && this.cuerpoLegal.articulos.length > 0 ? this.cuerpoLegal.articulos : [],
      empresas: []
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
    if(normaId && normaId != '' && normaId != this.norma_id && !this.f['normaId'].errors){
      this.showPreLoader();

      this.normasService.getValidNorma(normaId).pipe().subscribe(
        (data: any) => {     
         this.hidePreLoader();
         
        if(data.data && ((data.data.normas && data.data.normas.length > 0) || (data.data.normas_chile && data.data.normas_chile.length > 0))){
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
        articulos.push({id: articulos_all[index].id, titulo: articulos_all[index].articulo, contenido: articulos_all[index].descripcion, tipoParte: articulos_all[index].tipoParte ,created_at: moment(articulos_all[index].createdAt).format('DD-MM-yyyy'), updated_at: moment(articulos_all[index].updatedAt).format('DD-MM-yyyy'), usuario_id: this.userData.id, usuario: this.userData, articulos: this.getArticles(articulos_all[index].id, articulos_all), eliminado: false });
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
         
        if(data.data && data.data.normas && data.data.normas.length > 0){
         this.norma_data = data.data.normas[0];
         let articulos_all = data.data.normas;
         let articulos = [];
         let empresas = data.data.empresas;

          for (let index = 0; index < articulos_all.length; index++) {
            if(!articulos_all[index].articuloPadre){
              articulos.push({id: articulos_all[index].id, titulo: articulos_all[index].articulo, contenido: articulos_all[index].descripcion, tipoParte: articulos_all[index].tipoParte ,created_at: moment(articulos_all[index].createdAt).format('DD-MM-yyyy'), updated_at: moment(articulos_all[index].updatedAt).format('DD-MM-yyyy'), usuario_id: this.userData.id, usuario: this.userData, articulos: this.getArticles(articulos_all[index].id, articulos_all), eliminado: false });
            }
          }
         this.setValue(this.norma_data, articulos, empresas);
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
      
      const empresas_form = this.cuerpoForm.get('empresas')?.value ? this.cuerpoForm.get('empresas')?.value : [];

      this.cuerpoLegal.empresas = empresas_form.filter((item: any) => item !== "");

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

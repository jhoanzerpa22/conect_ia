import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { BodyLegalTypeModel } from './body-legal.model';
import { BodyLegal } from './data';
import { BodyLegalService } from './body-legal.service';
import { BodyLegalInternoService } from './body-legal-interno.service';
import { NgbdBodyLegalTypeSortableHeader, SortEvent } from './body-legal-sortable.directive';
import { ProjectsService } from '../../core/services/projects.service';
import { NormasArticlesAllService } from '../../core/services/normas_articles.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from './toast-service';
import { round } from 'lodash';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
//import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-library',
  templateUrl: './body-legal.component.html',
  styleUrls: ['./body-legal.component.scss'],
  providers: [BodyLegalService, BodyLegalInternoService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class BodyLegalTypeComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  BodyLegalData!: BodyLegalTypeModel[];
  checkedList: any;
  masterSelected!: boolean;
  BodyLegalDatas: any;
  BodyLegalInternoDatas: any;
  body_legal_data: any = [];
  body_legal_interno_data: any = [];

  // Table data
  BodyLegalList!: Observable<BodyLegalTypeModel[]>;
  BodyLegalListInterno!: Observable<BodyLegalTypeModel[]>;
  total: Observable<number>;
  total_body: number = 0;
  total_paginate: number = 0;
  total_body_interno: number = 0;
  total_paginate_interno: number = 0;
  @ViewChildren(NgbdBodyLegalTypeSortableHeader) headers!: QueryList<NgbdBodyLegalTypeSortableHeader>;
  page: number = 1;
  page_interno: number = 1;
  term:any;
  busquedaForm!: UntypedFormGroup;
  fileForm!: UntypedFormGroup;
  search: any = '';
  type_search: any = 'by_texto';
  userData: any;
  tipo: any;
  
  excelFile: any;
  showRow: any = [];

  constructor(private modalService: NgbModal, public service: BodyLegalService, public service_interno: BodyLegalInternoService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private normas_articles: NormasArticlesAllService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService, private TokenStorageService: TokenStorageService) {
    this.BodyLegalList = service.bodylegal$;
    this.BodyLegalListInterno = service_interno.bodylegal$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Biblioteca' },
      { label: 'Cuerpos Legales', active: true }
    ];
    
    this.userData = this.TokenStorageService.getUser();

    this.busquedaForm = this.formBuilder.group({
      busqueda: [''],
      tipo: [''],
      tipo_busqueda: ['by_texto']
    });
    
    this.fileForm = this.formBuilder.group({
      file: ['', [Validators.required]]
    });

    //this.fetchData();

    /**
     * fetches data
     */
    this.BodyLegalList.subscribe(x => {
      this.BodyLegalDatas = Object.assign([], x);
    });

    this.BodyLegalListInterno.subscribe(x => {
      this.BodyLegalInternoDatas = Object.assign([], x);
    });
    
    const search: any = this.route.snapshot.queryParams['search'];
    if(search && search != '' && search != undefined ? search : ''){
      const type_search: any = this.route.snapshot.queryParams['type_search'];
      const paginate: any = this.route.snapshot.queryParams['paginate'];
      this.search = search;
      this.type_search = type_search;
      this.page = paginate;
      this.busquedaNorma(search, type_search, paginate);
    }else{
      this.busquedaNorma('', 'by_texto', 1);
    }
    
  }

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  busquedaNorma(search?:any, type_search?: any, paginate?: any, form?: any){    
    let busqueda: any = search ? search : this.busquedaForm.get('busqueda')?.value;
    let tipo_busqueda: any = type_search ? type_search : this.busquedaForm.get('tipo_busqueda')?.value;
    let tipo: any = this.tipo ? this.tipo : this.busquedaForm.get('tipo')?.value;
    let page = paginate ? paginate : this.page;

    this.search = busqueda;
    this.type_search = tipo_busqueda;

    if(!form || form == 'chile'){
      this.page = page;
    }else if(!form || form == 'interno'){
      this.page_interno = page;
    }else if(!form){
      this.page = page;
      this.page_interno = page;
    } 
    //if(busqueda && busqueda != '' && busqueda != undefined && busqueda != null){
      this.showPreLoader();
      
      this._router.navigate(['/library'], { queryParams: { search: busqueda, type_search: tipo_busqueda, paginate: page, tipo: tipo && tipo != undefined && tipo != null ? tipo : null} });

      if(tipo_busqueda == 'by_texto'){
      this.projectsService./*getBodyLegalSearch(1, busqueda, 100)*/getBodyLegalSearchChile(page, busqueda, 10, tipo).pipe().subscribe(
        (data: any) => {
          console.log(data.data);

          if(data && data.data){
            
            if(!form){
              this.service.bodylegal_data = data.data ? data.data.normas_chile : [];
              this.body_legal_data = data.data ? data.data.normas_chile : [];
              this.total_body = data.data ? (data.data.normas_chile.length > 0 ? data.data.total_chile : 0) : 0;
              this.total_paginate = data.data ? (data.data.normas_chile.length > 0 ? data.data.total_chile : 0) : 0;

              this.service_interno.bodylegal_data = data.data ? data.data.normas_internas : [];
              this.body_legal_interno_data = data.data ? data.data.normas_internas : [];
              this.total_body_interno = data.data ? (data.data.normas_internas.length > 0 ? data.data.total_interno : 0) : 0;
              this.total_paginate_interno = data.data ? (data.data.normas_internas.length > 0 ? data.data.total_interno : 0) : 0;
              //this.total_paginate = data.data.total > 180 ? 180 : data.data.total;
            }else if(form == 'chile'){
              
              this.service.bodylegal_data = data.data ? data.data.normas_chile : [];
              this.body_legal_data = data.data ? data.data.normas_chile : [];
              this.total_body = data.data ? (data.data.normas_chile.length > 0 ? data.data.total_chile : 0) : 0;
              this.total_paginate = data.data ? (data.data.normas_chile.length > 0 ? data.data.total_chile : 0) : 0;

            }else if(form == 'interno'){
              
              this.service_interno.bodylegal_data = data.data ? data.data.normas_internas : [];
              this.body_legal_interno_data = data.data ? data.data.normas_internas : [];
              this.total_body_interno = data.data ? (data.data.normas_internas.length > 0 ? data.data.total_interno : 0) : 0;
              this.total_paginate_interno = data.data ? (data.data.normas_internas.length > 0 ? data.data.total_interno : 0) : 0;
            
            }
          }else{

            if(!form){
              this.service.bodylegal_data = [];
              this.service_interno.bodylegal_data = [];
              this.body_legal_data = [];
              this.body_legal_interno_data = [];
              this.total_body = 0;
              this.total_paginate = 0;
              this.total_body_interno = 0;
              this.total_paginate_interno = 0;
              
            } else if(form == 'chile'){
              this.service.bodylegal_data = [];
              this.body_legal_data = [];
              this.total_body = 0;
              this.total_paginate = 0;
              
            }else if(form == 'interno'){
              this.service_interno.bodylegal_data = [];
              this.body_legal_interno_data = [];
              this.total_body_interno = 0;
              this.total_paginate_interno = 0;
              
            }
            
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
            
            if(data && data.data){
              const detail: any = data.data;
              const info: any = data.data ? [{FechaPublicacion: detail.dates.fechaPublicacionNorma ? detail.dates.fechaPublicacionNorma : '', InicioDeVigencia: detail.dates.fechaVigenciaNorma ? detail.dates.fechaVigenciaNorma : '', FechaPromulgacion: detail.dates.fechaPromulgacionNorma ? detail.dates.fechaPromulgacionNorma : '', idNorma: detail.normaId, TipoNumero: {Compuesto: detail.identificador ? (detail.identificador.tipoNorma ? detail.identificador.tipoNorma+' '+detail.identificador.numero : '') : ''} , TituloNorma: detail.tituloNorma, Encabezado: detail.encabezado ? detail.encabezado.texto : '', interno: detail.interno }] : [];

              this.service.bodylegal_data = info.filter((da: any) => { return da.interno != true});
              this.service_interno.bodylegal_data = info.filter((da: any) => { return da.interno == true});

              this.body_legal_data = info.filter((da: any) => { return da.interno != true});
              this.body_legal_interno_data = info.filter((da: any) => { return da.interno == true});
              this.total_body = data.data ? 1 : 0;
              this.total_paginate = data.data > 0 ? 1 : 0;
              this.total_body_interno = data.data ? 1 : 0;
              this.total_paginate_interno = data.data > 0 ? 1 : 0;
              //this.total_paginate = data.data.total > 180 ? 180 : data.data.total;
            }else{
              this.service.bodylegal_data = [];
              this.body_legal_data = [];
              this.body_legal_interno_data = [];
              this.total_body = 0;
              this.total_paginate = 0;
              this.total_body_interno = 0;
              this.total_paginate_interno = 0;
              
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
  
  addDocument(content: any) {
    this.modalService.open(content, { centered: true });
  }

  crearDocument(type: any){
    this.modalService.dismissAll();
    this._router.navigate(['/norms/'+type]);
  }

  formatArticle(texto:any, idNorma: any){
    
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idNorma
    );

    return index != -1 ? texto : texto.substr(0,850)+'...';
  }

  showText(idNorma: any){
    this.showRow.push(idNorma);
  }

  hideText(idNorma: any){
    
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idNorma
    );

    this.showRow.splice(index, 1);
  }

  validatShow(idNorma: any){
    const index = this.showRow.findIndex(
      (co: any) =>
        co == idNorma
    );

    return index != -1;
  }

  sincronizar(){
      
      this.showPreLoader();

      this.normas_articles.sincronizar().pipe().subscribe(
        (data: any) => {

        this.hidePreLoader();
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
        }
      );
  }

  async sincronizarNormas(normas: any, total: any){

    const response = []
    const listError = []
    let position: number = 0;
    let errores: number = 0;
    
    for await (const norma of normas) {
        try {

            //const url = `${process.env.URL_BASE_BCN}${norma.normaId}`
            const promise = new Promise((resolve, reject) => {
                /*axios.get(url)
                    .then(data => {
                        resolve(data.data)
                    })
                    .catch(error => {
                        reject(normId)
                        listError.push(normId)
                    })*/
            
                this.normas_articles.sincronizarNorma(norma.normaId).pipe().subscribe(
                  (data: any) => {
                    
                    position = position + 1;
                    this.showStepSincronizar(position, total);
                    this.showErrorSincronizar(errores);
                    
                    resolve(data.data)
                  },
                  (error: any) => {
                    position = position + 1;
                    this.showStepSincronizar(position, total);
                    errores = errores + 1;
                    this.showErrorSincronizar(errores);
                    
                    reject(norma.normaId)
                    listError.push(norma.normaId)
                    
                });
            
          })

          const normData = await promise
          response.push(normData)
            
        } catch (e) { }
    }
    
    console.log('FIn de peticiones de normas:', response);
    this.hideStepSincronizar();
    this.hidePreLoader();
  }
  
  async sincronizarStep(){
      
    this.showPreLoader();

    this.normas_articles.sincronizarNormas().pipe().subscribe(
      (data: any) => {

        const normas_json: any = data.data;
        const normas_total: any = (normas_json.normas.length > 0 ? normas_json.normas.length : 0);

        this.sincronizarNormas(normas_json.normas, normas_total);

        //this.hidePreLoader();
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
      }
    );
}

  uploadDocument(){

    if (this.fileForm.invalid) {
      return;
    }
    
    if (this.fileForm.valid) {
      
      this.showPreLoader();
      const formData = new FormData();
      formData.append('excelFile', this.excelFile);

      this.normas_articles.uploadDocument(formData).pipe().subscribe(
        (data: any) => {

        this.hidePreLoader();
        this.modalService.dismissAll();
        let modal_alert: any = {};
        
        if(data.data && data.data.errores && data.data.errores.length > 0){

          let lista_errores: any = '';

          for (let err = 0; err < data.data.errores.length; err++) {
            lista_errores += '<li>'+data.data.errores[err]+'</li>';
          }

          if(data.data && data.data.normas_save && data.data.normas_save > 0){
            modal_alert = {
              title: 'Documento Procesado!',
              icon: 'info',
              html:
                'El Documento fue procesado pero <b>tuvimos algunos inconvenientes</b>:<br><a class="btn btn-success" href="'+data.data.informe_error+'" target="_new">Descargar Informe</a> '/* + lista_errores*/,
              showConfirmButton: true,
              showCloseButton: true,
              showCancelButton: false,
              focusConfirm: false,
              confirmButtonText: 'Ok',
              cancelButtonColor: 'rgb(243, 78, 78)',
              confirmButtonColor: '#364574',
              //timer: 5000
            };
          }else{
            modal_alert = {
              title: 'Documento no Procesado!',
              icon: 'error',
              html:
                'El Documento no fue procesado porque <b>tuvimos algunos inconvenientes</b>:<br><a class="btn btn-success" href="'+data.data.informe_error+'" target="_new">Descargar Informe</a> '/* + lista_errores*/,
              showConfirmButton: true,
              showCloseButton: true,
              showCancelButton: false,
              focusConfirm: false,
              confirmButtonText: 'Ok',
              cancelButtonColor: 'rgb(243, 78, 78)',
              confirmButtonColor: '#364574',
              //timer: 5000
            };
          }
          
        }else{
           modal_alert = {
              title: 'Documento Cargado!',
              icon: 'success',
              showConfirmButton: true,
              showCancelButton: false,
              confirmButtonColor: '#364574',
              cancelButtonColor: 'rgb(243, 78, 78)',
              confirmButtonText: 'OK',
              timer: 5000
            };
        }

        Swal.fire(modal_alert).then(result => {
          //if (result.value) {
          
          const search: any = this.route.snapshot.queryParams['search'];
          if(search && search != '' && search != undefined ? search : ''){
            const type_search: any = this.route.snapshot.queryParams['type_search'];
            const paginate: any = this.route.snapshot.queryParams['paginate'];
            this.search = search;
            this.type_search = type_search;
            this.page = paginate;
            this.busquedaNorma(search, type_search, paginate);
          }else{
            this.busquedaNorma('', 'by_texto', 1);
          }
        //}
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
      })
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {

      this.excelFile = file;      
    } else {
      this.excelFile = null;    
      this.fileForm.controls['file'].setValue('');
    }

  }

  getTipoDocumento(tipo?: any){

    switch (tipo) {
      case 'requisito':
        return 'Requisitos Legales';
        break;
        case 'ambiental':
          return 'Permisos Ambientales';
          break;
          case 'sectorial':
            return 'Permisos Sectoriales';
            break;
            case 'social':
              return 'Acuerdos Sociales';
              break;
              case 'otros':
                return 'Otros';
                break;
    
      default:      
        return 'Requisitos Legales';
        break;
    }
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
      this.normas_articles.deleteByNorma(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          const search: any = this.route.snapshot.queryParams['search'];
            if(search && search != '' && search != undefined ? search : ''){
              const type_search: any = this.route.snapshot.queryParams['type_search'];
              const paginate: any = this.route.snapshot.queryParams['paginate'];
              this.search = search;
              this.type_search = type_search;
              this.page = paginate;
              this.busquedaNorma(search, type_search, paginate);
            }else{
              this.busquedaNorma('', 'by_texto', 1);
            }

          document.getElementById('lj_'+id)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });
    }
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

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }

  pageChange(page: any){
    //console.log('Pagina Cambiada',page);
      this.page = page;
      this.busquedaNorma(this.search, this.type_search, page, 'chile');
  }
  
  pageChangeInterno(page: any){
      this.page_interno = page;
      this.busquedaNorma(this.search, this.type_search, page,'interno');
  }

  searchTipo(tipo?: any){
    this.page_interno = tipo != this.tipo ? 1 : this.page_interno;
    this.tipo = tipo;
    this.busquedaForm.controls['tipo'].setValue(tipo);

    this.busquedaNorma(this.search, this.type_search, this.page_interno, 'interno');
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

  // Step Sincronizar
  showStepSincronizar(step: any, normas: any) {
    var preloader_step = document.getElementById("normas-sincronizar");
    if (preloader_step) {
        (document.getElementById("step-sincronizar") as HTMLElement).textContent = step;
        (document.getElementById("total-sincronizar") as HTMLElement).textContent = normas;
        (document.getElementById("normas-sincronizar") as HTMLElement).style.visibility = "visible";
    }
  }

  // Step Sincronizar
  hideStepSincronizar() {
    var preloader_step = document.getElementById("normas-sincronizar");
    if (preloader_step) {
        (document.getElementById("normas-sincronizar") as HTMLElement).style.visibility = "hidden";
    }
  }

  // Error Sincronizar
  showErrorSincronizar(errores: any) {
    var preloader_error = document.getElementById("errores-sincronizar");
    if (preloader_error) {
        (document.getElementById("errores-sincronizar") as HTMLElement).textContent = errores;
    }
  }

}

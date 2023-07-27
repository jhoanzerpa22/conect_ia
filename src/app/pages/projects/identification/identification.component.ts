import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from './data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import { Observable } from 'rxjs';

import { normasListWidgets } from './data';
import { normaListModel } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { first } from 'rxjs/operators';
import { ToastService } from '../toast-service';

import { round } from 'lodash';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss'],
  providers: [listService, DecimalPipe]
})

/**
 * Projects Component
 */
export class IdentificationComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  statData!: any;
  OverviewChart: any;
  ActiveProjects: any;
  MyTask: any;
  TeamMembers: any;
  status7: any;
  simpleDonutChart: any;
  @ViewChild('scrollRef') scrollRef: any;

  project_id: any = '';
  project: any = {};

  installations_data: any = [];
  installations_group: any = [];
  areas_data: any = [];
  userData: any;
  installations_articles: any = [];

  normasListWidgets!: Observable<normaListModel[]>;
  total: Observable<number>;
  sellers?: any;
  pagLength?: number = 0;
  term:any;
  term2:any;
  term3:any;
  term4:any;
  term5:any;
  term6:any;
  term7:any;
  articles_proyects: any = [];
  articles_proyects_group: any = [];

  cuerpo_select: any = 'Cuerpo Legal';
  showRow: any = [];
  showRow2: any = [];
  showContainerArticles: any = [];

  submitted = false;
  installationForm!: UntypedFormGroup; 
  installations: any = [];
  cuerpo_installations: any = [];
  installations_filter: any = [];
  areas: any = [];
  area_id_select: any = [];
  
  cuerpoForm!: UntypedFormGroup; 
  articulos: any = [];
  cuerpo_id_select: any = [];
  
  items: any = [];
  selectChecked: any = [];
  selectChecked2: any = [];
  selectList: boolean = true;
  activeTab: number = 1;

  vinculacionForm!: UntypedFormGroup;
  selectChecked3: any = [];
  normaIdSelect: any = '';
  installationSelect: any = '';
  normaIdSelect2: any = '';
  articuloSelect: any = [];
  selectCheckedCuerpos: any = [];
  selectCheckedInstalaciones: any = [];
  selectCheckedVincular: any = [];

  attributes: any = [];
  attributes_all: any = [];

  configs: any = [];
  total_paginate: number = 0;

  page: number = 0;
  list_paginate: any = [0];
  ambitos: any = [];
  ambito: any = undefined;

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private TokenStorageService: TokenStorageService, public service: listService, private formBuilder: UntypedFormBuilder, private modalService: NgbModal, private ref: ChangeDetectorRef) {
    this.normasListWidgets = service.normas$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Identificación', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    this.normasListWidgets.subscribe(x => {
      //this.BodyLegalDatas = Object.assign([], x);
    });

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }
    
    this.installationForm = this.formBuilder.group({
      ids: [''],
      id: [''],
      area: [''],
      sub_area: [''],
      search: [''],
      checkAll: ['']
    });
    
    this.cuerpoForm = this.formBuilder.group({
      ids: [''],
      id: [''],
      search: [''],
      checkAll2: ['']
    });

    this.vinculacionForm = this.formBuilder.group({
      ids: [''],
      id: [''],
      search: ['']
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.getProject(params['id']);
      this.getAreas(params['id']);
      //this.getInstallations(params['id']);
      this.getArticlesInstallation();
      this.getArticleProyect(this.project_id);
      this.getCuerpoInstallationsByProyect();
      this.getNormas(0);
    });

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  ngAfterViewInit() {
    //this.scrollRef.SimpleBar.getScrollElement().scrollTop = 600;
  }

  selectCuerpo(cuerpo: any){
    
    this.showPreLoader();
    this.cuerpo_select = cuerpo;
    /*this.articulosDatas = this.detail.data.filter((data: any) => {
      return data.cuerpoLegal === cuerpo;
    })[0].articulos;
    */
    this.hidePreLoader();
  }

  validateCuerpo(cuerpo: any){
    return this.cuerpo_select == cuerpo;
 }

 onChangeList(e: any){
    this.selectList = !this.selectList;

    if(!this.selectList){
      this.selectCheckedInstalaciones = [];
    }else{
      this.selectCheckedCuerpos = [];
    }

    this.ref.detectChanges();
 }

 formatNorma(texto:any, idParte: any){
    
  const index = this.showRow2.findIndex(
    (co: any) =>
      co == idParte
  );

  return index != -1 ? texto : texto.substr(0,250)+'...';
}

validateIdparte2(idParte: any){
  const index = this.articles_proyects.findIndex(
    (co: any) =>
      co.normaId == idParte && co.proyectoId == this.project_id
  );

  return index == -1;
}

validatShow2(idParte: any){
  const index = this.showRow2.findIndex(
    (co: any) =>
      co == idParte
  );

  return index != -1;
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

 formatArticle(texto:any, idParte: any){
    
  const index = this.showRow.findIndex(
    (co: any) =>
      co == idParte
  );

  return index != -1 ? texto : texto.substr(0,250)+'...';
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

showArticles(normaId: any){
  this.showContainerArticles.push(normaId);
}

hideArticles(normaId: any){
  
  const index = this.showContainerArticles.findIndex(
    (co: any) =>
      co == normaId
  );

  this.showContainerArticles.splice(index, 1);
}

validateShowArticles(normaId: any){
  const index = this.showContainerArticles.findIndex(
    (co: any) =>
      co == normaId
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

validateIdparte(idParte: any){
  const index = this.articles_proyects.findIndex(
    (co: any) =>
      co.articuloId == idParte && co.proyectoId == this.project_id
  );

  return index == -1;
}

  getProject(idProject?: any){
      this.projectsService.getById(idProject).pipe().subscribe(
        (data: any) => {
          this.project = data.data;
      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
   }
   
  private getNormas(page: number, ambito?: any) {
    
    this.showPreLoader();
    this.list_paginate = [];

      this.projectsService./*getBodyLegalALl(this.project_id, 1, 10)*//*getBodyLegal(this.project_id)*/getNormas(page, 12, ambito).pipe().subscribe(
        (data: any) => {
          
          this.normasListWidgets = data.data.normas;
          this.service.normas_data = data.data.normas;
          this.pagLength = data.data.total;
          this.total_paginate = data.data.total > 0 ? data.data.total : 0;

          for (let c = 0; c < this.pageTotal(this.total_paginate); c++) {
            this.list_paginate.push(c);
          }

          this.hidePreLoader();
          document.getElementById('elmLoader')?.classList.add('d-none')
      },
      (error: any) => {
        this.list_paginate = [0];
        this.hidePreLoader();
        document.getElementById('elmLoader')?.classList.add('d-none')
      });
  }
  
  private getArticleProyect(project_id: any){

    //this.showPreLoader();
      this.projectsService.getArticleProyect(project_id).pipe().subscribe(
        (data: any) => {
          this.articles_proyects = data.data;

          this.articles_proyects_group = [];
          this.articles_proyects.forEach((x: any) => {
            
            const index = this.articles_proyects_group.findIndex(
              (co: any) =>
                co.cuerpoLegal == x.cuerpoLegal
            );

            if(index == -1){
              this.articles_proyects_group.push({
                cuerpoLegal: x.cuerpoLegal, organismo: x.organismo, normaId: x.normaId, encabezado: x.encabezado, tituloNorma: x.tituloNorma, articulos: [x]
              });
            }else{
              this.articles_proyects_group[index].articulos.push(x);
            }
          })

          //this.hidePreLoader();
      },
      (error: any) => {
        //this.hidePreLoader();
        //this.error = error ? error : '';
      });
      //document.getElementById('elmLoader')?.classList.add('d-none')
  }

   getAreas(idProject?: any) {
    this.projectsService.getAreasUser()/*getAreas(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.areas = data.data;
      },
      (error: any) => {
      });
  }

  getInstallations(idProject?: any) {
    this.projectsService.getInstallationsUser()/*getInstallations(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.installations_data = data.data;

          this.installations_group = [];
          this.installations_data.forEach((x: any) => {
            
            const index = this.installations_group.findIndex(
              (co: any) =>
                co.area == x.area.nombre
            );

            if(index == -1){
              this.installations_group.push({
                area: x.area.nombre, instalaciones: [x]
              });
            }else{
              this.installations_group[index].instalaciones.push(x);
            }
          })
      },
      (error: any) => {
      });
  }

   /**
   * Open modal
   * @param content modal content
   */
   openModal(content: any, type: any, data?: any) {
    this.submitted = false;
    
    this.installations = this.installations_data;
    this.selectChecked = [];

    this.modalService.open(content, { size: 'lg', centered: true });

    let ids: any = [];
    if(type == 'multiple'){
      for (var j = 0; j < this.selectCheckedCuerpos.length; j++) {
        ids.push(this.selectCheckedCuerpos[j].normaId);
      }
    }else{
      ids.push(data.normaId);
    }

    this.normaIdSelect = ids;

    //var listData = this.areas_all.filter((data: { id: any; }) => data.id === id);
    this.installationForm.controls['area'].setValue('');
    this.installationForm.controls['ids'].setValue(ids);
    
    setTimeout(() => {
      this.validChecked();
    }, 1400);
   }

  openModal2(content: any, type: any, data?: any) {
    this.submitted = false;
    
    this.selectChecked2 = [];

    //this.cuerpoForm.reset();
    this.modalService.open(content, { size: 'lg', centered: true });

    let ids: any = [];
    if(type == 'multiple'){
      for (var j = 0; j < this.selectCheckedInstalaciones.length; j++) {
        ids.push(this.selectCheckedInstalaciones[j].id);
      }
    }else{
      ids.push(data.id);
    }

    this.installationSelect = ids;

    this.cuerpoForm.controls['ids'].setValue(ids);
    
    setTimeout(() => {
    this.validChecked2();
    },1400);
  }
  
  openModal3(content: any, type: any, data?: any) {
    this.submitted = false;
    
    this.installations_filter = [];
    this.selectChecked3 = [];
    this.articuloSelect = [];

    this.modalService.open(content, { size: 'lg', centered: true });
    
    let ids: any = [];
    if(type == 'multiple'){
      for (var j = 0; j < this.selectCheckedVincular.length; j++) {
        ids.push(this.selectCheckedVincular[j].articuloId);    
        this.articuloSelect.push(data);
      }
    }else{
      ids.push(data.articuloId);
      this.articuloSelect.push(data);
    }

    this.normaIdSelect2 = ids;

    this.validInstallations();

    //var listData = this.areas_all.filter((data: { id: any; }) => data.id === id);
    this.vinculacionForm.controls['ids'].setValue(/*listData[0].*/ids);
  }
  
  async saveInstallation(){ 
    this.showPreLoader();
    if(this.selectChecked.length > 0){

      const normas = await this.normaIdSelect;
    
      const services = await Promise.all(normas.map(async (c: any) => {
          const index = this.articles_proyects_group.findIndex(
            (co: any) =>
              co.normaId == c
          );

          let cuerpoLegal: any = this.articles_proyects_group[index].cuerpoLegal;
        
          const deletes = await Promise.all(this.cuerpo_installations.map(async (cu: any) => {

            const index_delete = this.selectChecked.findIndex(
              (d: any) =>
                cu.installationId == d.id
            );

            if(index_delete == -1 && parseInt(cu.normaId) == c){

            this.projectsService.deleteCuerpoInstallation(cu.id).pipe().subscribe(
              (data: any) => {     
              
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

          }));

          const service = await Promise.all(this.selectChecked.map(async (j: any) => {
            
            const index_add = this.cuerpo_installations.findIndex(
              (cu2: any) =>
                cu2.installationId == j.id && parseInt(cu2.normaId) == c
            );

            if(index_add == -1){

            const data: any = {
              proyectoId: this.project_id,
              installationId: j.id,
              cuerpoLegal: cuerpoLegal,
              normaId: c
            };
    
            this.projectsService.conectCuerpoInstallation(data).pipe().subscribe(
              (data: any) => {     
              
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

          }));
        }));

          setTimeout(() => {
             
          this.modalService.dismissAll();
          this.hidePreLoader();
          
          this.selectCheckedCuerpos = [];

            this.getArticlesInstallation();
            this.getArticleProyect(this.project_id);
            this.getCuerpoInstallationsByProyect();
            
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Instalaciones guardadas',
            showConfirmButton: true,
            timer: 5000,
          });   
        }, 1000);
      
    }else{
      
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'No ha seleccionado instalaciones..',
        showConfirmButton: true,
        timer: 5000,
      });
    }
  }
  
  async saveCuerpo(){
    this.showPreLoader();
    if(this.selectChecked2.length > 0){

      const instalaciones = await this.installationSelect;
    
      const services = await Promise.all(instalaciones.map(async (i: any) => {

        const deletes = await Promise.all(this.cuerpo_installations.map(async (cu: any) => {

          const index_delete = this.selectChecked2.findIndex(
            (d: any) =>
              parseInt(cu.normaId) == d.normaId
          );

          if(index_delete == -1 && cu.installationId == i){

          this.projectsService.deleteCuerpoInstallation(cu.id).pipe().subscribe(
            (data: any) => {     
            
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

        }));

        const service = await Promise.all(this.selectChecked2.map(async (j: any) => {

          const index_add = this.cuerpo_installations.findIndex(
            (cu2: any) =>
              cu2.installationId == i && parseInt(cu2.normaId) == j.normaId
          );

          if(index_add == -1){

          const data: any = {
            proyectoId: this.project_id,
            cuerpoLegal: j.cuerpoLegal,
            normaId: j.normaId,
            installationId: i
          };
    
          this.projectsService.conectCuerpoInstallation(data).pipe().subscribe(
            (data: any) => {     
            
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

        }));
      }));

      setTimeout(() => {
        
        this.modalService.dismissAll();
        this.hidePreLoader();
        this.selectCheckedInstalaciones = [];

        this.getArticlesInstallation();
        this.getArticleProyect(this.project_id);
        this.getCuerpoInstallationsByProyect();
        
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Cuerpos Legales guardados',
          showConfirmButton: true,
          timer: 5000,
        });
      }, 1000);

    }else{
      
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'No ha seleccionado cuerpos legales..',
        showConfirmButton: true,
        timer: 5000,
      });
    }
  }


  validateConfig(id: any){
    const index = this.configs.findIndex(
          (p: any) =>
            p == id
        );

      return index != -1;
  }

  setConfig(id: any, e: any){
    const index = this.configs.findIndex(
          (p: any) =>
            p == id
        );

        if(index != -1){
          this.configs.splice(index, 1);          
        }else{
          this.configs.push(id);
        }

  }

  setAttribute(type: any, id: any, valor?: any){
    const index = this.attributes.findIndex(
      (p: any) =>
        p.type == type && p.id == id
    );

    if(index != -1){
      if(type == 'fase' && this.attributes[index].valor != valor){
        this.attributes[index].valor = valor;
      }else{

        this.attributes.splice(index, 1);
        this.setAttributeArticle(id, type, type == 'fase' ? null : false);
      }
      
    }else{
      this.attributes.push({type: type, id: id, valor: type == 'fase' ? valor : null});
      this.setAttributeArticle(id, type, type == 'fase' ? valor : true);
    }

  }

  setAttributeAll(type: any, valor?: any){
    const index = this.attributes_all.findIndex(
      (p: any) =>
        p.type == type
    );

    if(index != -1){
      if(type == 'fase' && this.attributes_all[index].valor != valor){
        this.attributes_all[index].valor = valor;
      }else{

        this.attributes_all.splice(index, 1);
      }
      
    }else{
      this.attributes_all.push({type: type, valor: type == 'fase' ? valor : true});
    }

  }

  validateAttributeAll(type: any, valor?: any){
    const index = this.attributes_all.findIndex(
          (p: any) =>
            p.type == type
        );

      if(index != -1){
        return type == 'fase' ? valor == this.attributes_all[index].valor : true;
      }else{
        return false;
      }
  }

  validateAttribute(type: any, id: any, valor_old?: any, valor?: any){
    const index = this.attributes.findIndex(
          (p: any) =>
            p.type == type && p.id == id
        );

      if(index != -1){
        return type == 'fase' ? valor == this.attributes[index].valor : true;
      }else{
        return type == 'fase' ? valor_old == valor : valor_old;
      }
  }

  setAttributeArticle(id: any, type: any, valor: any){
    const article_attribute: any = {      
      attr: type,
      value: valor
    };
    
    this.projectsService.setAttributesArticle(id, article_attribute).pipe().subscribe(
      (data: any) => {     
       
      /*Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Atributo guardado',
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
  
  async setAttributeArticleAll(){

    this.showPreLoader();

    const normas = await this.selectCheckedVincular;
    
    const services = await Promise.all(normas.map(async (j: any) => {
    
    const id = j.id;
    
    const service = await Promise.all(this.attributes_all.map(async (a: any) => {

    const article_attribute: any = {      
      attr: a.type,
      value: a.valor
    };
    
    this.projectsService.setAttributesArticle(id, article_attribute).pipe().subscribe(
      (data: any) => {     
       
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

    });
    }));
  
  }));
    
  
  setTimeout(() => {
    this.attributes_all = [];
    this.selectCheckedVincular = [];

    this.getArticlesInstallation();
    this.getArticleProyect(this.project_id);
    this.getCuerpoInstallationsByProyect();

    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Atributos guardados',
      showConfirmButton: true,
      timer: 5000,
    });
    this.hidePreLoader();
  }, 3000);

  }

  async saveVinculacion () {
    
    this.showPreLoader();
    if(this.selectChecked3.length > 0){
      const normas = await this.normaIdSelect2;
    
      const services = await Promise.all(normas.map(async (c: any) => {

        const deletes = await Promise.all(this.installations_articles.map(async (cu: any) => {

          const index_delete = this.selectChecked3.findIndex(
            (d: any) =>
              d.data.id == cu.instalacionId
          );

          if(index_delete == -1 && parseInt(cu.articuloId) == c){

          this.projectsService.deleteArticleInstallation(cu.id).pipe().subscribe(
            (data: any) => {     
            
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

        }));

        const service = await Promise.all(this.selectChecked3.map(async (j: any) => {
          const index = this.articuloSelect.findIndex(
            (co: any) =>
              co.articuloId == c
          );

          const index_add: any = this.installations_articles.findIndex(
            (ins: any) =>
              ins.articuloId == this.articuloSelect[index].articuloId && ins.instalacionId == j.data.id
          );
          
          if(index_add == -1){
          const article_installation: any = {
            articuloId: this.articuloSelect[index].articuloId,
            articulo: this.articuloSelect[index].tipoParte +' '+ this.articuloSelect[index].articulo,
            descripcion: this.articuloSelect[index].descripcion ? this.articuloSelect[index].descripcion : this.articuloSelect[index].tipoParte,
            tipoParte: this.articuloSelect[index].tipoParte,
            instalacionId: j.data.id,
            estado: j.estado,
            normaId: this.articuloSelect[index].normaId,
            cuerpoLegal: this.articuloSelect[index].cuerpoLegal,
            proyectoId: this.project_id
          };
          
          this.projectsService.conectArticleInstallation(j.data.id, article_installation).pipe().subscribe(
            (data: any) => {     
            
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
    
        }));

      }));

        setTimeout(() => {        
          this.getArticlesInstallation();
          this.getArticleProyect(this.project_id);
          this.getCuerpoInstallationsByProyect();
          
          this.modalService.dismissAll();
          this.hidePreLoader();

          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Instalaciones guardadas',
            showConfirmButton: true,
            timer: 5000,
          });
    
        }, 1000);
      }else{
        
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'No ha seleccionado instalaciones..',
        showConfirmButton: true,
        timer: 5000,
      });
    }
  }

  selectArea(event: any){

    if(this.area_id_select.length > 0){
    
    let vacio = event.target.value > 0 ? 1 : 0;
    
    this.area_id_select.splice(0 + vacio, (this.area_id_select.length-(1+vacio)));
    
      if(event.target.value > 0){
        
        const index = this.areas.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.areas[index].nombre;

        this.area_id_select[0] = {value: event.target.value, label: nombre};
      }

    }else{
      
      const index2 = this.areas.findIndex(
        (co: any) =>
          co.id == event.target.value
      );

      let nombre2 = this.areas[index2].nombre;
      this.area_id_select.push({value: event.target.value, label: nombre2});
    }

    //this.area_id_select = event.target.value;
      this.items = [];
      if(event.target.value > 0){
        this.getInstallationsByAreaId(event.target.value);
        this.getChildren(event.target.value);
      }else{
        this.installations = this.installations_data;
        setTimeout(() => {
          this.validChecked();
        }, 1400);
      }
  }

  selectAreaChildren(event: any, parent?: any){
    //this.addElement(parent);
      let vacio = event.target.value > 0 ? 2 : 1;
    
      this.area_id_select.splice((parent+vacio), (this.area_id_select.length-(parent+vacio)));

      if(event.target.value > 0){
        
        const index = this.items[parent].options.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.items[parent].options[index].nombre;

        this.area_id_select[parent+1] = {value: event.target.value, label: nombre};
      }

    //this.area_id_select = event.target.value;
      this.items.splice((parent+1), (this.items.length-(parent+1)));
      this.items[parent].value = event.target.value;
      this.getInstallationsByAreaId(event.target.value);
      this.getChildren(event.target.value);
  }

  getChildren(padre_id: any){
    if(padre_id > 0){
      this.showPreLoader();
      this.projectsService.getAreasItems(padre_id).pipe().subscribe(
        (data: any) => {
          if(data.data.length > 0){
            this.items.push({value: null, options: data.data});
          }
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }
  }
  
  private getCuerpoInstallationsByProyect() {
    
    this.cuerpo_installations = [];

      this.projectsService.getCuerpoInstallationProyect(this.project_id).pipe().subscribe(
        (data: any) => {
          this.cuerpo_installations = data.data ? data.data : [];
      },
      (error: any) => {
        //this.error = error ? error : '';
      });
  }
  
  private getInstallationsByAreaId(area_id: any) {
    
    this.showPreLoader();
    this.installations = [];

      this.projectsService.getInstallationByAreaId(area_id).pipe().subscribe(
        (data: any) => {
          this.installations = data.data ? data.data : [];

          setTimeout(() => {
            this.validChecked();
          }, 1400);

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  selectCuerpoLegal(event: any){

    if(this.cuerpo_id_select.length > 0){
    
    let vacio = event.target.value != '' && event.target.value != null && event.target.value != undefined ? 1 : 0;
    
    this.cuerpo_id_select.splice(0 + vacio, (this.cuerpo_id_select.length-(1+vacio)));
    
      if(event.target.value != '' && event.target.value != null && event.target.value != undefined){
        
        const index = this.articles_proyects_group.findIndex(
          (co: any) =>
            co.cuerpoLegal == event.target.value
        );

        let nombre = this.articles_proyects_group[index].cuerpoLegal;
        this.cuerpo_id_select[0] = {value: event.target.value, label: nombre};
        this.articulos = this.articles_proyects_group[index].articulos;
      }

    }else{
      
      const index2 = this.articles_proyects_group.findIndex(
        (co: any) =>
          co.cuerpoLegal == event.target.value
      );

      let nombre2 = this.articles_proyects_group[index2].cuerpoLegal;
      this.cuerpo_id_select.push({value: event.target.value, label: nombre2});
      this.articulos = this.articles_proyects_group[index2].articulos;
    }
  }
  
  byInstallation(id: any){
      const filter: any = this.cuerpo_installations.filter(
        (ins: any) =>
          ins.installationId == id
      );
      return filter.length;
  }
 
  byCuerpo(id: any){
    const filter: any = this.cuerpo_installations.filter(
      (ins: any) =>
        ins.normaId == id
    );
    return filter.length;
  }
  
  byCuerpoVinculacion(id: any){
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.normaId == id
    );
    return filter.length;
  }

  byArticuloVinculacion(id: any){
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.articuloId == id
    );
    return filter.length;
  }

  validInstallations(){
    this.installations_filter = [];
    for (var j = 0; j < this.installations_data.length; j++) {
      const index = this.cuerpo_installations.findIndex(
        (ins: any) =>
          ins.installationId == this.installations_data[j].id && parseInt(ins.normaId) == parseInt(this.articuloSelect[0].normaId)
      );

      if(index != - 1){
        this.installations_filter.push(this.installations_data[j]);
      }
    }
    //this.validChecked3();
    this.validCheckedInitial();
  }

  validChecked(){
    var checkboxes: any = document.getElementsByName('checkAll');
    
    for (var j = 0; j < checkboxes.length; j++) {
      const index = this.cuerpo_installations.findIndex(
        (ins: any) =>
          ins.installationId == checkboxes[j].id && parseInt(ins.normaId) == this.normaIdSelect[0]
      );

      if(index != - 1){
        const index2 = this.installations_data.findIndex(
          (ins: any) =>
            ins.id == checkboxes[j].id
        );
        checkboxes[j].checked = true;

        if(index2 != -1){
          this.selectChecked.push(this.installations_data[index2]);
        }
      }else{
        checkboxes[j].checked = false;
      }
    }
  }
  
  validChecked2(){
    var checkboxes: any = document.getElementsByName('checkAll2');

    for (var j = 0; j < checkboxes.length; j++) {
      const index = this.cuerpo_installations.findIndex(
        (ins: any) =>
          ins.installationId == this.installationSelect[0] && parseInt(ins.normaId) == checkboxes[j].id
      );

      if(index != - 1){

        const index2 = this.articles_proyects_group.findIndex(
          (cu: any) =>
            cu.normaId == checkboxes[j].id
        );
        checkboxes[j].checked = true;

        if(index2 != -1){
          this.selectChecked2.push(this.articles_proyects_group[index2]);
        }
      }else{
        checkboxes[j].checked = false;
      }
    }
  }

  validChecked3(){
    var checkboxes: any = document.getElementsByName('checkAll3');
    for (var j = 0; j < checkboxes.length; j++) {
      const index = this.installations_articles.findIndex(
        (ins: any) =>
          ins.instalacionId == checkboxes[j].id && ins.articuloId == this.normaIdSelect2[0]
      );

      if(index != - 1){
        const index2 = this.installations.findIndex(
          (ins: any) =>
            ins.id == checkboxes[j].id
        );

        checkboxes[j].checked = true;

        if(index2 != -1){
          this.selectChecked3.push(this.installations[index2]);
        }
      }/*else{
        checkboxes[j].checked = false;
      }*/
    }
  }

  validChecked4(id: any){
      const index = this.selectChecked3.findIndex(
        (ins: any) =>
          ins.data.id == id
      );

      if(index != - 1){
        return this.selectChecked3[index].estado;
      }else{
        return 0;
      }
  }

  async validCheckedInitial(){ 

    const instalaciones_filter = this.installations_articles.filter(
      (ins: any) =>
        ins.articuloId == this.normaIdSelect2[0]
    );
    
    const instalaciones = await instalaciones_filter;

    const services = await Promise.all(instalaciones.map(async (is: any) => {
      
      const index2 = this.installations_filter.findIndex(
        (ins: any) =>
          ins.id == is.instalacionId
      );

      if(index2 != -1){
        this.selectChecked3.push({data: this.installations_filter[index2], estado: is.estado});
      }
/*
      var checkboxes: any = document.getElementsByName(is.instalacionId+'-estado');
      let estado: number = is.estado > 0 ? is.estado : 0;

      for (var j = 0; j < checkboxes.length; j++) {
        if (checkboxes[j].id == is.instalacionId+'-estado'+estado) {
          checkboxes[j].checked = true;
        }
      }*/

    }));
}

  checkedValGet: any[] = [];
  onCheckboxChange(e: any) {
    //checkArray.push(new UntypedFormControl(e.target.value));
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations.length; i++) {
        result = this.installations[i];
        checkedVal.push(result);
        if(this.installations[i].id == e.target.value){
          const index = this.selectChecked.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectChecked.splice(index, 1);
          }else{
            this.selectChecked.push(this.installations[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }

    //this.checkedValGet = checkedVal
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

  checkedValGet2: any[] = [];
  onCheckboxChange2(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.articles_proyects_group.length; i++) {
        result = this.articles_proyects_group[i];
        checkedVal.push(result);
        if(this.articles_proyects_group[i].normaId == e.target.value){
          const index = this.selectChecked2.findIndex(
            (ch: any) =>
              ch.normaId == e.target.value
          );

          if(index != - 1){
            this.selectChecked2.splice(index, 1);
          }else{
            this.selectChecked2.push(this.articles_proyects_group[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll2');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }
  }

  checkedValGet3: any[] = [];
  onCheckboxChange3(e: any) {
    //checkArray.push(new UntypedFormControl(e.target.value));
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations_filter.length; i++) {
        result = this.installations_filter[i];
        checkedVal.push(result);
        if(this.installations_filter[i].id == e.target.value){
          const index = this.selectChecked3.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectChecked3.splice(index, 1);
          }else{
            this.selectChecked3.push(this.installations_filter[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll3');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }

    //this.checkedValGet = checkedVal
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }
  
  onCheckboxChange4(id: any) {
    var result
    for (var i = 0; i < this.installations_filter.length; i++) {
        result = this.installations_filter[i];
        if(this.installations_filter[i].id == id){
          const index = this.selectChecked3.findIndex(
            (ch: any) =>
              ch.data.id == id
          );

          if(index != - 1){
            if(this.selectChecked3[index].estado == 1){
              this.selectChecked3[index].estado = 2;
            }else{
              this.selectChecked3.splice(index, 1);
            }
          }else{
            this.selectChecked3.push({estado: 1, data: this.installations_filter[i]});
          }
        }
    }
    /*var checkboxes: any = document.getElementsByName('checkAll3');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != id) {
        //checkboxes[j].checked = false;
      }
    }*/
  }
  
  onCheckboxChange5(id: any, valor?: any) {
    var result
    for (var i = 0; i < this.installations_filter.length; i++) {
        result = this.installations_filter[i];
        if(this.installations_filter[i].id == id){
          const index = this.selectChecked3.findIndex(
            (ch: any) =>
              ch.data.id == id
          );

          if(index != - 1){
            if(valor > 0){
              this.selectChecked3[index].estado = valor;
            }else{
              this.selectChecked3.splice(index, 1);
            }
          }else{
            this.selectChecked3.push({estado: valor, data: this.installations_filter[i]});
          }
        }
    }
  }
  
  checkedValGetCuerpos: any[] = [];
  onCheckboxChangeCuerpos(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.articles_proyects_group.length; i++) {
        result = this.articles_proyects_group[i];
        checkedVal.push(result);
        if(this.articles_proyects_group[i].normaId == e.target.value){
          const index = this.selectCheckedCuerpos.findIndex(
            (ch: any) =>
              ch.normaId == e.target.value
          );

          if(index != - 1){
            this.selectCheckedCuerpos.splice(index, 1);
          }else{
            this.selectCheckedCuerpos.push(this.articles_proyects_group[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAllCuerpos');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }
  }
  

  checkedValGetInstalaciones: any[] = [];
  onCheckboxChangeInstalaciones(e: any){
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations_data.length; i++) {
        result = this.installations_data[i];
        checkedVal.push(result);
        if(this.installations_data[i].id == e.target.value){
          const index = this.selectCheckedInstalaciones.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectCheckedInstalaciones.splice(index, 1);
          }else{
            this.selectCheckedInstalaciones.push(this.installations_data[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAllInstalaciones');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }
  }

  checkedValGetVincular: any[] = [];
  onCheckboxChangeVincular(e: any, data: any) {
    var checkedVal: any[] = [];
    var result

        result = data;
        checkedVal.push(result);
          
          const index = this.selectCheckedVincular.findIndex(
            (ch: any) =>
              ch.articuloId == e.target.value
          );

          if(index != - 1){
            this.selectCheckedVincular.splice(index, 1);
          }else{
            this.selectCheckedVincular.push(data);
          }
    
        var checkboxes: any = document.getElementsByName('checkAllVincular');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }

    if(this.selectCheckedVincular.length < 1){
      this.attributes_all = [];
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

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 12),0);
    return (tp * 12) > totalRecords ? tp : (tp + 1);
  }
  
  setPage(page: number){
    this.page = page;
    this.getNormas(page, this.ambito);
  }

  setFilterAmbito(ambito: any){
    const index = this.ambitos.findIndex(
      (p: any) =>
        p == ambito
    );

    if(index != -1){
      this.page = 0;
      this.ambito = undefined;
      this.ambitos.splice(index, 1);    
      this.getNormas(0);
    }else{
      this.page = 0;
      this.ambitos = [];
      this.ambito = ambito;
      this.ambitos.push(ambito);
      this.getNormas(0,ambito);
    }

  }

  validateFilter(ambito: any){
    const index = this.ambitos.findIndex(
          (p: any) =>
            p == ambito
        );

      return index != -1;
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.statData = statData;
    this.ActiveProjects = ActiveProjects;
    this.MyTask = MyTask;
    this.TeamMembers = TeamMembers;
  }

  private getArticlesInstallation() {

      this.projectsService./*getArticlesInstallationByProyecto(this.project_id)*/getInstallationsUser()/*getInstallations(this.project_id)*/.pipe().subscribe(
        (data: any) => {
          
          this.installations_data = data.data;

          this.installations_group = [];
          this.installations_data.forEach((x: any) => {
            
            const index = this.installations_group.findIndex(
              (co: any) =>
                co.area == x.area.nombre
            );

            if(index == -1){
              this.installations_group.push({
                area: x.area.nombre, instalaciones: [x]
              });
            }else{
              this.installations_group[index].instalaciones.push(x);
            }
          })

          let obj: any = data.data;
          let lista: any = [];

          for (var i = 0; i < obj.length; i++) {
            
            if(obj[i].installations_articles.length > 0){

              let total_articulos: any = [];

              for (var j = 0; j < obj[i].installations_articles.length; j++) {
                if(obj[i].installations_articles[j].proyectoId == this.project_id){
                  total_articulos.push(obj[i].installations_articles[j]);
                  lista.push(obj[i].installations_articles[j]);
                }
              }
              
            }
          }
          
          this.installations_articles = lista;
      },
      (error: any) => {
      });
      //document.getElementById('elmLoader')?.classList.add('d-none')
  }


  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  changeTab(active: number){
    this.activeTab = active;
    if (this.articles_proyects < 1) {
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Rellene todos los campos..',
        showConfirmButton: true,
        timer: 5000,
      });

      return;
    }
  }

  conectCuerpo(cuerpo_id?: any, data?: any){

    const index2 = this.articles_proyects_group.findIndex(
      (co: any) =>
        co.cuerpoLegal == cuerpo_id
    );

    if(index2 == -1){

    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.normaId == cuerpo_id && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects.splice(index, 1);
    }else{

    const cuerpo_proyect: any = {
      normaId: cuerpo_id,
      cuerpoLegal: data.identificador ? (data.identificador.tipoNorma ? data.identificador.tipoNorma+' '+data.identificador.numero : null) : null,
      organismo: data.organismos.length > 0 ? data.organismos[0] : '',
      encabezado: data.encabezado ? data.encabezado.texto : '',
      tituloNorma: data.tituloNorma,
      proyectoId: this.project_id,
      monitoreo: false,
      reporte: false,
      permiso: false,
      articulos: JSON.stringify(data.EstructurasFuncionales)
    };

    this.articles_proyects.push(cuerpo_proyect);
    }
    }
  }

  validateIdNorma(idNorma: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.normaId == idNorma && co.proyectoId == this.project_id
    );

    return index == -1;
  }

  validateIdCuerpo(idNorma: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.normaId == idNorma && co.proyectoId == this.project_id
    );

    if(index != -1){
      const index2 = this.installations_articles.findIndex(
        (co: any) =>
          co.normaId == idNorma && co.proyectoId == this.project_id && parseInt(co.estado) == 1 
      );

      if(index2 != -1){
        return 1;
      }else{
        const index3 = this.installations_articles.findIndex(
          (co: any) =>
            co.normaId == idNorma && co.proyectoId == this.project_id && parseInt(co.estado) == 2 
        );
        return index3 != -1 ? 2 : false;
      }

    }else{
      return false;
    }

  }

  async saveCuerpos(){
    
    this.showPreLoader();
    if(this.articles_proyects.length > 0){      
      
    // Función para buscar info de Github de un usuario
    const saveCuerpoProyect = async (j: any) => {
      
      let sCuerpo = new Promise((resolve, reject) => {
        this.projectsService.conectArticleProyect(j).pipe().subscribe(
          (data: any) => {     
          resolve('guardado');
        },
        (error: any) => {
          
          this.hidePreLoader();
          
          resolve('error');

          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Ha ocurrido un error..',
            showConfirmButton: true,
            timer: 5000,
          });
          this.modalService.dismissAll()
        });
  
      });
      return await sCuerpo;
    }

    // Itera todos los usuarios y regresa su info de Github.
    const guardarDecretos = async (normas: any) => {
      const decretos = normas.map(async (j: any) => {

          const index = this.articles_proyects_group.findIndex(
            (co: any) =>
              co.cuerpoLegal == j.cuerpoLegal
          );
    
          if(index == -1){
   
            return await saveCuerpoProyect(j) // Función asíncrona que busca la info del usuario.
            .then((a) => {
              return a // Regresa la info del usuario.
              })

          }else{
            return false;
          }
   
      })
      return await Promise.all(decretos) // Esperando que todas las peticiones se resuelvan.
    }
      
      const normas = await this.articles_proyects;
      
      guardarDecretos(normas)
      .then((a: any) => {
        this.getArticlesInstallation();
        this.getArticleProyect(this.project_id);
        this.getCuerpoInstallationsByProyect();
  
        this.hidePreLoader();
  
        this.activeTab = this.activeTab + 1;
  
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Cuerpos Legales guardados',
          showConfirmButton: true,
          timer: 5000,
        });
        }
      );

    }else{
      
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
    }
    
  }

  siguiente(){
    this.activeTab = this.activeTab + 1;
  }

}

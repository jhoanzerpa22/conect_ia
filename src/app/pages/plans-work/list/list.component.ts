import { Component, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { projectListWidgets/*, projectListWidgets1, projectListWidgets2*/ } from './data';
import { projectListModel/*, projectListModel1, projectListModel2*/ } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { ProjectsService } from '../../../core/services/projects.service';
import { WorkPlanService } from '../../../core/services/workPlan.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import { first } from 'rxjs/operators';
import { ToastService } from '../toast-service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { round } from 'lodash';

@Component({
  selector: 'app-list-plan',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [listService, DecimalPipe]
})

/**
 * List Component
 */
export class ListComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  projectListWidgets!: projectListModel[];
  workPlan_group: any = [];
  workPlan_auditoria_group: any = [];
  //projectListWidgets1!: projectListModel1[];
  //projectListWidgets2!: projectListModel2[];
  //projectmodel!: Observable<projectListModel2[]>;
  total: Observable<number>;
  sellers?: any;
  pagLength?: number = 0;
  term:any;
  term3: any;
  evaluations: any;
  tareas: any;
  proyectos_all: any = [];
  auditorias: any = [];
  proyecto_id: any = '';
  areaId: any = '';
  cuerpoId: any = '';

  submitted = false;
  plansForm!: UntypedFormGroup;

  areas_all: any = [];
  areas_tree: any = [];
  tree_data: any = [];
  areas: any = [];
  areas_chart: any;
  areas_select_chart: any = [];

  installations_data: any = [];
  installations_articles: any = [];
  installations_group: any = [];
  installations_group_filter: any = [];
  articles_filter: any = [];
  installations_select: any = [];
  selectChecked3: any = [];
  cuerpoLegal: any = {};

  /**Lista de Filtros */
  lista_cuerpos: any = [];
  lista_articulos: any = [];
  lista_articulos_filter: any = [];
  lista_areas: any = [];
  
  userData: any;

  constructor(private modalService: NgbModal,
    public service: listService, private projectsService: ProjectsService, private workPlanService: WorkPlanService, public toastService: ToastService,private _router: Router, private formBuilder: UntypedFormBuilder, private TokenStorageService: TokenStorageService) {
    //this.projectmodel = service.companies$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Planes de Trabajo' },
      { label: 'Lista', active: true }
    ];
    
    this.userData = this.TokenStorageService.getUser();

    /**
     * Fetches the data
     */
    this.fetchData();
    this.getWorkPlans();

    if (localStorage.getItem('toast')) {
      this.toastService.show('Plan de trabajo Creado.', { classname: 'bg-success text-center text-white', delay: 5000 });
      localStorage.removeItem('toast');
    }
    
    /**
     * Form Validation
     */
    this.plansForm = this.formBuilder.group({
      ids: [''],
      proyectoId: [''],
      areaId: [''],
      installationId: [''],
      cuerpoId: [''],
      search: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFinalizacion: ['', [Validators.required]]
    });

  }

   /**
   * Open modal
   * @param content modal content
   */
   openModal(content: any) {
    this.submitted = false;
    this.plansForm.reset();
    
      this.modalService.open(content, { size: 'xl', centered: true });    
  }

  /**
   * Form data get
   */
  get form() {
    return this.plansForm.controls;
  }

  /**
   * Work plan data
   */
  private getWorkPlans() {
    
    this.showPreLoader();
      this.workPlanService.get().pipe().subscribe(
        (data: any) => {
          let resp: any = data.data;
          let workPlans: any = [];
          this.workPlan_group = [];
          this.workPlan_auditoria_group = [];
          let auditorias: any = [];

          for (var j = 0; j < resp.length; j++) {
            if(!resp[j].type || resp[j].type == '' || resp[j].type == null || resp[j].type == 'workPlan'){
              const index_work = workPlans.findIndex(
                (w: any) =>
                  w.normaId == resp[j].normaId && w.articuloId == resp[j].articuloId
              );

              if(index_work != -1){
                workPlans[index_work].planes.push(resp[j]);
              }else{
                workPlans.push({normaId: resp[j].normaId, articuloId: resp[j].articuloId, cuerpoLegal: resp[j].cuerpoLegal, articulo: resp[j].articulo, planes: [resp[j]] });
              }
            }else if(resp[j].type && resp[j].type != '' && resp[j].type != null && resp[j].type == 'auditoria'){
              const index_auditoria = auditorias.findIndex(
                (au: any) =>
                  au.normaId == resp[j].normaId && au.articuloId == resp[j].articuloId
              );

              if(index_auditoria != -1){
                auditorias[index_auditoria].planes.push(resp[j]);
              }else{
                auditorias.push({normaId: resp[j].normaId, articuloId: resp[j].articuloId, cuerpoLegal: resp[j].cuerpoLegal, articulo: resp[j].articulo, planes: [resp[j]] });
              }
            }
          }

          //this.projectListWidgets = workPlans;
          this.workPlan_group = workPlans;
          this.workPlan_auditoria_group = auditorias;
          this.pagLength = workPlans.length;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }
  
  
  /**
   * Fetches the data
   */
  private fetchData() {
    
    //this.showPreLoader();
    //this.projectListWidgets = projectListWidgets;
    //this.projectListWidgets1 = projectListWidgets1;
    //this.projectListWidgets2 = projectListWidgets2;
    //setTimeout(() => {
      /*this.projectmodel.subscribe(x => {
        this.projectListWidgets = Object.assign([], x);
      });*/
      this.projectsService.get().pipe().subscribe(
        (data: any) => {
          let resp: any = data.data;
          let proyectos: any = [];
          let proyectos_other: any = [];

          for (var j = 0; j < resp.length; j++) {
            if(resp[j].tipoProyectoId && resp[j].tipoProyectoId != '' && resp[j].tipoProyectoId != null && resp[j].tipoProyectoId != 3){
              proyectos.push(resp[j]);
            }
          }

          this.projectListWidgets = proyectos;
          this.pagLength = proyectos.length;
          //this.getEvaluationsAll(proyectos_other);
          //this.hidePreLoader();
      },
      (error: any) => {
        //this.hidePreLoader();
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }
  
  private getHijas(hijos: any){
    let tree_data: any = [];
    for (let d in hijos) {
        this.areas_all.push({ id: hijos[d].id, nombre: hijos[d].nombre, descripcion: hijos[d].descripcion, areaId: hijos[d].areaId });

        tree_data.push({ id: hijos[d].id, nombre: hijos[d].nombre/*, area: hijos[d].area ? hijos[d].area.nombre : ''*/, descripcion: hijos[d].descripcion, areaId: hijos[d].areaId, children: hijos[d].hijas.length > 0 ? this.getHijas(hijos[d].hijas) : null });
    }
    return tree_data;
  }

  private getHijasOrg(hijos: any){
    let tree_data: any = [];
    
    for (let d in hijos) {
      this.areas_all.push({ id: hijos[d].id, nombre: hijos[d].nombre, descripcion: hijos[d].descripcion, areaId: hijos[d].areaId });
      
      tree_data.push({ id: hijos[d].id, label: hijos[d].nombre, areaId: hijos[d].areaId, expanded: hijos[d].hijas.length > 0 ? true : false, children: hijos[d].hijas.length > 0 ? this.getHijasOrg(hijos[d].hijas) : null });
    }
    return tree_data;
  }

  selectProyecto(event: any){
    this.proyecto_id = event.target.value;
    
    if(this.proyecto_id > 0){
      //this.getAreasTree();
      this.getInstallations();
    }else{
      this.tree_data = [];
      this.installations_group_filter = [];
    }
  }

  selectArea(event: any){
    this.areaId = event.target.value;

    if(this.areaId && this.areaId != '' && this.areaId != undefined && this.areaId != null){
      this.getFilterArea();
    }
  }

  selectCuerpo(event: any){
    this.cuerpoId = event.target.value;

    if(this.cuerpoId && this.cuerpoId != '' && this.cuerpoId != undefined && this.cuerpoId != null){
      this.getFilterCuerpo();
    }
  }
  
  validChecked4(id: any){
    const index = this.selectChecked3.findIndex(
      (ins: any) =>
        ins.id == id
    );

    if(index != - 1){
      return true;
    }else{
      return false;
    }
}
  
selectArticulo(articulo: any) {
  const index = this.selectChecked3.findIndex(
    (ch: any) =>
      ch.id == articulo.id
  );

  if(index != - 1){
      this.selectChecked3.splice(index, 1);
  }else{
      this.selectChecked3 = [];
      this.selectChecked3.push(articulo);
  }
}

getListaFiltros(){

  this.lista_cuerpos = [];
  this.lista_articulos = [];
  this.lista_areas = [];

  this.installations_group_filter.forEach((x: any) => {
    
    const index_area = this.lista_areas.findIndex(
      (lar: any) =>
        lar.area == x.area
    );
    
    if(index_area == -1){
      this.lista_areas.push({area: x.area});
    }

      x.instalaciones.forEach((ic: any) => {
        ic.installations_articles.forEach((ins: any) => {
          if(ins.proyectoId == this.proyecto_id && (ins.estado == '1' || ins.estado == '2')){
                
          const index_cuerpo = this.lista_cuerpos.findIndex(
            (lc: any) =>
              lc.normaId == ins.normaId
          );

          const index_articulo = this.lista_articulos.findIndex(
            (la: any) =>
              la.id == ins.articuloId
          );
          
          if(index_cuerpo == -1){
            this.lista_cuerpos.push({normaId: ins.normaId, cuerpoLegal: ins.cuerpoLegal, project_article: ins.project_article});
          }
          
          if(index_articulo == -1){
            this.lista_articulos.push({id: ins.articuloId, articulo: ins.articulo, normaId: ins.normaId});
          }
        }

        });
      });

  });

  console.log('ListaCuerpos',this.lista_cuerpos);

}

  getFilterArea(){
    //const areaId = this.plansForm.get('areaId')?.value;
    const area = this.installations_group_filter.findIndex(
      (ins: any) =>
        ins.area == this.areaId
    );

    console.log('getFilterArea',this.installations_group_filter, area);

    this.installations_select = area != -1 ? this.installations_group_filter[area].instalaciones : [];
  }
  
  getFilterCuerpo(){
    const cuerpo = this.lista_cuerpos.findIndex((cu: any) => 
    cu.normaId == this.cuerpoId);

    this.cuerpoLegal = cuerpo != -1 ? this.lista_cuerpos[cuerpo] : {};
    this.lista_articulos_filter = this.lista_articulos.filter((ar: any) => ar.normaId == this.cuerpoId);
  }

getArticulos(){
    this.articles_filter = [];
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.proyecto_id && (ins.estado == '1' || ins.estado == '2')/* && ins.normaId == this.filtro_cuerpoId*/
    );
   // let articles_group: any = [];
          filter.forEach((x: any) => {
              const index = /*articles_group*/this.articles_filter.findIndex(
                (co: any) =>
                  co.id == x.articuloId
              );

              if(index == -1){
                /*articles_group*/this.articles_filter.push({id: x.articuloId, articulo: x.articulo});
              }
            
          })
    //return articles_group;
  }
  
  getInstallations() {
    this.projectsService.getInstallationsUser()/*getInstallations(idProject)*/.pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let lista: any = [];

          for (var i = 0; i < obj.length; i++) {
            if(obj[i].installations_articles.length > 0){

              let total_articulos: any = [];
              let total_cuerpos: any = [];

              for (var j = 0; j < obj[i].installations_articles.length; j++) { 
                if(obj[i].installations_articles[j].proyectoId == this.proyecto_id && (obj[i].installations_articles[j].estado == '1' || obj[i].installations_articles[j].estado == '2')){
                  total_articulos.push(obj[i].installations_articles[j]);
                  
                  const index = total_cuerpos.findIndex(
                    (cu: any) =>
                      cu == obj[i].installations_articles[j].cuerpoLegal
                  );

                  if(index == -1){
                    total_cuerpos.push(obj[i].installations_articles[j].cuerpoLegal);
                  }

                }

              if(total_articulos.length > 0){
                this.installations_articles.push(obj[i].installations_articles[j]);
              }
              }
              obj[i].total_articulos = total_articulos.length;
              obj[i].total_cuerpos = total_cuerpos.length;
              
              if(total_articulos.length > 0){
                lista.push(obj[i]);
                
              }
            }

          }

          this.installations_data = lista;
          
          this.installations_group = [];
          lista.forEach((x: any) => {
            
            const index = this.installations_group.findIndex(
              (co: any) =>
                co.area == (x.area ? x.area.nombre : '')
            );

            if(index == -1){
              this.installations_group.push({
                area: x.area ? x.area.nombre : '', descripcion: x.area ? x.area.descripcion : '', instalaciones: [x]
              });
            }else{
              this.installations_group[index].instalaciones.push(x);
            }
          });
          
          this.getArticulos(); 

            this.installations_group_filter = this.installations_group;
            console.log('installation_group',this.installations_group_filter);
            
            this.getListaFiltros();
      },
      (error: any) => {
      });
  }

  private getAreasTree(){
    this.showPreLoader();
    
    const proyectoId = this.plansForm.get('proyectoId')?.value;

      this.projectsService.getAreasAll(proyectoId).pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let tree_data: any = [];
          let tree_data_org: any = [];
          this.areas_all = [];
          
          for (let c in obj) {
            let padre: any = obj[c].padre;

              this.areas_all.push({ id: padre.id, nombre: padre.nombre, descripcion: padre.descripcion, areaId: padre.areaId });
              
              tree_data.push({ id: padre.id, nombre: padre.nombre/*, area: padre.area ? padre.area.nombre : ''*/, descripcion: padre.descripcion, areaId: padre.areaId, children: padre.hijas.length > 0 ? this.getHijas(padre.hijas) : null });
              
              tree_data_org.push({ id: padre.id, label: padre.nombre, areaId: padre.areaId, expanded: padre.hijas.length > 0 ? true : false, children: padre.hijas.length > 0 ? this.getHijasOrg(padre.hijas) : null });
          }

          this.tree_data = tree_data;
          this.areas_tree = tree_data_org;

          this.hidePreLoader();
      },
      (error: any) => {
        //this.hidePreLoader();
        //this.error = error ? error : '';
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }
  
  getEvaluationsAll(proyectos_ids: any){
    //if(proyectos_ids.lenght > 0){
    this.projectsService.getEvaluationsAll(proyectos_ids).pipe().subscribe(
      (data: any) => {
        this.evaluations = data.data;
        this.getTasksAll(proyectos_ids);
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
    //}
  }
  
  getTasksAll(proyectos_ids: any){
    //if(proyectos_ids.lenght > 0){
    this.projectsService.getTasksAll(proyectos_ids).pipe().subscribe(
      (data: any) => {
        this.tareas = data.data;
        this.validateAuditorias();
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
    //}
  }

  validateAuditorias(){
    let proyectos: any = this.projectListWidgets;

          for (var j = 0; j < this.proyectos_all.length; j++) {
            let is_auditoria: boolean = this.evaluations.findIndex((ev: any) => 
              ev.proyectoId == this.proyectos_all[j].id && ev.auditoria == true
            ) != -1;
            
            if(is_auditoria){
              
              let is_task: boolean = this.tareas.findIndex((task: any) => 
                task.proyectoId == this.proyectos_all[j].id
              ) != -1;

              if(is_task){
                proyectos.push(this.proyectos_all[j]);              
              }
            }
          }

          this.projectListWidgets = proyectos;
          this.pagLength = proyectos.length;
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
    document.getElementById('pl1_' + id)?.remove();
  }
  
  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }

  /**
   * Active Toggle navbar
   */
  activeMenu(id: any) {
    document.querySelector('.heart_icon_' + id)?.classList.toggle('active');
  }

  formatDate(fecha_d: Date){
    const fecha: Date = new Date(fecha_d);
    return fecha.getDate()+'/'+(fecha.getMonth()+1)+'/'+fecha.getFullYear();
  }

  comenzar(proyecto_id: any){
        
            this._router.navigate(['/plans-work/'+proyecto_id+'/plans-work-anality']);
}

savePlans(){
    
  if (this.plansForm.valid) {
    this.showPreLoader();

    const fecha_inicio = this.plansForm.get('fechaInicio')?.value;
    const fecha_termino = this.plansForm.get('fechaFinalizacion')?.value;
    const proyectoId = this.plansForm.get('proyectoId')?.value;
    const installationId = this.plansForm.get('installationId')?.value;
    const cuerpoId = this.plansForm.get('cuerpoId')?.value;

    const dataWorkPlan: any = {
      fecha_inicio: fecha_inicio,
      fecha_termino: fecha_termino,
      type: 'workPlan',      
      articulo: cuerpoId && this.selectChecked3[0].id ? this.selectChecked3[0].articulo : null,
      cuerpoLegal: this.cuerpoLegal ? this.cuerpoLegal.cuerpoLegal : null,
      normaId: cuerpoId,      
      articuloId: cuerpoId && this.selectChecked3[0].id ? this.selectChecked3[0].id : null,
      installationId: installationId,
      proyectoId: proyectoId,
      empresaId: this.userData.empresaId
    };

      this.workPlanService.create(dataWorkPlan).pipe().subscribe(
      (data: any) => {

        this.getWorkPlans();
        this.hidePreLoader();
        this.modalService.dismissAll();
      },
      (error: any) => {

        this.hidePreLoader();
        this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        this.modalService.dismissAll()
      });
        
  }

  this.submitted = true
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

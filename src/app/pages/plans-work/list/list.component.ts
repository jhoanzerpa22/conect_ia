import { Component, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { projectListWidgets/*, projectListWidgets1, projectListWidgets2*/ } from './data';
import { projectListModel/*, projectListModel1, projectListModel2*/ } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { ProjectsService } from '../../../core/services/projects.service';
import { WorkPlanService } from '../../../core/services/workPlan.service';
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
  evaluations: any;
  tareas: any;
  proyectos_all: any = [];
  auditorias: any = [];

  submitted = false;
  plansForm!: UntypedFormGroup;

  constructor(private modalService: NgbModal,
    public service: listService, private projectsService: ProjectsService, private workPlanService: WorkPlanService, public toastService: ToastService,private _router: Router, private formBuilder: UntypedFormBuilder) {
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

    /**
     * Fetches the data
     */
    //this.fetchData();
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
      installationId: [''],
      cuerpoId: [''],
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
    
    this.showPreLoader();
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
            if(!resp[j].tipoProyectoId || resp[j].tipoProyectoId == '' || resp[j].tipoProyectoId == null){
              proyectos.push(resp[j]);
            }else{
              this.proyectos_all.push(resp[j]);
              proyectos_other.push(resp[j].id);
            }
          }

          this.projectListWidgets = proyectos;
          this.pagLength = proyectos.length;
          this.getEvaluationsAll(proyectos_other);
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
  /*this.showPreLoader();
  
      const auditor = this.auditoriaForm.get('auditor')?.value;
      const empresa = this.auditoriaForm.get('empresa')?.value;
      const comentario = this.auditoriaForm.get('comentario')?.value;
      const auditoria_nombre = this.auditoriaForm.get('auditoria_nombre')?.value;
      const auditoria_tipo = this.auditoriaForm.get('auditoria_tipo')?.value;
      const auditoria_ambito = this.auditoriaForm.get('auditoria_ambito')?.value;
      const fecha_inicio = this.auditoriaForm.get('fechaInicio')?.value;
      const fecha_termino = this.auditoriaForm.get('fechaFinalizacion')?.value;

      const datos = {
        "proyectoId": this.project_id,
        "cumplimiento": 0, 
        active: false, 
        auditoria: true, 
        auditor: auditor, 
        empresa: empresa, 
        comentario: comentario,
        auditoria_nombre: auditoria_nombre,
        auditoria_tipo: auditoria_tipo,
        auditoria_ambito: auditoria_ambito,
        fechaInicio: fecha_inicio,
        fechaFinalizacion: fecha_termino
      };
  
      this.projectsService.createEvaluation(datos).pipe().subscribe(
        (data: any) => {
          this.hidePreLoader();
          this.modalService.dismissAll();
          this.fetchData();
      },
      (error: any) => {
        
        this.hidePreLoader();    
        this.modalService.dismissAll();  
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Ha ocurrido un error..',
          showConfirmButton: true,
          timer: 5000,
        });
      });*/
  }
  
  /*this.modalService.dismissAll();
  setTimeout(() => {
    this.auditoriaForm.reset();
  }, 1000);*/
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

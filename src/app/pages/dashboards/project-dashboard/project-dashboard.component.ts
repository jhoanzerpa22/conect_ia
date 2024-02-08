import { Component, OnInit, ViewChild } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from './data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { round } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { estadosData } from '../../projects/estados';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})

/**
 * Projects Component
 */
export class ProjectDashboardComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  statData!: any;
  OverviewChart: any;
  ActiveProjects: any;
  MyTask: any;
  TeamMembers: any;
  status7: any;
  simpleDonutChart: any;
  simplePieChartCuerpos: any;
  simplePieChartArticulos: any;
  @ViewChild('scrollRef') scrollRef: any;

  project_id: any = '';
  project: any = {};

  evaluations: any = [];
  auditorias: any = [];

  installations_data: any = [];
  installations_articles: any = [];
  installations_group: any = [];
  userData: any;
  avance_evaluacion: number = 0;
  
  cumple: number = 0;
  nocumple: number = 0;
  parcial: number = 0;
  cuerpo_cumple: number = 0;
  cuerpo_nocumple: number = 0;
  cuerpo_parcial: number = 0;
  showData: boolean = false;
  
  estados_default: any = estadosData;
  id_evaluation: any;
  submitted = false;
  auditoriaForm!: UntypedFormGroup;

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private modalService: NgbModal, private TokenStorageService: TokenStorageService, private formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Evaluación', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.getProject(params['id']);
      this.getEvaluations(params['id']);
    });
    
    /**
     * Form Validation
     */
    this.auditoriaForm = this.formBuilder.group({
      ids: [''],
      auditoria_nombre: ['', [Validators.required]],
      auditor: ['', [Validators.required]],
      empresa: ['', [Validators.required]],
      auditoria_tipo: ['', [Validators.required]],
      auditoria_ambito: [''],
      comentario: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFinalizacion: ['', [Validators.required]]
    });

    /**
     * Fetches the data
     */
    this.fetchData();

    this._simplePieChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._simplePieChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
  }

  ngAfterViewInit() {
    //this.scrollRef.SimpleBar.getScrollElement().scrollTop = 600;
  }

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  getProject(idProject?: any){
      this.projectsService.getById(idProject).pipe().subscribe(
        (data: any) => {
          this.project = data.data;
      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
   }
   
   /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.auditoriaForm.reset();
    
      this.modalService.open(content, { size: 'lg', centered: true });
    
  }

   getEvaluations(idProject?: any){
       this.projectsService.getEvaluations(idProject).pipe().subscribe(
         (data: any) => {
           this.showData = true;
           const evaluaciones_proyectos = data.data;
            for (let ev in evaluaciones_proyectos) {

              if(evaluaciones_proyectos[ev].auditoria == true){
                this.auditorias.push(evaluaciones_proyectos[ev]);
              }else{
               this.evaluations.push(evaluaciones_proyectos[ev]);
              }
            }
       },
       (error: any) => {
         //this.error = error ? error : '';
         //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
       });
    }
    

 getCategoryStatus(estado?: any){
  if(estado){  
    const index = this.estados_default.findIndex(
      (es: any) =>
        es.value == estado
    );

    if(index != -1){
      return this.estados_default[index].category;
    }else{
      return null;
    }

  }else{
    return estado;
  }
  
  }

  countCuerposLegales(){
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id
    );
    let articles_group: any = [];
          filter.forEach((x: any) => {
            
            const index = articles_group.findIndex(
              (co: any) =>
                co == x.normaId
            );

            if(index == -1){
              articles_group.push(x.normaId);
            }
          })

    return articles_group.length;
  }
  
  countArticulos(){
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id
    );
    let articles_group: any = [];
          filter.forEach((x: any) => {
            
            const index = articles_group.findIndex(
              (co: any) =>
                co == x.articuloId
            );

            if(index == -1){
              articles_group.push(x.articuloId);
            }
          })

    return articles_group.length;
  }

  /**
 * Simple Pie Chart Cuerpos
 */
  private _simplePieChartCuerpos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.simplePieChartCuerpos = {
      series: [this.cuerpo_cumple, this.cuerpo_parcial, this.cuerpo_nocumple],
      chart: {
        height: 300,
        type: "pie",
      },
      labels: ["Cumple", "Cumple parcial", "No cumple"],
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      colors: colors,
    };
  }

  /**
 * Simple Pie Chart Articulos
 */
  private _simplePieChartArticulos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.simplePieChartArticulos = {
      series: [this.cumple, this.parcial, this.nocumple],
      chart: {
        height: 300,
        type: "pie",
      },
      labels: ["Cumple", "Cumple parcial", "No cumple"],
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      colors: colors,
    };
  }

  // Chart Colors Set
  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(" ", "");
          return color;
        }
        else return newValue;;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  /**
   * Form data get
   */
  get form() {
    return this.auditoriaForm.controls;
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
  
  goDashboard(){
    this._router.navigate(['/'+this.project_id+'/project-dashboard/resumen']);
  }

  goEvaluation(id?: any){
      this._router.navigate(['/'+this.project_id+'/project-dashboard/evaluations/'+id]);
  }

  goControl(){
    this._router.navigate(['/'+this.project_id+'/project-control']);
  }

  saveAuditoria(){
    
    if (this.auditoriaForm.valid) {
    this.showPreLoader();
    
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
            this._router.navigate(['/'+this.project_id+'/project-dashboard/evaluations/'+data.data.id]);
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
        });
    }
    
    /*this.modalService.dismissAll();
    setTimeout(() => {
      this.auditoriaForm.reset();
    }, 1000);*/
    this.submitted = true
  }

  createEvaluation(){
    
    Swal.fire({
        title: '¿Desea crear una nueva evaluación?',
        text: 'Se mostraran todas las instancias de cumplimientos asociadas al proyecto para su respectiva evaluación',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#364574',
        cancelButtonColor: 'rgb(243, 78, 78)',
        confirmButtonText: 'Si',
        cancelButtonText: 'Cancelar',
        denyButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
  
        this.showPreLoader();
        const index = this.evaluations.findIndex(
          (ev: any) =>
            ev.active == true
        );
    
        const active = index != -1 ? false : true;

        const datos = {
          "proyectoId": this.project_id,
         active: active
        };
    
        this.projectsService.createEvaluation(datos).pipe().subscribe(
          (data: any) => {
            this.hidePreLoader();
            this._router.navigate(['/'+this.project_id+'/project-dashboard/evaluations/'+data.data.id]);
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
  
  } else if (result.isDenied) {
            
  }
  });
    
  }

  homologar(content: any, evaluation: any){
    /*Swal.fire({
      title: '¿Está segur@ que desea realizar la homologación?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#364574',
      cancelButtonColor: 'rgb(243, 78, 78)',
      confirmButtonText: 'Homologar',
      cancelButtonText: 'Cancelar'
    });*/
    if(evaluation && !evaluation.active){
    this.id_evaluation = evaluation.id;
    
    this.modalService.open(content, { centered: true });
    }
  }
  
  saveHomologar(contentProgress: any, contentSuccess: any){
    this.modalService.open(contentProgress, { centered: true });
    
    this.projectsService.homologarEvaluation(this.id_evaluation ,this.project_id).pipe().subscribe(
      (data: any) => {
        
        this.getEvaluations(this.project_id);
        
        this.modalService.dismissAll();
        this.modalService.open(contentSuccess, { centered: true });
    },
    (error: any) => {
      
      this.modalService.dismissAll();
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
    });
    
  }

  terminar(){

    if(this.project.estado && this.project.estado != null && this.project.estado != undefined && this.project.estado > 2){
      
      Swal.fire({
        title: 'Evaluación finalizada!',
        //text: 'You clicked the button!',
        icon: 'success',
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonColor: '#364574',
        cancelButtonColor: 'rgb(243, 78, 78)',
        confirmButtonText: 'OK',
        timer: 5000
      });
    }else{
    
    this.showPreLoader();
    this.projectsService.estadoProyecto(3, this.project_id).pipe().subscribe(
      (data: any) => {
        this.hidePreLoader();
        Swal.fire({
          title: 'Evaluación finalizada!',
          //text: 'You clicked the button!',
          icon: 'success',
          showConfirmButton: true,
          showCancelButton: false,
          confirmButtonColor: '#364574',
          cancelButtonColor: 'rgb(243, 78, 78)',
          confirmButtonText: 'OK',
          timer: 5000
        });
        this.getProject(this.project_id);
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

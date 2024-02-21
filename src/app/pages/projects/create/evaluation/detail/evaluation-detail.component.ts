import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './evaluation-detail.model';
import { folderData } from './data';
import { RecentService } from './evaluation-detail.service';
import { NgbdRecentSortableHeader, SortEvent } from './evaluation-detail-sortable.directive';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { ToastService } from '../../../toast-service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { TokenStorageService } from '../../../../../core/services/token-storage.service';

import { estadosData } from '../../../estados';

// Sweet Alert
import Swal from 'sweetalert2';
import { round } from 'lodash';

@Component({
  selector: 'app-evaluation-detail',
  templateUrl: './evaluation-detail.component.html',
  styleUrls: ['./evaluation-detail.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * EvaluationDetail Component
 */
export class EvaluationDetailComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  project: any = {};
  idEvaluation: any = '';

  installation_id: any = null;
  detail: any = [];
  cuerpos_articulos: any = [];
  articles_proyects_group: any = [];
  articles_proyects_group_all: any = [];
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
  basicRadialbarChart: any;
  customAngleChartCuerpos: any;
  customAngleChartArticulos: any;
  customAngleChartPermisos: any;
  customAngleChartReportes: any;
  customAngleChartMonitoreo: any;
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
  cuerpo_cumple: number = 0;
  cuerpo_nocumple: number = 0;
  cuerpo_parcial: number = 0;
  reporte_cumple: number = 0;
  reporte_nocumple: number = 0;
  reporte_parcial: number = 0;
  monitoreo_cumple: number = 0;
  monitoreo_nocumple: number = 0;
  monitoreo_parcial: number = 0;
  permiso_cumple: number = 0;
  permiso_nocumple: number = 0;
  permiso_parcial: number = 0;
  avance: number = 0;
  total_articulos: number = 0;

  evaluations: any = {};
  
  estados_default: any = estadosData;
  term:any;
  id_evaluation: any;
  id_article: any;

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

    //this._basicRadialbarChart('["--vz-warning"]', 75);
    this._customAngleChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._customAngleChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._customAngleChartPermisos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._customAngleChartReportes('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._customAngleChartMonitoreo('["--vz-success", "--vz-warning", "--vz-danger"]');

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
      this.idEvaluation = params['idEvaluation'];

        this.getArticlesByInstallationBody(this.installation_id);
        this.getProject();
        this.getEvaluations();
    });

    // Data Get Function
    //this._fetchData();
  }

  // Chart Colors Set
  private getChartColorsArray(colors:any) {
    colors = JSON.parse(colors);
    return colors.map(function (value:any) {
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
 * Grafica cuerpos legales
 */
  private _customAngleChartCuerpos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.customAngleChartCuerpos = {
      series: [this.cuerpo_cumple, this.cuerpo_parcial, this.cuerpo_nocumple],
      chart: {
          height: 200,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: {
                  margin: 5,
                  size: "30%",
                  background: "transparent",
                  image: undefined,
              },
              dataLabels: {
                  name: {
                      show: false,
                  },
                  value: {
                      show: false,
                  },
              },
          },
      },
      colors: colors,
      labels: ["Cumple", "Cumple Parcial", "No Cumple"],
      legend: {
          show: true,
          floating: true,
          fontSize: "12px",
          position: "left",
          offsetX: 20,
          offsetY: -10,
          labels: {
              useSeriesColors: true,
          },
          markers: {

          },
          formatter: function (seriesName:any, opts:any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
          itemMargin: {
              vertical: 3,
          },
      },
      responsive: [{
          breakpoint: 480,
          options: {
              legend: {
                  show: false,
              },
          },
      }, ],
    };
  }
  
  /**
 * Grafica articulos
 */
  private _customAngleChartArticulos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.customAngleChartArticulos = {
      series: [this.cumple, this.parcial, this.nocumple],
      chart: {
          height: 200,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: {
                  margin: 5,
                  size: "30%",
                  background: "transparent",
                  image: undefined,
              },
              dataLabels: {
                  name: {
                      show: false,
                  },
                  value: {
                      show: false,
                  },
              },
          },
      },
      colors: colors,
      labels: ["Cumple", "Cumple Parcial", "No Cumple"],
      legend: {
          show: true,
          floating: true,
          fontSize: "12px",
          position: "left",
          offsetX: 20,
          offsetY: -10,
          labels: {
              useSeriesColors: true,
          },
          markers: {

          },
          formatter: function (seriesName:any, opts:any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
          itemMargin: {
              vertical: 3,
          },
      },
      responsive: [{
          breakpoint: 480,
          options: {
              legend: {
                  show: false,
              },
          },
      }, ],
    };
  }
  
  /**
 * Grafica permisos
 */
  private _customAngleChartPermisos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.customAngleChartPermisos = {
      series: [this.permiso_cumple, this.permiso_parcial, this.permiso_nocumple],
      chart: {
          height: 200,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: {
                  margin: 5,
                  size: "30%",
                  background: "transparent",
                  image: undefined,
              },
              dataLabels: {
                  name: {
                      show: false,
                  },
                  value: {
                      show: false,
                  },
              },
          },
      },
      colors: colors,
      labels: ["Cumple", "Cumple Parcial", "No Cumple"],
      legend: {
          show: true,
          floating: true,
          fontSize: "12px",
          position: "left",
          offsetX: 20,
          offsetY: -10,
          labels: {
              useSeriesColors: true,
          },
          markers: {

          },
          formatter: function (seriesName:any, opts:any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
          itemMargin: {
              vertical: 3,
          },
      },
      responsive: [{
          breakpoint: 480,
          options: {
              legend: {
                  show: false,
              },
          },
      }, ],
    };
  }
  
  /**
 * Grafica Reportes
 */
  private _customAngleChartReportes(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.customAngleChartReportes = {
      series: [this.reporte_cumple, this.reporte_parcial, this.reporte_nocumple],
      chart: {
          height: 200,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: {
                  margin: 5,
                  size: "30%",
                  background: "transparent",
                  image: undefined,
              },
              dataLabels: {
                  name: {
                      show: false,
                  },
                  value: {
                      show: false,
                  },
              },
          },
      },
      colors: colors,
      labels: ["Cumple", "Cumple Parcial", "No Cumple"],
      legend: {
          show: true,
          floating: true,
          fontSize: "12px",
          position: "left",
          offsetX: 20,
          offsetY: -10,
          labels: {
              useSeriesColors: true,
          },
          markers: {

          },
          formatter: function (seriesName:any, opts:any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
          itemMargin: {
              vertical: 3,
          },
      },
      responsive: [{
          breakpoint: 480,
          options: {
              legend: {
                  show: false,
              },
          },
      }, ],
    };
  }
  
  /**
 * Grafica Monitoreo
 */
  private _customAngleChartMonitoreo(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.customAngleChartMonitoreo = {
      series: [this.monitoreo_cumple, this.monitoreo_parcial, this.monitoreo_nocumple],
      chart: {
          height: 200,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              offsetY: 0,
              startAngle: 0,
              endAngle: 270,
              hollow: {
                  margin: 5,
                  size: "30%",
                  background: "transparent",
                  image: undefined,
              },
              dataLabels: {
                  name: {
                      show: false,
                  },
                  value: {
                      show: false,
                  },
              },
          },
      },
      colors: colors,
      labels: ["Cumple", "Cumple Parcial", "No Cumple"],
      legend: {
          show: true,
          floating: true,
          fontSize: "12px",
          position: "left",
          offsetX: 20,
          offsetY: -10,
          labels: {
              useSeriesColors: true,
          },
          markers: {

          },
          formatter: function (seriesName:any, opts:any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex];
          },
          itemMargin: {
              vertical: 3,
          },
      },
      responsive: [{
          breakpoint: 480,
          options: {
              legend: {
                  show: false,
              },
          },
      }, ],
    };
  }
  
  /**
 * Basic Radialbar Chart
 */
  /*private _basicRadialbarChart(colors:any, avance: number) {
    colors = this.getChartColorsArray(colors);
    this.basicRadialbarChart = {
      series: [70],
      chart: {
          height: 150,
          offsetY: 0,
          type: "radialBar",
      },
      plotOptions: {
          radialBar: {
              hollow: {
                  size: "70%",
              },
              dataLabels: {
                name: {
                    show: false,
                },
                value: {
                    offsetY: 0,
                    fontSize: "22px",
                },
            },
          },
      },
      labels: [""],
      colors: colors,
    };
  }*/

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

  getProject(){
    this.projectsService.getById(this.project_id).pipe().subscribe(
      (data: any) => {
        this.project = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
 }
 
 getEvaluations(){
  this.projectsService.getEvaluations(this.project_id).pipe().subscribe(
    (data: any) => {
      const evaluation_data = data.data;
      const index = evaluation_data.findIndex(
        (ev: any) =>
          ev.id == this.idEvaluation
      );
      this.evaluations = index != -1 ? evaluation_data[index] : {};
  },
  (error: any) => {
    //this.error = error ? error : '';
    //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
  });
}

 goEvaluation(id: any, evaluation: any){
  if(!this.evaluations.fechaFinalizacion || this.evaluations.auditoria){
    if(evaluation.evaluationProyectId == this.idEvaluation && evaluation.estado){
      this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+this.installation_id+'/FollowEdit/'+id+'/'+this.idEvaluation]);
    }else{
      this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+this.installation_id+'/Follow/'+id+'/'+this.idEvaluation]);
    }
  }else{
    this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+this.installation_id+'/FollowView/'+id+'/'+this.idEvaluation]);
  }
}

getFindings(findings: any, evaluation_id: any){
 const findings_filter = findings.filter((f: any) => {
    return f.evaluationId === evaluation_id/*this.evaluations.id*/;
  });

  return findings_filter;
}

getArticlesCuerpo(articulos: any){
  let articulosData: any = [];

  for (var j = 0; j < articulos.length; j++) {
    const index = articulosData.findIndex(
      (co: any) =>
        co.articuloId == articulos[j].articuloId
    );

    if(index == -1 && articulos[j].proyectoId == this.project_id && articulos[j].estado == '1'/* && (!articulos[j].evaluations || !articulos[j].evaluations.evaluationProyectId || (articulos[j].evaluations && articulos[j].evaluations.evaluationProyectId && articulos[j].evaluations.evaluationProyectId == this.idEvaluation))*/
      ){

        if(articulos[j].evaluations && articulos[j].evaluations.evaluationProyectId && articulos[j].evaluations.evaluationProyectId != this.idEvaluation)
        {
          articulos[j].evaluations = {};
        }

      articulosData.push(articulos[j]);
    }else if(index != -1 && articulos[j].proyectoId == this.project_id && articulos[j].estado == '1'){
      if((!articulosData[index].evaluations || !articulosData[index].evaluations.evaluationProyectId) && articulos[j].evaluations && articulos[j].evaluations.evaluationProyectId && articulos[j].evaluations.evaluationProyectId == this.idEvaluation){
        articulosData[index] = articulos[j];
      }
    }
  }

  //let order: any = articulosData.sort((a: any, b: any) => a.articulo.toString().trim().toLowerCase().localeCompare(b.articulo.toString().trim().toLowerCase()));
  let order: any = articulosData.sort((a: any, b: any) => {
    const numeroA = parseInt(a.articulo.toString().trim().toLowerCase().split(' ')[1]);
    const numeroB = parseInt(b.articulo.toString().trim().toLowerCase().split(' ')[1]);

    if(numeroA > 0 || numeroB > 0){
      return numeroA - numeroB;
    }else{
      return a.articulo.toString().trim().toLowerCase().localeCompare(b.articulo.toString().trim().toLowerCase());
    }
});
  
  return order;
  //return articulosData.sort((a: any, b: any) => a.articulo.localeCompare(b.articulo, { sensitivity: 'base' }));

  /*return articulosData.sort(function (a: any, b: any) {
    if (a.articulo.toUpperCase().trimEnd() < b.articulo.toUpperCase().trimEnd()) {
      return -1;
    }
    if (a.articulo.toUpperCase().trimEnd() > b.articulo.toUpperCase().trimEnd()) {
      return 1;
    }
    return 0;
  });*/

  /*return articulosData.sort(function (a: any, b: any) {
      
    let x = a.articulo.trimEnd().toUpperCase(),
    y = b.articulo.trimEnd().toUpperCase();
    return x == y ? 0 : x > y ? 1 : -1;

  });*/
}

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

  selectCuerpo(e: any){
    //this.showPreLoader();
    let cuerpo: any = e.target.value;
    /*this.cuerpo_select = cuerpo;
    this.articulosDatas = this.detail.data.filter((data: any) => {
      return data.cuerpoLegal === cuerpo;
    })[0].articulos;*/

    if(cuerpo){

      this.articles_proyects_group = this.articles_proyects_group_all.filter((data: any) => {
        return data.cuerpoLegal === cuerpo;
      });

    }else{
      this.articles_proyects_group = this.articles_proyects_group_all;
    }
    
    //this.hidePreLoader();
  }

  validateCuerpo(cuerpo: any){
    return this.cuerpo_select == cuerpo;
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

  private getArticlesByInstallationBody(installation_id: any){

    this.showPreLoader();
      this.projectsService.getArticlesByInstallationBody(installation_id).pipe().subscribe(
        (data: any) => {
          this.detail = data.data;

          let articulos: any = data.data.data.length > 0 ? data.data.data : [];
          let cuerpo_articulos: any = [];
          
          this.articles_proyects_group = [];
          this.articles_proyects_group_all = [];

          //this.installations_articles = data.data;

          let cumple: number = 0;
          let nocumple: number = 0;
          let parcial: number = 0;
          let cumple_norma: number = 0;
          let nocumple_norma: number = 0;
          let parcial_norma: number = 0;

          let cumple_monitoreo: number = 0;
          let nocumple_monitoreo: number = 0;
          let parcial_monitoreo: number = 0;
          
          let cumple_reporte: number = 0;
          let nocumple_reporte: number = 0;
          let parcial_reporte: number = 0;
          
          let cumple_permiso: number = 0;
          let nocumple_permiso: number = 0;
          let parcial_permiso: number = 0;

          let avance: number = 0;
          let total: number = 0;

          for (var i = 0; i < articulos.length; i++) {
            if(articulos[i].articulos.length > 0){
              //total += articulos[i].articulos.length;
              let procede: boolean = false;
              
              let cuerpo_cumple: number = 0;
              let cuerpo_nocumple: number = 0;
              let cuerpo_parcial: number = 0;
              let total_cuerpos: number = 0;
              let articulos_group: any = [];

              for (var j = 0; j < articulos[i].articulos.length; j++) {
                if(articulos[i].articulos[j].proyectoId == this.project_id && /*(*/articulos[i].articulos[j].estado == '1'/* || articulos[i].articulos[j].estado == '2')*/){
                  const index = articulos_group.findIndex(
                    (ar: any) =>
                      ar == articulos[i].articulos[j].articuloId
                  );

                  const index_articulo = articulos[i].articulos.findIndex(
                    (ar: any) =>
                      ar.evaluations && ar.evaluations.evaluationProyectId && ar.evaluations.evaluationProyectId == this.idEvaluation
                  );
              
                  if(index == -1 && (index_articulo == -1 || (index_articulo != -1 && articulos[i].articulos[j].evaluations && articulos[i].articulos[j].evaluations.evaluationProyectId && articulos[i].articulos[j].evaluations.evaluationProyectId == this.idEvaluation))){
                    articulos_group.push(articulos[i].articulos[j].articuloId);
                    total += 1;
                    total_cuerpos += 1;
                    procede = true;

                  const evaluation_active = articulos[i].articulos[j].evaluations;

                  if(/*articulos[i].articulos[j].evaluations.estado*/evaluation_active && evaluation_active.estado && evaluation_active.evaluationProyectId == this.idEvaluation){
                    switch (this.getCategoryStatus(/*articulos[i].articulos[j].evaluations.estado*/evaluation_active.estado)) {
                      case 'CUMPLE':
                        cumple ++;
                        cuerpo_cumple ++;

                            switch (articulos[i].articulos[j].project_article.articuloTipo) {
                              case 'monitoreo':
                                cumple_monitoreo++;
                                break;
                              
                              case 'reporte':                              
                                cumple_reporte++;
                                break;
          
                              case 'permiso':
                                cumple_permiso++;
                              break;
                            
                              default:
                                break;
                            }
                        break;

                      case 'NO CUMPLE':
                        nocumple ++;
                        cuerpo_nocumple ++;
                        
                          switch (articulos[i].articulos[j].project_article.articuloTipo) {
                            case 'monitoreo':
                              nocumple_monitoreo++;
                              break;
                            
                            case 'reporte':                              
                              nocumple_reporte++;
                              break;
        
                            case 'permiso':
                              nocumple_permiso++;
                            break;
                          
                            default:
                              break;
                          }
                        break;
                      
                      case 'CUMPLE PARCIALMENTE':
                        parcial ++;
                        cuerpo_parcial ++;
                        
                          switch (articulos[i].articulos[j].project_article.articuloTipo) {
                            case 'monitoreo':
                              parcial_monitoreo++;
                              break;
                            
                            case 'reporte':                              
                              parcial_reporte++;
                              break;
        
                            case 'permiso':
                              parcial_permiso++;
                            break;
                          
                            default:
                              break;
                          }
                        break;
                    
                      default:
                        break;
                    }
                    
                  }
                }
                }
              }
              if(procede){
                cuerpo_articulos.push(articulos[i]);
                //total_cuerpos = parseInt(articulos[i].articulos.length);

                if(cuerpo_cumple > 0 || cuerpo_parcial > 0 || cuerpo_nocumple > 0){
                  /*if(cuerpo_cumple > cuerpo_parcial && cuerpo_cumple > cuerpo_nocumple){
                    cumple_norma ++;
                  }else if(cuerpo_parcial > cuerpo_cumple && cuerpo_parcial > cuerpo_nocumple){
                    parcial_norma ++;
                  }else if(cuerpo_nocumple > cuerpo_cumple && cuerpo_nocumple > cuerpo_parcial){
                    nocumple_norma ++;
                  }else{
                    parcial_norma ++;
                  }*/
                  if(cuerpo_cumple == total_cuerpos){
                    cumple_norma ++;
                  }else if(cuerpo_nocumple == total_cuerpos){
                    nocumple_norma ++;
                  }else{
                    parcial_norma ++;
                  }
                }

              }
            }
          }

          this.total_articulos = 0;

          for (let cc = 0; cc < cuerpo_articulos.length; cc++) {
            this.total_articulos += this.getArticlesCuerpo(cuerpo_articulos[cc].articulos).length;
          }

          //avance = total > 0 ? ((((cumple * 100) + (nocumple * 50 * 0) + (parcial * 50)) * 100) / (total * 100)) : 0;
          avance = this.total_articulos > 0 ? ((((cumple * 100) + (nocumple * 100) + (parcial * 100)) * 100) / (this.total_articulos * 100)) : 0;

          this.avance = round(avance, 0);
          //this.total_articulos = total;

          this.cumple = cumple;
          this.nocumple = nocumple;
          this.parcial = parcial;
          this.cuerpo_cumple = cumple_norma;
          this.cuerpo_nocumple = nocumple_norma;
          this.cuerpo_parcial = parcial_norma;
          this.monitoreo_cumple = cumple_monitoreo;
          this.monitoreo_nocumple = nocumple_monitoreo;
          this.monitoreo_parcial = parcial_monitoreo;
          this.reporte_cumple = cumple_reporte;
          this.reporte_nocumple = nocumple_reporte;
          this.reporte_parcial = parcial_reporte;
          this.permiso_cumple = cumple_permiso;
          this.permiso_nocumple = nocumple_permiso;
          this.permiso_parcial = parcial_permiso;
          
          //this.articulosDatas = articulos.length > 0 ? articulos[0].articulos : [];
          this.articulosDatas = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].articulos : [];

          //this.cuerpo_select = articulos.length > 0 ? articulos[0].cuerpoLegal : '';
          this.cuerpo_select = cuerpo_articulos.length > 0 ? cuerpo_articulos[0].cuerpoLegal : '';
          this.cuerpos_articulos = cuerpo_articulos;
          this.articles_proyects_group_all = cuerpo_articulos;
          this.articles_proyects_group = cuerpo_articulos;

          /*cuerpo_articulos.forEach((x: any) => {

            console.log('cuerpo_articulos',x);

            const index4 = this.articles_proyects_group.findIndex(
              (co: any) =>
                co.normaId == x.normaId
            );

            if(index4 == -1){
              this.articles_proyects_group.push({
                cuerpoLegal: x.cuerpoLegal, organismo: x.organismo, normaId: x.normaId, encabezado: x.encabezado, tituloNorma: x.tituloNorma, proyectoId: x.proyectoId, articulos: [x]
              });

            }else{
              this.articles_proyects_group[index4].articulos.push(x);
            }

          });*/
          //console.log('group',this.articles_proyects_group);

          //this._basicRadialbarChart('["--vz-warning"]', this.avance);

          this._customAngleChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._customAngleChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._customAngleChartMonitoreo('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._customAngleChartPermisos('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._customAngleChartReportes('["--vz-success", "--vz-warning", "--vz-danger"]');

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
  
  homologar(content: any, evaluation: any){
    if(evaluation && !evaluation.active){
      this.id_evaluation = evaluation.id;
      this.id_article = evaluation.installationArticleId;
    
      this.modalService.open(content, { centered: true });
    }
  }
  
  saveHomologar(contentProgress: any, contentSuccess: any){
    this.modalService.open(contentProgress, { centered: true });
    
    this.projectsService.homologarEvaluationByArticle(this.id_evaluation ,this.project_id, this.id_article).pipe().subscribe(
      (data: any) => {
        
        this.getArticlesByInstallationBody(this.installation_id);      
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

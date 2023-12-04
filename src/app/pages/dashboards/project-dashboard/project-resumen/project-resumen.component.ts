import { Component, OnInit, ViewChild } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from './data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { round } from 'lodash';
import {Location} from '@angular/common';

import { estadosData } from '../../../projects/estados';

@Component({
  selector: 'app-project-resumen',
  templateUrl: './project-resumen.component.html',
  styleUrls: ['./project-resumen.component.scss']
})

/**
 * Projects Resumen Component
 */
export class ProjectResumenComponent implements OnInit {

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
  type: any = '';
  project: any = {};
  projects: any = [];
  evaluations: any = {};

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

  /**Graficas */
  criticidad: any;
  criticidad_old: any;
  tipo: any;
  tipo_cuerpo: any;
  criticidad_cuerpo: any;
  filtro_area: any;
  filtro_area_cuerpo: any;
  filtro_cuerpo: any;
  filtro_cuerpoId: any;
  filtro_articulo: any;
  filtro_articuloId: any;
  filtro_atributo: any;
  filtro_proyecto: any;
  filtro_proyectoId: any;
  areas: any = [];
  areas_chart: any;
  areas_select_chart: any = [];
  articulos_chart: any = [];
  articulos: any=[];

  dashboard_new: any;
  dashboard: any;
  dashboardCuerpo: any;
  dashboardArea: any;
  dashboardInstallation: any;
  dashboardAreaCuerpo: any;
  dashboardInstallationCuerpo: any;

  simpleDonutChartArticulos: any;
  simpleDonutChartInstancias: any;
  simpleDonutChartCuerpos: any;
  simpleDonutChartReportes: any;
  simpleDonutChartPermisos: any;
  simpleDonutChartMonitoreos: any;
  simpleDonutChartOtros: any;
  simpleDonutChartArticulosAmbito: any;
  simpleDonutChartInstanciasAmbito: any;
  simpleDonutChartCuerposAmbito: any;
  
  basicBarChartGeneral: any;
  basicBarChartGeneralInstallation: any;
  basicBarChartReportes: any;
  basicBarChartPermisos: any;
  basicBarChartMonitoreos: any;
  basicBarChartOtros: any;
  basicBarChartReportesCumplimiento: any;
  basicBarChartPermisosCumplimiento: any;
  basicBarChartMonitoreosCumplimiento: any;
  basicBarChartOtrosCumplimiento: any;
  basicBarChartReportesInstallations: any;
  basicBarChartPermisosInstallations: any;
  basicBarChartMonitoreosInstallations: any;
  basicBarChartOtrosInstallations: any;
  basicBarChartCuerpos: any;
  basicBarChartArticulos: any;
  basicBarChartGeneralCuerpos: any;
  basicBarChartGeneralCuerposInstallation: any;
  
  stacked100BarChart: any;
  stacked100BarChart2: any;
  stacked100BarChart3: any;
  stacked100BarChartArticulos: any;
  stacked100BarChartInstancias: any;
  stacked100BarChartPermisos: any;
  stacked100BarChartReportes: any;
  stacked100BarChartMonitoreos: any;
  stacked100BarChartOtros: any;
  stacked100BarChartAmbienteCriticidad: any;
  stacked100BarChartAmbienteCriticidadCuerpos: any;
  stacked100BarChartAmbienteCriticidadInstancias: any;

  ambiente: number = 0;
  sso: number = 0;
  energia: number = 0;
  ambiente_alta: number = 0;
  ambiente_media: number = 0;
  ambiente_baja: number = 0;
  ambiente_otros: number = 0;
  sso_alta: number = 0;
  sso_media: number = 0;
  sso_baja: number = 0;
  sso_otros: number = 0;
  energia_alta: number = 0;
  energia_media: number = 0;
  energia_baja: number = 0;
  energia_otros: number = 0;
  
  cuerpo_ambiente: number = 0;
  cuerpo_sso: number = 0;
  cuerpo_energia: number = 0;
  cuerpo_ambiente_alta: number = 0;
  cuerpo_ambiente_media: number = 0;
  cuerpo_ambiente_baja: number = 0;
  cuerpo_ambiente_otros: number = 0;
  cuerpo_sso_alta: number = 0;
  cuerpo_sso_media: number = 0;
  cuerpo_sso_baja: number = 0;
  cuerpo_sso_otros: number = 0;
  cuerpo_energia_alta: number = 0;
  cuerpo_energia_media: number = 0;
  cuerpo_energia_baja: number = 0;
  cuerpo_energia_otros: number = 0;
  
  select_gestion: any = 'instancias';
  select_gestion_instalacion: any = 'instancias';

  articles_filter: any = [];
  
  estados_default: any = estadosData;
  articles_proyects_group: any = [];

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private _location: Location) {
  }

  ngOnInit(): void {

    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Tablero', active: true }
    ];

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }

    this.route.params.subscribe(params => {
      /**
     * BreadCrumb
     */
      this.breadCrumbItems = [
        { label: 'Proyecto' },
        { label: params['type'] == 'control' ? 'Control' : 'Evaluación' },
        { label: 'Dashboard', active: true }
      ];

      this.type = params['type'];

      if(params['id']){
        this.project_id = params['id'];
        this.getProject(params['id']);    
        this.getAreas(params['id']);
        this.getArticleProyect(params['id']);
        this.getEvaluations(params['id']);
        this.getInstallations(params['id']);
        //this.getDashboardNew(params['id'], true);
        this.getDashboard(params['id'], true);
        this.getDashboardArea(params['id'], 'default', true);
        this.getDashboardInstalaciones(params['id'], 'articulos', true);
        //this.getDashboardCuerpo(params['id']);
        //this.getDashboardAreaCuerpo(params['id']);
      }else{
        this.getProjects();
      }
    });

    /**
     * Fetches the data
     */
    this.fetchData();

    // Chart Color Data Get Function
    //this._OverviewChart('["--vz-primary", "--vz-warning", "--vz-success"]');
    //this._status7('["--vz-success", "--vz-primary", "--vz-warning", "--vz-danger"]');
    //this._simpleDonutChart('["--vz-primary", "--vz-warning", "--vz-info"]');
    this._simplePieChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._simplePieChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this.setChart();
  }

  private getProjects() {
    
    this.showPreLoader();
      this.projectsService.get().pipe().subscribe(
        (data: any) => {
          let resp: any = data.data;
          let proyectos: any = [];

          for (var j = 0; j < resp.length; j++) {
            if(resp[j].tipoProyectoId && resp[j].tipoProyectoId != '' && resp[j].tipoProyectoId != null && resp[j].tipoProyectoId != 3){
              proyectos.push(resp[j]);
            }
          }
          this.projects = proyectos;

          if(proyectos.length > 0){
            const proyecto = proyectos[0].id;
            this.filtro_proyectoId = proyecto;
            this.filtro_proyecto = proyectos[0].nombre;
            this.project_id = proyecto;
            
            this.getProject(proyecto);    
            this.getAreas(proyecto);
            this.getArticleProyect(proyecto);
            this.getEvaluations(proyecto);
            this.getInstallations(proyecto);
            //this.getDashboardNew(proyecto, true);
            this.getDashboard(proyecto, true);
            this.getDashboardArea(proyecto, 'default', true);
            this.getDashboardInstalaciones(proyecto, 'articulos', true);
            //this.getDashboardCuerpo(proyecto);
            //this.getDashboardAreaCuerpo(proyecto);
          }
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

  goDetail(id: any){
    this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+id+'/DetailAll']);
  }
  
  goControl(){
    this._router.navigate(['/'+this.project_id+'/project-control']);
  }

  regresar() {
    this._location.back();
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

   getEvaluations(idProject?: any){
       this.projectsService.getEvaluations(idProject).pipe().subscribe(
         (data: any) => {
           this.evaluations = data.data;
       },
       (error: any) => {
         //this.error = error ? error : '';
         //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
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

  getInstallations(idProject?: any) {
    this.projectsService.getInstallationsUser()/*getInstallations(idProject)*/.pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let lista: any = [];
          let avance_total: number = 0;

          let cumple: number = 0;
          let nocumple: number = 0;
          let parcial: number = 0;
          let cumple_norma: number = 0;
          let nocumple_norma: number = 0;
          let parcial_norma: number = 0;

          for (var i = 0; i < obj.length; i++) {
            if(obj[i].installations_articles.length > 0){

              let total_articulos: any = [];
              let total_cuerpos: any = [];
              
              let cuerpo_cumple: number = 0;
              let cuerpo_nocumple: number = 0;
              let cuerpo_parcial: number = 0;

              for (var j = 0; j < obj[i].installations_articles.length; j++) { 
                if(obj[i].installations_articles[j].proyectoId == this.project_id){
                  total_articulos.push(obj[i].installations_articles[j]);
                  
                  const index = total_cuerpos.findIndex(
                    (cu: any) =>
                      cu == obj[i].installations_articles[j].cuerpoLegal
                  );

                  if(index == -1){
                    total_cuerpos.push(obj[i].installations_articles[j].cuerpoLegal);
                  }

                  for (var v = 0; v < obj[i].installations_articles[j].evaluations.length; v++) {
                      if(obj[i].installations_articles[j].evaluations[v].estado){
                        switch (this.getCategoryStatus(obj[i].installations_articles[j].evaluations[v].estado)) {
                          case 'CUMPLE':
                            cumple ++;
                            cuerpo_cumple ++;
                            break;
      
                          case 'NO CUMPLE':
                              nocumple ++;
                              cuerpo_nocumple ++;
                            break;
                          
                          case 'CUMPLE PARCIALMENTE':
                            parcial ++;
                            cuerpo_parcial ++;
                            break;
                        
                          default:
                            break;
                        }
                        
                      }
                    }
                }

                
              if(total_articulos.length > 0){
                this.installations_articles.push(obj[i].installations_articles[j]);
              }
              }
              obj[i].total_articulos = total_articulos.length;
              obj[i].total_cuerpos = total_cuerpos.length;
              let avance: any = total_articulos.length > 0 ? ((((cuerpo_cumple * 100) + (cuerpo_nocumple * 0) + (cuerpo_parcial * 50)) * 100) / (total_articulos.length * 100)) : 0;
              obj[i].avance = round(avance, 0);
              
              if(total_articulos.length > 0){
                avance_total += obj[i].avance > 0 ? obj[i].avance : 0;
                lista.push(obj[i]);
                
                if(cuerpo_cumple > 0 || cuerpo_parcial > 0 || cuerpo_nocumple > 0){
                  if(cuerpo_cumple == total_articulos.length){
                    cumple_norma ++;
                  }else if(cuerpo_nocumple == total_articulos.length){
                    nocumple_norma ++;
                  }else{
                    parcial_norma ++;
                  }
                }
              }
            }

          }

          let total: any = lista.length;
          this.installations_data = lista;

          this.cumple = cumple;
          this.nocumple = nocumple;
          this.parcial = parcial;
          this.cuerpo_cumple = cumple_norma;
          this.cuerpo_nocumple = nocumple_norma;
          this.cuerpo_parcial = parcial_norma;
          
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
          //console.log('lista_data', this.installations_group);
          this.avance_evaluacion = lista.length > 0 ? round((avance_total / total), 0) : 0;
          
          this._simplePieChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._simplePieChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
      },
      (error: any) => {
      });
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
 * Projects Overview
 */
/*
  setprojectvalue(value: any) {
    if (value == 'all') {
      this.OverviewChart.series = [{
        name: 'Number of Projects',
        type: 'bar',
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
      }]
    }
    if (value == '1M') {
      this.OverviewChart.series = [{
        name: 'Number of Projects',
        type: 'bar',
        data: [24, 75, 16, 98, 19, 41, 52, 34, 28, 52, 63, 67]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [99.25, 28.58, 98.74, 12.87, 107.54, 94.03, 11.24, 48.57, 22.57, 42.36, 88.51, 36.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [28, 22, 17, 27, 21, 11, 5, 9, 17, 29, 12, 15]
      }]
    }
    if (value == '6M') {
      this.OverviewChart.series = [{
        name: 'Number of Projects',
        type: 'bar',
        data: [34, 75, 66, 78, 29, 41, 32, 44, 58, 52, 43, 77]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [109.25, 48.58, 38.74, 57.87, 77.54, 84.03, 31.24, 18.57, 92.57, 42.36, 48.51, 56.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [12, 22, 17, 27, 1, 51, 5, 9, 7, 29, 12, 35]
      }]
    }
    if (value == '1Y') {
      this.OverviewChart.series = [{
        name: 'Number of Projects',
        type: 'bar',
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
      }]
    }
  }

  private _OverviewChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.OverviewChart = {
      series: [{
        name: 'Number of Projects',
        type: 'bar',
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
      }],
      chart: {
        height: 374,
        type: 'line',
        toolbar: {
          show: false,
        }
      },
      stroke: {
        curve: 'smooth',
        dashArray: [0, 3, 0],
        width: [0, 1, 0],
      },
      fill: {
        opacity: [1, 0.1, 1]
      },
      markers: {
        size: [0, 4, 0],
        strokeWidth: 2,
        hover: {
          size: 4,
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        }
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: true,
          }
        },
        yaxis: {
          lines: {
            show: false,
          }
        },
        padding: {
          top: 0,
          right: -2,
          bottom: 15,
          left: 10
        },
      },
      legend: {
        show: true,
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: -5,
        markers: {
          width: 9,
          height: 9,
          radius: 6,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '30%',
          barHeight: '70%'
        }
      },
      colors: colors,
      tooltip: {
        shared: true,
        y: [{
          formatter: function (y: any) {
            if (typeof y !== "undefined") {
              return y.toFixed(0);
            }
            return y;

          }
        }, {
          formatter: function (y: any) {
            if (typeof y !== "undefined") {
              return "$" + y.toFixed(2) + "k";
            }
            return y;

          }
        }, {
          formatter: function (y: any) {
            if (typeof y !== "undefined") {
              return y.toFixed(0);
            }
            return y;

          }
        }]
      }
    };
  }*/

  /**
 *  Status7
 *//*
  setstatusvalue(value: any) {
    if (value == 'all') {
      this.status7.series = [125, 42, 58, 89]
    }
    if (value == '7') {
      this.status7.series = [25, 52, 158, 99]
    }
    if (value == '30') {
      this.status7.series = [35, 22, 98, 99]
    }
    if (value == '90') {
      this.status7.series = [105, 32, 68, 79]
    }
  }

  private _status7(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.status7 = {
      series: [125, 42, 58, 89],
      labels: ["Completed", "In Progress", "Yet to Start", "Cancelled"],
      chart: {
        type: "donut",
        height: 230,
      },
      plotOptions: {
        pie: {
          offsetX: 0,
          offsetY: 0,
          donut: {
            size: "90%",
            labels: {
              show: false,
            }
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      stroke: {
        lineCap: "round",
        width: 0
      },
      colors: colors
    };
  }*/

   /**
 * Simple Donut Chart
 *//*
   private _simpleDonutChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChart = {
        series: [78.56, 105.02, 42.89],
        labels: ["Desktop", "Mobile", "Tablet"],
        chart: {
            type: "donut",
            height: 219,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "76%",
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
            position: 'bottom',
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 0,
            markers: {
                width: 20,
                height: 6,
                radius: 2,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 0
            },
        },
        stroke: {
            width: 0
        },
        yaxis: {
            labels: {
                formatter: function (value: any) {
                    return value + "k" + " Users";
                }
            },
            tickAmount: 4,
            min: 0
        },
        colors: colors
    };
}
*/
/**
 * Sale Location Map
 */
options = {
    layers: [
        tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
            id: "mapbox/light-v9",
            tileSize: 512,
            zoomOffset: -1,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        })
    ],
    zoom: 1.1,
    center: latLng(28, 1.5)
};
layers = [
    circle([41.9, 12.45], { color: "#435fe3", opacity: 0.5, weight: 10, fillColor: "#435fe3", fillOpacity: 1, radius: 400000, }),
    circle([12.05, -61.75], { color: "#435fe3", opacity: 0.5, weight: 10, fillColor: "#435fe3", fillOpacity: 1, radius: 400000, }),
    circle([1.3, 103.8], { color: "#435fe3", opacity: 0.5, weight: 10, fillColor: "#435fe3", fillOpacity: 1, radius: 400000, }),
  ];


  /**
   * Fetches the data
   */
  private fetchData() {
    this.statData = statData;
    this.ActiveProjects = ActiveProjects;
    this.MyTask = MyTask;
    this.TeamMembers = TeamMembers;
  }

/**Graficas */  
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

  getCategories(){
    if(!this.tipo){
      return ['Cumple','Cumple Parcial','No Cumple','No evaluado'];
    }else{
      switch (this.tipo) {
        case 'Cumple':
            if(this.criticidad == 'Todos'){
              return [/*'Cumple', */'Alta', 'Media', 'Baja', 'No Especificado'];
            }else{
              return ['Cumple'];
            }
          break;
        case 'Cumple Parcial':
            if(this.criticidad == 'Todos'){
              return [/*'Cumple Parcial', */'Alta', 'Media', 'Baja', 'No Especificado'];
            }else{
              return ['Cumple Parcial'];
            }
            break;
        
        case 'No Cumple':
              if(this.criticidad == 'Todos'){
                return [/*'No Cumple', */'Alta', 'Media', 'Baja', 'No Especificado'];
              }else{
                return ['No Cumple'];
              }
              break;
              
        case 'No Evaluado':
          if(this.criticidad == 'Todos'){
            return [/*'No Evaluado', */'Alta', 'Media', 'Baja', 'No Especificado'];
          }else{
            return ['No Evaluado'];
          }
          break;
      
        default:
          return ['Cumple','Cumple Parcial','No Cumple','No evaluado'];
          break;
      }
    }
  }
  
  getCategories2(){
    if(!this.tipo){
      return ['Cumple','Cumple Parcial','No Cumple','No evaluado'];
    }else{
      switch (this.tipo) {
        case 'Cumple':
            if(this.criticidad == 'Todos'){
              return [/*'Cumple', */'Alta', 'Media', 'Baja', 'No especificado'];
            }else{
              return ['Cumple'];
            }
          break;
        case 'Cumple Parcial':
            if(this.criticidad == 'Todos'){
              return [/*'Cumple Parcial', */'Alta', 'Media', 'Baja', 'No especificado'];
            }else{
              return ['Cumple Parcial'];
            }
            break;
        
        case 'No Cumple':
              if(this.criticidad == 'Todos'){
                return [/*'No Cumple', */'Alta', 'Media', 'Baja', 'No especificado'];
              }else{
                return ['No Cumple'];
              }
              break;
              
        case 'No Evaluado':
          if(this.criticidad == 'Todos'){
            return [/*'No Evaluado', */'Alta', 'Media', 'Baja', 'No especificado'];
          }else{
            return ['No Evaluado'];
          }
          break;
      
        default:
          return ['Cumple','Cumple Parcial','No Cumple','No evaluado'];
          break;
      }
    }
  }
  
  getSeriesTipo(cumple?: any, cumple_parcial?: any, no_cumple?: any, no_evaluados?: any, alta?: any, media?: any, baja?: any, otros?: any){
    let series: any = [];

    if(!this.tipo){
        series =  [this.getDataDashboard(cumple),this.getDataDashboard(cumple_parcial),this.getDataDashboard(no_cumple),this.getDataDashboard(no_evaluados)];
      
    }else{
      switch (this.tipo) {
        case 'Cumple':
            if(this.criticidad == 'Todos'){
              series = [/*this.getDataDashboard(cumple), */this.getDataDashboard(alta),this.getDataDashboard(media),this.getDataDashboard(baja),this.getDataDashboard(otros)];
            }else{
              series =  [this.getDataDashboard(cumple)];
            }
          break;
        case 'Cumple Parcial':
          if(this.criticidad == 'Todos'){
            series = [/*this.getDataDashboard(cumple_parcial), */this.getDataDashboard(alta),this.getDataDashboard(media),this.getDataDashboard(baja),this.getDataDashboard(otros)];
          }else{
            series = [this.getDataDashboard(cumple_parcial)];
          }
          break;
          
        case 'No Cumple':
          if(this.criticidad == 'Todos'){
            series = [/*this.getDataDashboard(no_cumple), */this.getDataDashboard(alta),this.getDataDashboard(media),this.getDataDashboard(baja),this.getDataDashboard(otros)];
          }else{
            series = [this.getDataDashboard(no_cumple)];
          }
          break;
          
          case 'No Evaluado':
            if(this.criticidad == 'Todos'){
              series = [/*this.getDataDashboard(no_evaluados), */this.getDataDashboard(alta),this.getDataDashboard(media),this.getDataDashboard(baja),this.getDataDashboard(otros)];
            }else{
              series = [this.getDataDashboard(no_evaluados)];
            }
            break;
      
        default:
            series = [this.getDataDashboard(cumple),this.getDataDashboard(cumple_parcial),this.getDataDashboard(no_cumple),this.getDataDashboard(no_evaluados)];
          break;
      }
    }

    return series;
  }

  getDataExist(series: any){
    return series.some((s: any) => s > 0);
  }

  getColorsTipo(){
    let colors: any = [];

    if(!this.tipo){
        colors =  '["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]';
    }else{
      switch (this.tipo) {
        case 'Cumple':
          if(this.criticidad == 'Todos'){
            colors =  '["--vz-danger", "--vz-warning", "--vz-success","--vz-info", "--vz-gray"]';
          }else{
            colors =  '["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]';
          }
          break;
          case 'Cumple Parcial':  
              if(this.criticidad == 'Todos'){
                colors =  '["--vz-danger", "--vz-warning", "--vz-success","--vz-info", "--vz-gray"]';
              }else{
              colors =  '["--vz-warning", "--vz-danger","--vz-gray"]';
              }
            break;
            
          case 'No Cumple':  
          if(this.criticidad == 'Todos'){
            colors =  '["--vz-danger", "--vz-warning", "--vz-success","--vz-info", "--vz-gray"]';
          }else{
          colors =  '["--vz-danger","--vz-gray"]';
          }
        break;
                    
        case 'No Evaluado':  
        if(this.criticidad == 'Todos'){
          colors =  '["--vz-danger", "--vz-warning", "--vz-success","--vz-info", "--vz-gray"]';
        }else{
        colors =  '["--vz-gray"]';
        }
      break;
      
        default:
            colors = '["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]';
          
          break;
      }
    }

    return colors;
  }

  getColorsCriticidad(criticidad?: any, atributo?: any){
    let colors: any = [];

    if(!criticidad){
      switch (atributo) {
        case 'permiso':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-gray"]';
          break;
        
        case 'reporte':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-gray"]';
          break;
        
        case 'monitoreo':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-gray"]';
          break;
      
        default:        
          colors = '["--vz-success","--vz-warning","--vz-danger","--vz-gray"]';
          break;
      }
    }else{
      switch (criticidad) {
          case 'Alta':
            colors = '["--vz-danger"]';
          break;
          case 'Media':
              colors = '["--vz-warning"]';
            break;
            
          case 'Baja':
            colors = '["--vz-success"]';
          break;
          
          case 'No especificado':
            colors = '["--vz-info"]';
          break;
      
        default:
          colors = '["--vz-danger", "--vz-warning", "--vz-success", "--vz-gray"]';
          break;
      }
    }

    return colors;
  }

  getColorsCriticidadCuerpo(criticidad?: any, atributo?: any){
    let colors: any = [];

    if(!criticidad){
      switch (atributo) {
        case 'permiso':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-gray"]';
          break;
        
        case 'reporte':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-gray"]';
          break;
        
        case 'monitoreo':        
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-gray"]';
          break;
      
        default:        
          colors = '["--vz-success","--vz-warning","--vz-danger","--vz-gray"]';
          break;
      }
    }else{
      switch (criticidad) {
          case 'Alta':
            colors = '["--vz-danger"]';
          break;
          case 'Media':
              colors = '["--vz-warning"]';
            break;
            
          case 'Baja':
            colors = '["--vz-success"]';
          break;
          
          case 'No especificado':
            colors = '["--vz-info"]';
          break;
      
        default:
          colors = '["--vz-danger", "--vz-warning", "--vz-success", "--vz-gray"]';
          break;
      }
    }

    return colors;
  }
  
  getColorsAtributosCriticidad(criticidad?: any, atributo?: any){
    let colors: any = [];

    if(!criticidad){
      switch (atributo) {
        case 'permiso':
          
          if(this.tipo){
            switch (this.tipo) {
              case 'Cumple':
                colors = '["--vz-success","--vz-success"]'; 
                break;
                case 'Cumple Parcial':
                  colors = '["--vz-warning","--vz-warning"]'; 
                  break;
              case 'No Cumple':
              colors = '["--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger"]'; 
              break;
              case 'No Evaluado':
                colors = '["--vz-gray"]'; 
                break;
          
            default:
              break;
          }
          }else{
            colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-danger","--vz-gray"]';
          }
          break;
        
        case 'reporte':        
          
          if(this.tipo){
            switch (this.tipo) {
              case 'Cumple':
                colors = '["--vz-success","--vz-success"]'; 
                break;
                case 'Cumple Parcial':
                  colors = '["--vz-warning","--vz-warning","--vz-warning"]'; 
                  break;
              case 'No Cumple':
              colors = '["--vz-danger"]'; 
              break;
              case 'No Evaluado':
                colors = '["--vz-gray"]'; 
                break;
          
            default:
              break;
          }
          }else{
            colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-gray"]';
          }
          break;
        
        case 'monitoreo':        
        
        if(this.tipo){
          switch (this.tipo) {
            case 'Cumple':
              colors = '["--vz-success","--vz-success"]'; 
              break;
              case 'Cumple Parcial':
                colors = '["--vz-warning","--vz-warning","--vz-warning"]'; 
                break;
            case 'No Cumple':
            colors = '["--vz-danger","--vz-danger"]'; 
            break;
            case 'No Evaluado':
              colors = '["--vz-gray"]'; 
              break;
        
          default:
            break;
        }
        }else{
          colors = '["--vz-success","--vz-success","--vz-warning","--vz-warning","--vz-warning","--vz-danger","--vz-danger","--vz-gray"]';
        }
          break;
      
        default:        
          colors = '["--vz-info"]';
          break;
      }
    }else{
      switch (criticidad) {
          case 'Alta':
            colors = '["--vz-danger"]';
          break;
          case 'Media':
              colors = '["--vz-warning"]';
            break;
            
          case 'Baja':
            colors = '["--vz-success"]';
          break;
          
          case 'No especificado':
            colors = '["--vz-info"]';
          break;
      
        default:
          colors = '["--vz-danger", "--vz-warning", "--vz-success", "--vz-info"]';
          break;
      }
    }

    return colors;
  }

  
  countCriticidadCuerposEstado(estado?: any, criticidad?: any){
    
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')
    );
    let articles_group: any = [];
    let alta: number = 0;
    let media: number = 0;
    let baja: number = 0;
    let otros: number = 0;
    let gestionar: number = 0;
    let no_gestionar: number = 0;
    let gestionar_alta: number = 0;
    let no_gestionar_alta: number = 0;
    let gestionar_media: number = 0;
    let no_gestionar_media: number = 0;
    let gestionar_baja: number = 0;
    let no_gestionar_baja: number = 0;
    let gestionar_otros: number = 0;
    let no_gestionar_otros: number = 0;
    
          filter.forEach((x: any) => {
            
            const index = articles_group.findIndex(
              (co: any) =>
                co == x.normaId
            );

            if(index == -1){
              articles_group.push(x.normaId);
              const estado_cuerpo: any = this.validateIdCuerpo(x.normaId);
                const existe_alta = this.articulos.findIndex(
                  (co: any) =>
                    co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.construccion == true
                );

                if(existe_alta != -1){
                  alta ++;
                  
                    switch (estado_cuerpo) {
                      case 1:
                        gestionar_alta ++;
                        break;
                      case 2:
                        no_gestionar_alta ++;
                        break;
                    
                      default:
                        break;
                    }
                }

                  const existe_media = this.articulos.findIndex(
                    (co: any) =>
                      co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.operacion == true
                  );
                  
                  if(existe_media != -1){
                    media ++;
                    
                    switch (estado_cuerpo) {
                      case 1:
                        gestionar_media ++;
                        break;
                      case 2:
                        no_gestionar_media ++;
                        break;
                    
                      default:
                        break;
                    }
                  }
                    
                    const existe_baja = this.articulos.findIndex(
                      (co: any) =>
                        co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.cierre == true
                    );

                    if(existe_baja != -1){
                      baja ++;
                                       
                    switch (estado_cuerpo) {
                      case 1:
                        gestionar_baja ++;
                        break;
                      case 2:
                        no_gestionar_baja ++;
                        break;
                    
                      default:
                        break;
                    }
                    }
                    
                    if(existe_alta == -1 && existe_media == -1 && existe_baja == -1){
                      otros ++;
                  
                      switch (estado_cuerpo) {
                        case 1:
                          gestionar_otros ++;
                          break;
                        case 2:
                          no_gestionar_otros ++;
                          break;
                      
                        default:
                          break;
                      }
                    }
                
            }
          })

          let result: number = 0;

          switch (criticidad) {
            case 'Alta':
              result = alta;
                if(estado == 1){
                  gestionar = gestionar_alta;
                }else{
                  no_gestionar = no_gestionar_alta;
                }
              break;
            
            case 'Media':
                result = media;
                if(estado == 1){
                  gestionar = gestionar_media;
                }else{
                  no_gestionar = no_gestionar_media;
                }
              break;

            case 'Baja':
                result = baja;
                if(estado == 1){
                  gestionar = gestionar_baja;
                }else{
                  no_gestionar = no_gestionar_baja;
                }
              break;
          
            default:
              result = otros;
              if(estado == 1){
                gestionar = gestionar_otros;
              }else{
                no_gestionar = no_gestionar_otros;
              }
              break;
          }
      return estado == 1 ? gestionar : no_gestionar;
  }

  countCriticidadArticuloEstado(estado?: any, criticidad?: any){
    
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')
    );
    let articles_group: any = [];
    let alta: number = 0;
    let media: number = 0;
    let baja: number = 0;
    let otros: number = 0;
    let gestionar: number = 0;
    let no_gestionar: number = 0;
    let gestionar_alta: number = 0;
    let no_gestionar_alta: number = 0;
    let gestionar_media: number = 0;
    let no_gestionar_media: number = 0;
    let gestionar_baja: number = 0;
    let no_gestionar_baja: number = 0;
    let gestionar_otros: number = 0;
    let no_gestionar_otros: number = 0;
    
          filter.forEach((x: any) => {
            
            const index = articles_group.findIndex(
              (co: any) =>
                co == x.articuloId
            );

            if(index == -1){
              articles_group.push(x.articuloId);
              
                const existe_alta = this.articulos.findIndex(
                  (co: any) =>
                    co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.construccion == true
                );

                if(existe_alta != -1){
                  alta ++;
                  
                    switch (x.estado) {
                      case '1':
                        gestionar_alta ++;
                        break;
                      case '2':
                        no_gestionar_alta ++;
                        break;
                    
                      default:
                        break;
                    }
                }

                  const existe_media = this.articulos.findIndex(
                    (co: any) =>
                      co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.operacion == true
                  );
                  
                  if(existe_media != -1){
                    media ++;
                    
                    switch (x.estado) {
                      case '1':
                        gestionar_media ++;
                        break;
                      case '2':
                        no_gestionar_media ++;
                        break;
                    
                      default:
                        break;
                    }
                  }
                    
                    const existe_baja = this.articulos.findIndex(
                      (co: any) =>
                        co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.cierre == true
                    );

                    if(existe_baja != -1){
                      baja ++;
                                       
                    switch (x.estado) {
                      case '1':
                        gestionar_baja ++;
                        break;
                      case '2':
                        no_gestionar_baja ++;
                        break;
                    
                      default:
                        break;
                    }
                    }
                    
                    if(existe_alta == -1 && existe_media == -1 && existe_baja == -1){
                      otros ++;
                  
                      switch (x.estado) {
                        case '1':
                          gestionar_otros ++;
                          break;
                        case '2':
                          no_gestionar_otros ++;
                          break;
                      
                        default:
                          break;
                      }
                    }
                
            }
          })

          let result: number = 0;

          switch (criticidad) {
            case 'Alta':
              result = alta;
                if(estado == 1){
                  gestionar = gestionar_alta;
                }else{
                  no_gestionar = no_gestionar_alta;
                }
              break;
            
            case 'Media':
                result = media;
                if(estado == 1){
                  gestionar = gestionar_media;
                }else{
                  no_gestionar = no_gestionar_media;
                }
              break;

            case 'Baja':
                result = baja;
                if(estado == 1){
                  gestionar = gestionar_baja;
                }else{
                  no_gestionar = no_gestionar_baja;
                }
              break;
          
            default:
              result = otros;
              if(estado == 1){
                gestionar = gestionar_otros;
              }else{
                no_gestionar = no_gestionar_otros;
              }
              break;
          }
    
      return estado == 1 ? gestionar : no_gestionar;
  }

  countCriticidadAtributoEstado(estado?: any, atributo?: any, criticidad?: any){
    
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')
    );
    let articles_group: any = [];
    let alta: number = 0;
    let media: number = 0;
    let baja: number = 0;
    let otros: number = 0;
    let gestionar: number = 0;
    let no_gestionar: number = 0;
    let gestionar_alta: number = 0;
    let no_gestionar_alta: number = 0;
    let gestionar_media: number = 0;
    let no_gestionar_media: number = 0;
    let gestionar_baja: number = 0;
    let no_gestionar_baja: number = 0;
    let gestionar_otros: number = 0;
    let no_gestionar_otros: number = 0;
    
          filter.forEach((x: any) => {
            
            const index = articles_group.findIndex(
              (co: any) =>
                co == x.articuloId
            );

            if(index == -1){
              articles_group.push(x.articuloId);
              
                const existe_alta = this.articulos.findIndex(
                  (co: any) =>
                    co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.construccion == true && co.articuloTipo == (atributo == 'otros' ? null : atributo)
                );

                if(existe_alta != -1){
                  alta ++;
                  
                    switch (x.estado) {
                      case '1':
                        gestionar_alta ++;
                        break;
                      case '2':
                        no_gestionar_alta ++;
                        break;
                    
                      default:
                        break;
                    }
                }

                  const existe_media = this.articulos.findIndex(
                    (co: any) =>
                      co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.operacion == true && co.articuloTipo == (atributo == 'otros' ? null : atributo)
                  );
                  
                  if(existe_media != -1){
                    media ++;
                    
                    switch (x.estado) {
                      case '1':
                        gestionar_media ++;
                        break;
                      case '2':
                        no_gestionar_media ++;
                        break;
                    
                      default:
                        break;
                    }
                  }
                    
                    const existe_baja = this.articulos.findIndex(
                      (co: any) =>
                        co.articuloId == x.articuloId && co.proyectoId == this.project_id && co.cierre == true && co.articuloTipo == (atributo == 'otros' ? null : atributo)
                    );

                    if(existe_baja != -1){
                      baja ++;
                                       
                    switch (x.estado) {
                      case '1':
                        gestionar_baja ++;
                        break;
                      case '2':
                        no_gestionar_baja ++;
                        break;
                    
                      default:
                        break;
                    }
                    }
                    
                    if(existe_alta == -1 && existe_media == -1 && existe_baja == -1){
                      otros ++;
                  
                      switch (x.estado) {
                        case '1':
                          gestionar_otros ++;
                          break;
                        case '2':
                          no_gestionar_otros ++;
                          break;
                      
                        default:
                          break;
                      }
                    }
                
            }
          })

          let result: number = 0;

          switch (criticidad) {
            case 'Alta':
              result = alta;
                if(estado == 1){
                  gestionar = gestionar_alta;
                }else{
                  no_gestionar = no_gestionar_alta;
                }
              break;
            
            case 'Media':
                result = media;
                if(estado == 1){
                  gestionar = gestionar_media;
                }else{
                  no_gestionar = no_gestionar_media;
                }
              break;

            case 'Baja':
                result = baja;
                if(estado == 1){
                  gestionar = gestionar_baja;
                }else{
                  no_gestionar = no_gestionar_baja;
                }
              break;
          
            default:
              result = otros;
              if(estado == 1){
                gestionar = gestionar_otros;
              }else{
                no_gestionar = no_gestionar_otros;
              }
              break;
          }
    
      return estado == 1 ? gestionar : no_gestionar;
  }

  countElementos(){
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')
    );
    let installation_group: any = [];
          filter.forEach((x: any) => {
            
            const index = installation_group.findIndex(
              (co: any) =>
                co == x.instalacionId
            );

            if(index == -1){
              installation_group.push(x.instalacionId);
              
            }
          })

    return installation_group.length;
  }

  /**
   * Basic Bar Chart Cuerpos
   */
  private _basicBarChartCuerpos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.basicBarChartCuerpos = {
      series: [{
        data: [this.cuerpo_ambiente, this.cuerpo_sso, this.cuerpo_energia],
      }, ],
      chart: {
        height: 170,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false
      },
      colors: colors,
      grid: {
        borderColor: "#f1f1f1",
      },
      xaxis: {
        categories: [
          "Medio Ambiente",
          "SSO",
          "Energía"
        ],
      },
    };
  }

  /**
   * Basic Bar Chart Articulos
   */
  private _basicBarChartArticulos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.basicBarChartArticulos = {
      series: [{
        data: [this.ambiente, this.sso, this.energia],
      }, ],
      chart: {
        height: 170,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false
      },
      colors: colors,
      grid: {
        borderColor: "#f1f1f1",
      },
      xaxis: {
        categories: [
          "Medio Ambiente",
          "SSO",
          "Energía"
        ],
      },
    };
  }

   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartCuerpos(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartCuerpos = {
      series: this.getSeriesTipo('cuerpos_cumple','cuerpos_cumple_parcial','cuerpos_no_cumple','cuerpos_no_evaluados', 'cuerpos_alta', 'cuerpos_media', 'cuerpos_baja', 'cuerpos_otros'),
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: this.getCategories(),//["Cumple","Cumple Parcial","No Cumple", "No evaluado"],
      colors: colors,
    };
  }

   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartArticulos(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartArticulos = {
      series: this.getSeriesTipo('articulos_cumple','articulos_cumple_parcial','articulos_no_cumple','articulos_no_evaluados', 'articulos_alta', 'articulos_media', 'articulos_baja', 'articulos_otros'),
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "76%",
          },
        },
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: /*['Cumple','Cumple Parcial','No Cumple','No evaluado'],*/this.getCategories(),
      colors: colors,
    };
  }

  /**
 * Simple Donut Chart
 */
  private _simpleDonutChartInstancias(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartInstancias = {
      series: this.getSeriesTipo('instancias_cumple','instancias_cumple_parcial','instancias_no_cumple','instancias_no_evaluadas', 'alta', 'media', 'baja', 'sin_criticidad'),
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: /*['Cumple','Cumple Parcial','No Cumple','No evaluado'],*/this.getCategories(),
      colors: colors,
    };
  }

   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartMonitoreos(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartMonitoreos = {
      series: this.getSeriesTipo('monitoreos_gestionar','monitoreos_definir','monitoreos_alta','monitoreos_media','monitoreos_baja','monitoreos_otros'),//[this.getDataDashboard('monitoreos_gestionar'), this.getDataDashboard('monitoreos_definir')],//this.countAtributoEstado('1','monitoreo'), this.countAtributoEstado('2', 'monitoreo')
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: this.getCategories(),//["Gestionar","Por definir"],
      colors: colors,
    };
  }

   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartReportes(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartReportes = {
      series: this.getSeriesTipo('reportes_gestionar','reportes_definir','reportes_alta','reportes_media','reportes_baja','reportes_otros'),//[this.getDataDashboard('reportes_gestionar'), this.getDataDashboard('reportes_definir')],//this.countAtributoEstado('1','reporte'), this.countAtributoEstado('2', 'reporte')
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: this.getCategories(),//["Gestionar","Por definir"],
      colors: colors,
    };
  }

  
   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartPermisos(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartPermisos = {
      series: this.getSeriesTipo('permisos_gestionar','permisos_definir','permisos_alta','permisos_media','permisos_baja','permisos_otros'),//[this.getDataDashboard('permisos_gestionar'), this.getDataDashboard('permisos_definir')],//this.countAtributoEstado('1','permiso'), this.countAtributoEstado('2', 'permiso')
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: this.getCategories(),//["Gestionar","Por definir"],
      colors: colors,
    };
  }

  
   /**
 * Simple Donut Chart
 */
   private _simpleDonutChartOtros(colors:any) {
    colors = this.getColorsTipo();
    colors = this.getChartColorsArray(colors);
    this.simpleDonutChartOtros = {
      series: this.getSeriesTipo('otros_cumple','otros_cumple_parcial','otros_no_cumple', 'otros_no_evaluados', 'otros_alta','otros_media','otros_baja','otros_otros'),
      chart: {
        height: 300,
        type: "donut",
      },
      legend: {
        position: "bottom",
      },
      dataLabels: {
        dropShadow: {
          enabled: false,
        },
      },
      labels: /*['Cumple','Cumple Parcial','No Cumple','No evaluado'],*/this.getCategories2(),
      colors: colors,
    };
  }

     /**
 * Simple Donut Chart
 */
     private _simpleDonutChartCuerposAmbito(colors:any) {
      colors = this.getChartColorsArray(colors);
      this.simpleDonutChartCuerposAmbito = {
        series: [{
          data: [this.getDataDashboard('cuerpo_ma'),this.getDataDashboard('cuerpo_sst'),this.getDataDashboard('cuerpo_energia'),this.getDataDashboard('cuerpo_general'),this.getDataDashboard('cuerpo_laboral')]//this.cuerpo_ambiente, this.cuerpo_energia, this.cuerpo_sso
        }],
        chart: {
          height: 300,
          //type: "donut",
          type: "bar",
          stacked: false,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
        },
      plotOptions: {
        bar: {
          //columnWidth: '45%',
          //distributed: true,
          dataLabels: {
              position: "top", // top, center, bottom
          },
        }
      },
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
          /*formatter: function (val:any) {
              return val + "%";
          },*/
          offsetY: 160,
          style: {
              fontSize: "12px",
              colors: ["#adb5bd"],
          },
        },
        yaxis: {
          show: false,
          showAlways: false,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                show: false,
                formatter: function (val:any) {
                    return val;// + "%";
                },
            },
        },
        labels: ["MA","SST","ENERGIA","GENERAL","LABORAL"],
        colors: colors,
      };
    }
  
  
     /**
   * Simple Donut Chart
   */
     private _simpleDonutChartArticulosAmbito(colors:any) {
      colors = this.getChartColorsArray(colors);
      this.simpleDonutChartArticulosAmbito = {
        series: [{
          data: [this.getDataDashboard('ma'),this.getDataDashboard('sst'),this.getDataDashboard('energia'),this.getDataDashboard('general'),this.getDataDashboard('laboral')]//this.ambiente, this.energia, this.sso
        }],
        chart: {
          height: 300,
          //type: "donut",
          type: "bar",
          stacked: false,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
        },
        plotOptions: {
          bar: {
            //columnWidth: '45%',
            //distributed: true,
            dataLabels: {
              position: "top", // top, center, bottom
            }
          }
        },
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
          /*formatter: function (val:any) {
              return val + "%";
          },*/
          offsetY: 160,
          style: {
              fontSize: "12px",
              colors: ["#adb5bd"],
          },
        },
        yaxis: {
          show: false,
          showAlways: false,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                show: false,
                formatter: function (val:any) {
                    return val; //+ "%";
                },
            },
        },
        labels: ["MA","SST","ENERGIA","GENERAL","LABORAL"],
        colors: colors,
      };
    }
  
    /**
   * Simple Donut Chart
   */
    private _simpleDonutChartInstanciasAmbito(colors:any) {
      colors = this.getChartColorsArray(colors);
      this.simpleDonutChartInstanciasAmbito = {
        series: [{
          data: [this.getDataDashboard('instancias_ma'),this.getDataDashboard('instancias_sst'), this.getDataDashboard('instancias_energia'), this.getDataDashboard('instancias_general'), this.getDataDashboard('instancias_laboral')]//this.ambiente * this.countElementos(), this.energia * this.countElementos(), this.sso * this.countElementos()
        }],
        chart: {
          height: 300,
          //type: "donut",
          type: "bar",
          stacked: false,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
        },
        plotOptions: {
          bar: {
            //columnWidth: '45%',
            //distributed: true,
            dataLabels: {
              position: "top", // top, center, bottom
            },
          }
        },
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: true,
          /*formatter: function (val:any) {
              return val + "%";
          },*/
          offsetY: 160,
          style: {
              fontSize: "12px",
              colors: ["#adb5bd"],
          },
        },
        yaxis: {
          show: false,
          showAlways: false,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                show: false,
                formatter: function (val:any) {
                    return val;// + "%";
                },
            },
        },
        labels: ["MA","SST","ENERGIA","GENERAL","LABORAL"],
        colors: colors,
      };
    }

    /**
 * Stacked 100 Bar Charts
 */
   private _stacked100BarChart(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.stacked100BarChart = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadCuerposEstado('1','Alta'), this.countCriticidadCuerposEstado('2','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadCuerposEstado('1','Media'), this.countCriticidadCuerposEstado('2','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadCuerposEstado('1','Baja'), this.countCriticidadCuerposEstado('2','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadCuerposEstado('1'), this.countCriticidadCuerposEstado('2')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadCuerposEstado('1','Alta'), this.countCriticidadCuerposEstado('2','Alta')],
      }
      ],
      seriesMedia: [
      {
        name: "Media",
        data: [this.countCriticidadCuerposEstado('1','Media'), this.countCriticidadCuerposEstado('2','Media')],
      }
      ],
      seriesBaja: [{
        name: "Baja",
        data: [this.countCriticidadCuerposEstado('1','Baja'), this.countCriticidadCuerposEstado('2','Baja')],
      }
      ],
      seriesOtros: [{
        name: "No especificado",
        data: [this.countCriticidadCuerposEstado('1'), this.countCriticidadCuerposEstado('2')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

   }

   /**
 * Stacked 100 Bar Charts
 */
   private _stacked100BarChartArticulos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.stacked100BarChartArticulos = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadArticuloEstado('1','Alta'), this.countCriticidadArticuloEstado('2','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadArticuloEstado('1','Media'), this.countCriticidadArticuloEstado('2','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadArticuloEstado('1','Baja'), this.countCriticidadArticuloEstado('2','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadArticuloEstado('1'), this.countCriticidadArticuloEstado('2')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadArticuloEstado('1','Alta'), this.countCriticidadArticuloEstado('2','Alta')],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.countCriticidadArticuloEstado('1','Media'), this.countCriticidadArticuloEstado('2','Media')],
      }
      ],
      seriesBaja: [{
          name: "Baja",
          data: [this.countCriticidadArticuloEstado('1','Baja'), this.countCriticidadArticuloEstado('2','Baja')],
      }
      ],
      seriesOtros: [{
        name: "No especificado",
        data: [this.countCriticidadArticuloEstado('1'), this.countCriticidadArticuloEstado('2')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          distributed: true,
          dataLabels: {
              position: 'top',
          },
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };
   }
  
   /**
 * Stacked 100 Bar Charts
 */
   private _stacked100BarChartInstancias(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.stacked100BarChartInstancias = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadArticuloEstado('1','Alta') * this.countElementos(), this.countCriticidadArticuloEstado('2','Alta') * this.countElementos()],
      },
      {
        name: "Media",
        data: [this.countCriticidadArticuloEstado('1','Media') * this.countElementos(), this.countCriticidadArticuloEstado('2','Media') * this.countElementos()],
      },
      {
        name: "Baja",
        data: [this.countCriticidadArticuloEstado('1','Baja') * this.countElementos(), this.countCriticidadArticuloEstado('2','Baja') * this.countElementos()],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadArticuloEstado('1') * this.countElementos(), this.countCriticidadArticuloEstado('2') * this.countElementos()],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadArticuloEstado('1','Alta') * this.countElementos(), this.countCriticidadArticuloEstado('2','Alta') * this.countElementos()],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.countCriticidadArticuloEstado('1','Media') * this.countElementos(), this.countCriticidadArticuloEstado('2','Media') * this.countElementos()],
      }
      ],
      seriesBaja: [
      {
        name: "Baja",
        data: [this.countCriticidadArticuloEstado('1','Baja') * this.countElementos(), this.countCriticidadArticuloEstado('2','Baja') * this.countElementos()],
      }
      ],
      seriesOtros: [{
        name: "No especificado",
        data: [this.countCriticidadArticuloEstado('1') * this.countElementos(), this.countCriticidadArticuloEstado('2') * this.countElementos()],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

   }

   private _stacked100BarChartAmbienteCriticidad(colors: any){
    
    colors = this.getChartColorsArray(colors);
    this.stacked100BarChartAmbienteCriticidad = {
      series: [{
        name: "Alta",
        data: [this.ambiente_alta, this.energia_alta, this.sso_alta],
      },
      {
        name: "Media",
        data: [this.ambiente_media, this.energia_media, this.sso_media],
      },
      {
        name: "Baja",
        data: [this.ambiente_baja, this.energia_baja, this.sso_baja],
      },
      {
        name: "No especificado",
        data: [this.ambiente_otros, this.energia_otros, this.sso_otros],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.ambiente_alta, this.energia_alta, this.sso_alta],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.ambiente_media, this.energia_media, this.sso_media],
      }
      ],
      seriesBaja: [
      {
        name: "Baja",
        data: [this.ambiente_baja, this.energia_baja, this.sso_baja],
      }
      ],
      seriesOtros: [
      {
        name: "No especificado",
        data: [this.ambiente_otros, this.energia_otros, this.sso_otros],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: ["MA","ENERGIA","SSO"],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

    this.stacked100BarChartAmbienteCriticidadCuerpos = {
      series: [{
        name: "Alta",
        data: [this.cuerpo_ambiente_alta, this.cuerpo_energia_alta, this.cuerpo_sso_alta],
      },
      {
        name: "Media",
        data: [this.cuerpo_ambiente_media, this.cuerpo_energia_media, this.cuerpo_sso_media],
      },
      {
        name: "Baja",
        data: [this.cuerpo_ambiente_baja, this.cuerpo_energia_baja, this.cuerpo_sso_baja],
      },
      {
        name: "No especificado",
        data: [this.cuerpo_ambiente_otros, this.cuerpo_energia_otros, this.cuerpo_sso_otros],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.cuerpo_ambiente_alta, this.cuerpo_energia_alta, this.cuerpo_sso_alta],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.cuerpo_ambiente_media, this.cuerpo_energia_media, this.cuerpo_sso_media],
      }
      ],
      seriesBaja: [{
        name: "Baja",
        data: [this.cuerpo_ambiente_baja, this.cuerpo_energia_baja, this.cuerpo_sso_baja],
      }
      ],
      seriesOtros: [
      {
        name: "No especificado",
        data: [this.cuerpo_ambiente_otros, this.cuerpo_energia_otros, this.cuerpo_sso_otros],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: ["MA","ENERGIA","SSO"],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

    this.stacked100BarChartAmbienteCriticidadInstancias = {
      series: [{
        name: "Alta",
        data: [this.ambiente_alta * this.countElementos(), this.energia_alta * this.countElementos(), this.sso_alta * this.countElementos()],
      },
      {
        name: "Media",
        data: [this.ambiente_media * this.countElementos(), this.energia_media * this.countElementos(), this.sso_media * this.countElementos()],
      },
      {
        name: "Baja",
        data: [this.ambiente_baja * this.countElementos(), this.energia_baja * this.countElementos(), this.sso_baja * this.countElementos()],
      },
      {
        name: "No especificado",
        data: [this.ambiente_otros * this.countElementos(), this.energia_otros * this.countElementos(), this.sso_otros * this.countElementos()],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.ambiente_alta * this.countElementos(), this.energia_alta * this.countElementos(), this.sso_alta * this.countElementos()],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.ambiente_media * this.countElementos(), this.energia_media * this.countElementos(), this.sso_media * this.countElementos()],
      }
      ],
      seriesBaja: [{
        name: "Baja",
        data: [this.ambiente_baja * this.countElementos(), this.energia_baja * this.countElementos(), this.sso_baja * this.countElementos()],
      }
      ],
      seriesOtros: [{
        name: "No especificado",
        data: [this.ambiente_otros * this.countElementos(), this.energia_otros * this.countElementos(), this.sso_otros * this.countElementos()],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: ["MA","ENERGIA","SSO"],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

   }
   /**
 * Stacked 100 Bar Charts
 */
   private _stacked100BarChartAtributos(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.stacked100BarChartPermisos = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','permiso','Alta'), this.countCriticidadAtributoEstado('2','permiso','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','permiso','Media'), this.countCriticidadAtributoEstado('2','permiso','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','permiso','Baja'), this.countCriticidadAtributoEstado('2','permiso','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','permiso'), this.countCriticidadAtributoEstado('1','permiso')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','permiso','Alta'), this.countCriticidadAtributoEstado('2','permiso','Alta')],
      }
      ],
      seriesMedia: [
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','permiso','Media'), this.countCriticidadAtributoEstado('2','permiso','Media')],
      }
      ],
      seriesBaja: [
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','permiso','Baja'), this.countCriticidadAtributoEstado('2','permiso','Baja')],
      }
      ],
      seriesOtros: [
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','permiso'), this.countCriticidadAtributoEstado('1','permiso')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          vertical: true
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

    this.stacked100BarChartReportes = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','reporte','Alta'), this.countCriticidadAtributoEstado('2','reporte','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','reporte','Media'), this.countCriticidadAtributoEstado('2','reporte','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','reporte','Baja'), this.countCriticidadAtributoEstado('2','reporte','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','reporte'), this.countCriticidadAtributoEstado('1','reporte')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','reporte','Alta'), this.countCriticidadAtributoEstado('2','reporte','Alta')],
      }
      ],
      seriesMedia: [
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','reporte','Media'), this.countCriticidadAtributoEstado('2','reporte','Media')],
      }
      ],
      seriesBaja: [
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','reporte','Baja'), this.countCriticidadAtributoEstado('2','reporte','Baja')],
      }
      ],
      seriesOtros: [
      {
        name: "No especificados",
        data: [this.countCriticidadAtributoEstado('1','reporte'), this.countCriticidadAtributoEstado('1','reporte')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          vertical: true
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

    this.stacked100BarChartMonitoreos = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Alta'), this.countCriticidadAtributoEstado('2','monitoreo','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Media'), this.countCriticidadAtributoEstado('2','monitoreo','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Baja'), this.countCriticidadAtributoEstado('2','monitoreo','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','monitoreo'), this.countCriticidadAtributoEstado('1','monitoreo')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Alta'), this.countCriticidadAtributoEstado('2','monitoreo','Alta')],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Media'), this.countCriticidadAtributoEstado('2','monitoreo','Media')],
      }
      ],
      seriesBaja: [{
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','monitoreo','Baja'), this.countCriticidadAtributoEstado('2','monitoreo','Baja')],
      }
      ],
      seriesOtros: [{
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','monitoreo'), this.countCriticidadAtributoEstado('1','monitoreo')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          vertical: true
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };

    this.stacked100BarChartOtros = {
      series: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','otros','Alta'), this.countCriticidadAtributoEstado('2','otros','Alta')],
      },
      {
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','otros','Media'), this.countCriticidadAtributoEstado('2','otros','Media')],
      },
      {
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','otros','Baja'), this.countCriticidadAtributoEstado('2','otros','Baja')],
      },
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','otros'), this.countCriticidadAtributoEstado('1','otros')],
      }
      ],
      seriesAlta: [{
        name: "Alta",
        data: [this.countCriticidadAtributoEstado('1','otros','Alta'), this.countCriticidadAtributoEstado('2','otros','Alta')],
      }
      ],
      seriesMedia: [{
        name: "Media",
        data: [this.countCriticidadAtributoEstado('1','otros','Media'), this.countCriticidadAtributoEstado('2','otros','Media')],
      }
      ],
      seriesBaja: [{
        name: "Baja",
        data: [this.countCriticidadAtributoEstado('1','otros','Baja'), this.countCriticidadAtributoEstado('2','otros','Baja')],
      }
      ],
      seriesOtros: [
      {
        name: "No especificado",
        data: [this.countCriticidadAtributoEstado('1','otros'), this.countCriticidadAtributoEstado('1','otros')],
      }
      ],
      chart: {
        type: "bar",
        height: 250,
        stacked: true,
        //stackType: "100%",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          vertical: true
        },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      /*title: {
        text: "100% Stacked Bar",
        style: {
          fontWeight: 600,
        },
      },*/
      xaxis: {
        categories: this.getCategories(),//['Gestionar', 'Por definir'],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "bottom",
        //horizontalAlign: "left",
        //offsetX: 40,
      },
      colors: colors,
    };
  }

  /**
   * Basic Bar Chart
   */
  private _basicBarChartGeneral(colors: any) {
    colors = this.getChartColorsArray(this.getColorsCriticidad(this.criticidad));
    this.basicBarChartGeneral = {
        series: [/*{
            data: this.getDataDashboardArea('value','general'),
            name: 'Articulos',
        }*/
        {
          data: this.getDataDashboardArea('value','general','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardArea('value','general','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardArea('value','general','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardArea('value','general','otros'),
          name: 'No Evaluado',
        }],
        seriesCriticidad: [{
          data: this.getDataDashboardArea('value','general','alta'),
          name: 'Alta',
        },
        {
          data: this.getDataDashboardArea('value','general','media'),
          name: 'Media',
        },
        {
          data: this.getDataDashboardArea('value','general','baja'),
          name: 'Baja',
        },
        {
          data: this.getDataDashboardArea('value','general','otros'),
          name: 'No especificado',
        }],
        seriesAlta: [{
          data: this.getDataDashboardArea('value','general','alta'),
          name: 'Alta',
        }],
        seriesMedia: [{
          data: this.getDataDashboardArea('value','general','media'),
          name: 'Media',
        }],
        seriesBaja: [{
          data: this.getDataDashboardArea('value','general','baja'),
          name: 'Baja',
        }],
        seriesOtros: [{
          data: this.getDataDashboardArea('value','general','otros'),
          name: 'No especificado',
        }],
        chart: {
            type: 'bar',
            height: this.getDataDashboardArea('label','general').length > 20 ? 800 : 400,            
            stacked: true,
            //stackType: "100%",
            toolbar: {
                show: false,
            }
        },
        plotOptions: {
            bar: {
                //borderRadius: 4,
                horizontal: true,
                columnWidth: '80%',
                distributed: false,
                dataLabels: {
                  position: 'top',
                  style: {
                    colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
                  }
              },
            },
            dataLabels: {
              enabled: true,
              style: {
              colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
              },
              offsetX: this.criticidad ? 0 : 0
            },
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        dataLabels: {
            enabled: true,
            offsetX: this.criticidad ? 0 : 0,
            style: {
                //fontSize: '12px',
                //fontWeight: 400,
                colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
            }
        },
        colors: colors,  
        tooltip: {
          y: {
            formatter: function (val:any) {
              return val;// + "K";
            },
          },
        },
        fill: {
          opacity: 1,
        },
        legend: {
            position: "top",
            show: true,
        },
        /*grid: {
            show: false,
        },*/
        xaxis: {
            categories: this.getDataDashboardArea('label','general'),
            width: 400,
            columnWidth: '40%'
        },
    };
  }

  /**
   * Basic Bar Chart
   */
  private _basicBarChartGeneralInstallation(colors: any) {
    colors = this.getChartColorsArray(this.getColorsCriticidad(this.criticidad));
    this.basicBarChartGeneralInstallation = {
        series: [/*{
            data: this.getDataDashboardInstallation('value','general'),
            name: 'Articulos',
        }*/{
          data: this.getDataDashboardInstallation('value','general','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','general','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardInstallation('value','general','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','general','otros'),
          name: 'No Evaluado',
        }],
        seriesCriticidad: [{
          data: this.getDataDashboardInstallation('value','general','alta'),
          name: 'Alta',
        },
        {
          data: this.getDataDashboardInstallation('value','general','media'),
          name: 'Media',
        },
        {
          data: this.getDataDashboardInstallation('value','general','baja'),
          name: 'Baja',
        },
        {
          data: this.getDataDashboardInstallation('value','general','otros'),
          name: 'No especificado',
        }],
        seriesAlta: [{
          data: this.getDataDashboardInstallation('value','general','alta'),
          name: 'Alta',
        }],
        seriesMedia: [{
          data: this.getDataDashboardInstallation('value','general','media'),
          name: 'Media',
        }],
        seriesBaja: [{
          data: this.getDataDashboardInstallation('value','general','baja'),
          name: 'Baja',
        }],
        seriesOtros: [{
          data: this.getDataDashboardInstallation('value','general','otros'),
          name: 'No especificado',
        }],
        chart: {
            type: 'bar',
            height: this.getDataDashboardInstallation('label','general').length > 20 ? 800 : 400,    
            stacked: true,
            //stackType: "100%",
            toolbar: {
                show: false,
            }
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        plotOptions: {
            bar: {
                //borderRadius: 4,
                horizontal: true,
                distributed: false,
                dataLabels: {
                  position: 'top',
                  style: {
                  colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
                  }
              },
            },
            dataLabels: {
              enabled: true,
              style: {
                  colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
              },
              offsetX: this.criticidad ? 0 : 0
            },
        },
        dataLabels: {
            enabled: true,
            offsetX: this.criticidad ? 0 : 0,
            style: {
                //fontSize: '12px',
                //fontWeight: 400,
                colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
            }
        },
        tooltip: {
          y: {
            formatter: function (val:any) {
              return val;// + "K";
            },
          },
        },
        fill: {
          opacity: 1,
        },
        legend: {
            position: "top",
            //show: false,
        },
        colors: colors,
        /*grid: {
            show: false,
        },*/
        xaxis: {
            categories: this.getDataDashboardInstallation('label','general')
        },
    };
  }

  private _basicBarChartAtributos(colors: any) {
    colors = this.getChartColorsArray(this.getColorsCriticidad(this.criticidad));
    let colors_permisos = this.getChartColorsArray(this.getColorsAtributosCriticidad(this.criticidad, 'permiso'));
    let colors_reportes = this.getChartColorsArray(this.getColorsAtributosCriticidad(this.criticidad, 'reporte'));
    let colors_monitoreos = this.getChartColorsArray(this.getColorsAtributosCriticidad(this.criticidad, 'monitoreo'));

    this.basicBarChartPermisosCumplimiento = {
      
      series: [{
        data: this.getDataCumplimientoAtributo('permisos'),//[6, 5, 7, 20, 3, 1, 2, 2, 2, 3, 2, 55],//this.getDataDashboardArea('value','permisos'),
        name: 'Articulos',
      }],
      seriesCriticidad: [{
        data: this.getDataCumplimientoAtributo('permisos','alta'),//[2, 1, 0, 2, 1, 2, 0],//this.getDataDashboardArea('value','permisos','alta'),
        name: 'Alta',
      },
      {
        data: this.getDataCumplimientoAtributo('permisos','media'),//[1, 0, 0, 0, 1, 1, 0],//this.getDataDashboardArea('value','permisos','media'),
        name: 'Media',
      },
      {
        data: this.getDataCumplimientoAtributo('permisos','baja'),//[0, 0, 0, 0, 0, 1, 2],//this.getDataDashboardArea('value','permisos','baja'),
        name: 'Baja',
      },
      {
        data: this.getDataCumplimientoAtributo('permisos','otros'),//[0, 0, 2, 0, 0, 0, 0],//this.getDataDashboardArea('value','permisos','otros'),
        name: 'No especificado',
      }],
      seriesAlta: [{
        data: this.getDataCumplimientoAtributo('permisos','alta'),//,//this.getDataDashboardArea('value','permisos','alta'),
        name: 'Alta',
      }],
      seriesMedia: [{
        data: this.getDataCumplimientoAtributo('permisos','media'),//,//this.getDataDashboardArea('value','permisos','media'),
        name: 'Media',
      }],
      seriesBaja: [{
        data: this.getDataCumplimientoAtributo('permisos','baja'),//,//this.getDataDashboardArea('value','permisos','baja'),
        name: 'Baja',
      }],
      seriesOtros: [{
        data: this.getDataCumplimientoAtributo('permisos','otros'),//,//this.getDataDashboardArea('value','permisos','otros'),
        name: 'No especificado',
      }],
      chart: {
          type: 'bar',
          height: this.getDataDashboardArea('label','permisos').length > 20 ? 800 : 400,      
          stacked: this.criticidad ? true : false,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
      },
      plotOptions: {
          bar: {
              //borderRadius: 4,
              horizontal: true,
              distributed: this.criticidad ? false : true,
              dataLabels: {
                  position: 'top',
                  style: {
                    colors: [this.criticidad ? '#ffffff' : '#f7b84b']
                  }
              },
          },
          dataLabels: {
            enabled: true,
            style: {
                colors: [this.criticidad ? '#ffffff' : '#adb5bd']
            },
            offsetX: this.criticidad ? 0 : 32
          },
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      dataLabels: {
          enabled: true,
          offsetX: this.criticidad ? 0 : 32,
          style: {
              //fontSize: '12px',
              //fontWeight: 400,
              colors: [this.criticidad ? '#ffffff' : '#adb5bd']
          }
      },
      colors: colors_permisos,
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
          position: "top",
          show: this.criticidad ? true : false,
      },
      /*grid: {
          show: false,
      },*/
      xaxis: {
          categories: this.getCategoryCumplimientoAtributo('permisos')//this.getDataDashboardArea('label','permisos')
          ,labels: {
            show: true,
            //minHeight: undefined,
            //maxHeight: 120,
            style: {
                //fontSize: '18px',
                //fontFamily: 'Helvetica, Arial, sans-serif',
                //fontWeight: 400,
                cssClass: 'apexcharts-xaxis-label',
            },
          }
      },
      yaxis: {
        show: true,
        labels: {
           show: true,
           minWidth: 300,
           maxWidth: 600
        }
      }
  };
  
  this.basicBarChartReportesCumplimiento = {
    series: [{
        data: this.getDataCumplimientoAtributo('reportes'),//this.getDataDashboardArea('value','reportes'),
        name: 'Articulos',
    }],
    seriesCriticidad: [{
      data: this.getDataCumplimientoAtributo('reportes','alta'),//[6],//this.getDataDashboardArea('value','reportes','alta'),
      name: 'Alta',
    },
    {
      data: this.getDataCumplimientoAtributo('reportes','media'),//[2],//this.getDataDashboardArea('value','reportes','media'),
      name: 'Media',
    },
    {
      data: this.getDataCumplimientoAtributo('reportes','baja'),//[3],//this.getDataDashboardArea('value','reportes','baja'),
      name: 'Baja',
    },
    {
      data: this.getDataCumplimientoAtributo('reportes','otros'),//[2],//this.getDataDashboardArea('value','reportes','otros'),
      name: 'No especificado',
    }],
    seriesAlta: [{
      data: this.getDataCumplimientoAtributo('reportes','alta'),//[6],//this.getDataDashboardArea('value','reportes','alta'),
      name: 'Alta',
    }],
    seriesMedia: [{
      data: this.getDataCumplimientoAtributo('reportes','media'),//[2],//this.getDataDashboardArea('value','reportes','media'),
      name: 'Media',
    }],
    seriesBaja: [{
      data: this.getDataCumplimientoAtributo('reportes','baja'),//[3],//this.getDataDashboardArea('value','reportes','baja'),
      name: 'Baja',
    }],
    seriesOtros: [{
      data: this.getDataCumplimientoAtributo('reportes','otros'),//[2],//this.getDataDashboardArea('value','reportes','otros'),
      name: 'No especificado',
    }],
    chart: {
        type: 'bar',
        height: this.getDataDashboardArea('label','reportes').length > 20 ? 800 : 400,      
        stacked: this.criticidad ? true : false,
        //stackType: "100%",
        toolbar: {
            show: false,
        }
    },
    plotOptions: {
        bar: {
            //borderRadius: 4,
            horizontal: true,
            distributed: this.criticidad ? false : true,
            dataLabels: {
                position: 'top',
                style: {
                  colors: [this.criticidad ? '#ffffff' : '#f7b84b']
                }
            },
        },
        dataLabels: {
          enabled: true,
          style: {
              colors: [this.criticidad ? '#ffffff' : '#adb5bd']//#adb5bd
          },
          offsetX: this.criticidad ? 0 : 32
        },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    dataLabels: {
        enabled: true,
        offsetX: this.criticidad ? 0 : 32,
        style: {
            //fontSize: '12px',
            //fontWeight: 400,
            colors: [this.criticidad ? '#ffffff' : '#adb5bd']
        }
    },
    colors: colors_reportes,
    tooltip: {
      y: {
        formatter: function (val:any) {
          return val;// + "K";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
        position: "top",
        show: this.criticidad ? true : false,
    },
    /*grid: {
        show: false,
    },*/
    xaxis: {
        categories: this.getCategoryCumplimientoAtributo('reportes')//this.getDataDashboardArea('label','reportes')
        ,labels: {
          show: true,
          style: {
              //fontSize: '18px',
              //fontFamily: 'Helvetica, Arial, sans-serif',
              //fontWeight: 400,
              cssClass: 'apexcharts-xaxis-label',
          },
        }
    },
    yaxis: {
      show: true,
      labels: {
         show: true,
         minWidth: 300,
         maxWidth: 600
      }
    }
};

this.basicBarChartMonitoreosCumplimiento = {
  series: [{
      data: this.getDataCumplimientoAtributo('monitoreos'),//this.getDataDashboardArea('value','monitoreos'),
      name: 'Articulos',
  }],
  seriesCriticidad: [{
    data: this.getDataCumplimientoAtributo('monitoreos','alta'),//[0,1],//this.getDataDashboardArea('value','monitoreos','alta'),
    name: 'Alta',
  },
  {
    data: this.getDataCumplimientoAtributo('monitoreos','media'),//[1,0],//this.getDataDashboardArea('value','monitoreos','media'),
    name: 'Media',
  },
  {
    data: this.getDataCumplimientoAtributo('monitoreos','baja'),//[0,0],//this.getDataDashboardArea('value','monitoreos','baja'),
    name: 'Baja',
  },
  {
    data: this.getDataCumplimientoAtributo('monitoreos','otros'),//[1,0],//this.getDataDashboardArea('value','monitoreos','otros'),
    name: 'No especificado',
  }],
  seriesAlta: [{
    data: this.getDataCumplimientoAtributo('monitoreos','alta'),//[0,1],//this.getDataDashboardArea('value','monitoreos','alta'),
    name: 'Alta',
  }],
  seriesMedia: [{
    data: this.getDataCumplimientoAtributo('monitoreos','media'),//[1,0],//this.getDataDashboardArea('value','monitoreos','media'),
    name: 'Media',
  }],
  seriesBaja: [{
    data: this.getDataCumplimientoAtributo('monitoreos','baja'),//[0,0],//this.getDataDashboardArea('value','monitoreos','baja'),
    name: 'Baja',
  }],
  seriesOtros: [{
    data: this.getDataCumplimientoAtributo('monitoreos','otros'),//[1,0],//this.getDataDashboardArea('value','monitoreos','otros'),
    name: 'No especificado',
  }],
  chart: {
      type: 'bar',
      height: 400,//this.getDataDashboardArea('label','monitoreos').length > 20 ? 800 : 400,      
      stacked: this.criticidad ? true : false,
      //stackType: "100%",
      toolbar: {
          show: false,
      }
  },
  stroke: {
    width: 1,
    colors: ["#fff"],
  },
  plotOptions: {
      bar: {
          //borderRadius: 4,
          horizontal: true,
          distributed: this.criticidad ? false : true,
          dataLabels: {
            position: 'top',
            style: {
              colors: [this.criticidad ? '#ffffff' : '#f7b84b']
            }
          },
      },
      dataLabels: {
        enabled: true,
        style: {
            colors: [this.criticidad ? '#ffffff' : '#adb5bd']//#adb5bd
        },
        offsetX: this.criticidad ? 0 : 32
      },
  },
  dataLabels: {
      enabled: true,
      offsetX: this.criticidad ? 0 : 32,
      style: {
          //fontSize: '12px',
          //fontWeight: 400,
          colors: [this.criticidad ? '#ffffff' : '#adb5bd']
      }
  },
  colors: colors_monitoreos,
  tooltip: {
    y: {
      formatter: function (val:any) {
        return val;// + "K";
      },
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
      position: "top",
      show: this.criticidad ? true : false,
  },
  /*grid: {
      show: false,
  },*/
  xaxis: {
      categories: this.getCategoryCumplimientoAtributo('monitoreos')//this.getDataDashboardArea('label','monitoreos')
      ,labels: {
        show: true,
        //minHeight: undefined,
        //maxHeight: 120,
        style: {
            //fontSize: '18px',
            //fontFamily: 'Helvetica, Arial, sans-serif',
            //fontWeight: 400,
            cssClass: 'apexcharts-xaxis-label',
        },
      }
  },
  yaxis: {
    show: true,
    labels: {
       show: true,
       minWidth: 300,
       maxWidth: 600
    }
  }
};

this.basicBarChartOtrosCumplimiento = {
  series: [{
      data: this.getDataCumplimientoAtributo('otros'),//this.getDataDashboardArea('value','otros'),
      name: 'Articulos',
  }],
seriesCriticidad: [{
  data: [10],//this.getDataDashboardArea('value','otros','alta'),
  name: 'Alta',
},
{
  data: [10],//this.getDataDashboardArea('value','otros','media'),
  name: 'Media',
},
{
  data: [4],//this.getDataDashboardArea('value','otros','baja'),
  name: 'Baja',
},
{
  data: [4],//this.getDataDashboardArea('value','otros','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: [10],//this.getDataDashboardArea('value','otros','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: [10],//this.getDataDashboardArea('value','otros','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: [4],//this.getDataDashboardArea('value','otros','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: [4],//this.getDataDashboardArea('value','otros','otros'),
  name: 'No especificado',
}],
  chart: {
      type: 'bar',
      height: this.getDataDashboardArea('label','otros').length > 20 ? 800 : 400,      
      stacked: true,
      //stackType: "100%",
      toolbar: {
          show: false,
      }
  },
  stroke: {
    width: 1,
    colors: ["#fff"],
  },
  plotOptions: {
      bar: {
          //borderRadius: 4,
          horizontal: true,
          /*distributed: true,
          dataLabels: {
              position: 'top',
          },*/
      }
  },
  dataLabels: {
      enabled: true,
      offsetX: 32,
      style: {
          fontSize: '12px',
          fontWeight: 400,
          colors: ['#adb5bd']
      }
  },
  colors: colors,
  tooltip: {
    y: {
      formatter: function (val:any) {
        return val;// + "K";
      },
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
      position: "top",
      //show: false,
  },
  /*grid: {
      show: false,
  },*/
  xaxis: {
      categories: this.getCategoryCumplimientoAtributo('otros')//this.getDataDashboardArea('label','otros')
  },
};

this.basicBarChartPermisos = {
  series: [/*{
      data: this.getDataDashboardArea('value','permisos'),
      name: 'Articulos',
  }*/{
          data: this.getDataDashboardArea('value','permisos','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardArea('value','permisos','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardArea('value','permisos','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardArea('value','permisos','otros'),
          name: 'No Evaluado',
        }],
  seriesCriticidad: [{
    data: this.getDataDashboardArea('value','permisos','alta'),
    name: 'Alta',
  },
  {
    data: this.getDataDashboardArea('value','permisos','media'),
    name: 'Media',
  },
  {
    data: this.getDataDashboardArea('value','permisos','baja'),
    name: 'Baja',
  },
  {
    data: this.getDataDashboardArea('value','permisos','otros'),
    name: 'No especificado',
  }],
  seriesAlta: [{
    data: this.getDataDashboardArea('value','permisos','alta'),
    name: 'Alta',
  }],
  seriesMedia: [{
    data: this.getDataDashboardArea('value','permisos','media'),
    name: 'Media',
  }],
  seriesBaja: [{
    data: this.getDataDashboardArea('value','permisos','baja'),
    name: 'Baja',
  }],
  seriesOtros: [{
    data: this.getDataDashboardArea('value','permisos','otros'),
    name: 'No especificado',
  }],
  chart: {
      type: 'bar',
      height: this.getDataDashboardArea('label','permisos').length > 20 ? 800 : 400,      
      stacked: true,
      //stackType: "100%",
      toolbar: {
          show: false,
      }
  },
  plotOptions: {
      bar: {
          //borderRadius: 4,
          horizontal: true,
          distributed: false,
          dataLabels: {
              position: 'top',
              style: {
                colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
              }
          },
      },
      dataLabels: {
        enabled: true,
        style: {
        colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#1d60ba'*/]//#adb5bd
        },
        offsetX: this.criticidad ? 0 : 0
      },
  },
  stroke: {
    width: 1,
    colors: ["#fff"],
  },
  dataLabels: {
      enabled: true,
      offsetX: this.criticidad ? 0 : 0,
      style: {
          //fontSize: '12px',
          //fontWeight: 400,
          colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
      }
  },
  colors: colors,
  tooltip: {
    y: {
      formatter: function (val:any) {
        return val;// + "K";
      },
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
      position: "top",
      show: true,
  },
  /*grid: {
      show: false,
  },*/
  xaxis: {
      categories: this.getDataDashboardArea('label','permisos'),
      labels: {
        show: true,
        style: {
            //fontSize: '18px',
            //fontFamily: 'Helvetica, Arial, sans-serif',
            //fontWeight: 400,
            cssClass: 'apexcharts-xaxis-label',
        },
      }
  },
  yaxis: {
    show: true,
    labels: {
       show: true,
       minWidth: 300,
       maxWidth: 600
    }
  }
};

this.basicBarChartReportes = {
series: [/*{
    data: this.getDataDashboardArea('value','reportes'),
    name: 'Articulos',
}*/{
          data: this.getDataDashboardArea('value','reportes','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardArea('value','reportes','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardArea('value','reportes','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardArea('value','reportes','otros'),
          name: 'No Evaluado',
        }],
seriesCriticidad: [{
  data: this.getDataDashboardArea('value','reportes','alta'),
  name: 'Alta',
},
{
  data: this.getDataDashboardArea('value','reportes','media'),
  name: 'Media',
},
{
  data: this.getDataDashboardArea('value','reportes','baja'),
  name: 'Baja',
},
{
  data: this.getDataDashboardArea('value','reportes','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: this.getDataDashboardArea('value','reportes','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: this.getDataDashboardArea('value','reportes','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: this.getDataDashboardArea('value','reportes','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: this.getDataDashboardArea('value','reportes','otros'),
  name: 'No especificado',
}],
chart: {
    type: 'bar',
    height: this.getDataDashboardArea('label','reportes').length > 20 ? 800 : 400,      
    stacked: true,
    //stackType: "100%",
    toolbar: {
        show: false,
    }
},
plotOptions: {
    bar: {
        //borderRadius: 4,
        horizontal: true,
        distributed: false,
        dataLabels: {
            position: 'top',
            style: {
              colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
            }
        },
    },
    dataLabels: {
      enabled: true,
      style: {
      colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#1d60ba'*/]//#adb5bd
      },
      offsetX: this.criticidad ? 0 : 0
    },
},
stroke: {
  width: 1,
  colors: ["#fff"],
},
dataLabels: {
    enabled: true,
    offsetX: this.criticidad ? 0 : 0,
    style: {
        //fontSize: '12px',
        //fontWeight: 400,
        colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
    }
},
colors: colors,
tooltip: {
  y: {
    formatter: function (val:any) {
      return val;// + "K";
    },
  },
},
fill: {
  opacity: 1,
},
legend: {
    position: "top",
    show: true,
},
/*grid: {
    show: false,
},*/
xaxis: {
    categories: this.getDataDashboardArea('label','reportes'),
    labels: {
      show: true,
      style: {
          //fontSize: '18px',
          //fontFamily: 'Helvetica, Arial, sans-serif',
          //fontWeight: 400,
          cssClass: 'apexcharts-xaxis-label',
      },
    }
},
yaxis: {
  show: true,
  labels: {
     show: true,
     minWidth: 300,
     maxWidth: 600
  }
}
};

this.basicBarChartMonitoreos = {
series: [/*{
  data: this.getDataDashboardArea('value','monitoreos'),
  name: 'Articulos',
}*/{
          data: this.getDataDashboardArea('value','monitoreos','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardArea('value','monitoreos','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardArea('value','monitoreos','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardArea('value','monitoreos','otros'),
          name: 'No Evaluado',
        }],
seriesCriticidad: [{
data: this.getDataDashboardArea('value','monitoreos','alta'),
name: 'Alta',
},
{
data: this.getDataDashboardArea('value','monitoreos','media'),
name: 'Media',
},
{
data: this.getDataDashboardArea('value','monitoreos','baja'),
name: 'Baja',
},
{
data: this.getDataDashboardArea('value','monitoreos','otros'),
name: 'No especificado',
}],
seriesAlta: [{
data: this.getDataDashboardArea('value','monitoreos','alta'),
name: 'Alta',
}],
seriesMedia: [{
data: this.getDataDashboardArea('value','monitoreos','media'),
name: 'Media',
}],
seriesBaja: [{
data: this.getDataDashboardArea('value','monitoreos','baja'),
name: 'Baja',
}],
seriesOtros: [{
data: this.getDataDashboardArea('value','monitoreos','otros'),
name: 'No especificado',
}],
chart: {
  type: 'bar',
  height: this.getDataDashboardArea('label','monitoreos').length > 20 ? 800 : 400,      
  stacked: true,
  //stackType: "100%",
  toolbar: {
      show: false,
  }
},
stroke: {
width: 1,
colors: ["#fff"],
},
plotOptions: {
  bar: {
      //borderRadius: 4,
      horizontal: true,
      distributed: false,
      dataLabels: {
          position: 'top',
          style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
          }
      },
  },
  dataLabels: {
    enabled: true,
    style: {
    colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#1d60ba'*/]//#adb5bd
    },
    offsetX: this.criticidad ? 0 : 0
  },
},
dataLabels: {
  enabled: true,
  offsetX: this.criticidad ? 0 : 0,
  style: {
      //fontSize: '12px',
      //fontWeight: 400,
      colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
  }
},
colors: colors,
tooltip: {
y: {
  formatter: function (val:any) {
    return val;// + "K";
  },
},
},
fill: {
opacity: 1,
},
legend: {
  position: "top",
  show: true,
},
/*grid: {
  show: false,
},*/
xaxis: {
  categories: this.getDataDashboardArea('label','monitoreos'),
  labels: {
    show: true,
    style: {
        //fontSize: '18px',
        //fontFamily: 'Helvetica, Arial, sans-serif',
        //fontWeight: 400,
        cssClass: 'apexcharts-xaxis-label',
    },
  }
},
yaxis: {
show: true,
labels: {
   show: true,
   minWidth: 300,
   maxWidth: 600
}
}
};

this.basicBarChartOtros = {
series: [/*{
  data: this.getDataDashboardArea('value','otros'),
  name: 'Articulos',
}*/
{
          data: this.getDataDashboardArea('value','otros','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardArea('value','otros','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardArea('value','otros','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardArea('value','otros','otros'),
          name: 'No Evaluado',
        }],
seriesCriticidad: [{
data: this.getDataDashboardArea('value','otros','alta'),
name: 'Alta',
},
{
data: this.getDataDashboardArea('value','otros','media'),
name: 'Media',
},
{
data: this.getDataDashboardArea('value','otros','baja'),
name: 'Baja',
},
{
data: this.getDataDashboardArea('value','otros','otros'),
name: 'No especificado',
}],
seriesAlta: [{
data: this.getDataDashboardArea('value','otros','alta'),
name: 'Alta',
}],
seriesMedia: [{
data: this.getDataDashboardArea('value','otros','media'),
name: 'Media',
}],
seriesBaja: [{
data: this.getDataDashboardArea('value','otros','baja'),
name: 'Baja',
}],
seriesOtros: [{
data: this.getDataDashboardArea('value','otros','otros'),
name: 'No especificado',
}],
chart: {
  type: 'bar',
  height: this.getDataDashboardArea('label','otros').length > 20 ? 800 : 400,      
  stacked: true,
  //stackType: "100%",
  toolbar: {
      show: false,
  }
},
stroke: {
width: 1,
colors: ["#fff"],
},
plotOptions: {
  bar: {
      //borderRadius: 4,
      horizontal: true,
      distributed: false,
      dataLabels: {
          position: 'top',
          style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
          }
      },
  },
  dataLabels: {
    enabled: true,
    style: {
    colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#1d60ba'*/]//#adb5bd
    },
    offsetX: this.criticidad ? 0 : 0
  },
},
dataLabels: {
  enabled: true,
  offsetX: this.criticidad ? 0 : 0,
  style: {
      //fontSize: '12px',
      //fontWeight: 400,
      colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
  }
},
colors: colors,
tooltip: {
y: {
  formatter: function (val:any) {
    return val;// + "K";
  },
},
},
fill: {
opacity: 1,
},
legend: {
  position: "top",
  show: true,
},
/*grid: {
  show: false,
},*/
xaxis: {
  categories: this.getDataDashboardArea('label','otros'),
  labels: {
    show: true,
    style: {
        //fontSize: '18px',
        //fontFamily: 'Helvetica, Arial, sans-serif',
        //fontWeight: 400,
        cssClass: 'apexcharts-xaxis-label',
    },
  }
},
yaxis: {
show: true,
labels: {
   show: true,
   minWidth: 300,
   maxWidth: 600
}
}
};

}

private _basicBarChartAtributosInstallations(colors: any) {
  colors = this.getChartColorsArray(this.getColorsCriticidad(this.criticidad));
  this.basicBarChartPermisosInstallations = {
    series: [/*{
        data: this.getDataDashboardInstallation('value','permisos'),
        name: 'Articulos',
    }*/{
          data: this.getDataDashboardInstallation('value','permisos','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','permisos','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardInstallation('value','permisos','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','permisos','otros'),
          name: 'No Evaluado',
        }], 
seriesCriticidad: [{
  data: this.getDataDashboardInstallation('value','permisos','alta'),
  name: 'Alta',
},
{
  data: this.getDataDashboardInstallation('value','permisos','media'),
  name: 'Media',
},
{
  data: this.getDataDashboardInstallation('value','permisos','baja'),
  name: 'Baja',
},
{
  data: this.getDataDashboardInstallation('value','permisos','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: this.getDataDashboardInstallation('value','permisos','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: this.getDataDashboardInstallation('value','permisos','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: this.getDataDashboardInstallation('value','permisos','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: this.getDataDashboardInstallation('value','permisos','otros'),
  name: 'No especificado',
}],
    chart: {
        type: 'bar',
        height: this.getDataDashboardInstallation('label','permisos').length > 20 ? 800 : 400,    
        stacked: true,
        //stackType: "100%",
        toolbar: {
            show: false,
        }
    },
    plotOptions: {
        bar: {
            //borderRadius: 4,
            horizontal: true,
            distributed: false,
            dataLabels: {
                position: 'top',
                style: {
                    colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
                }
            },
        },
            dataLabels: {
              enabled: true,
              style: {
              colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
              },
              offsetX: this.criticidad ? 0 : 0
            },
    },
    dataLabels: {
        enabled: true,
        offsetX: this.criticidad ? 0 : 0,
        style: {
            //fontSize: '12px',
            //fontWeight: 400,
            colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
        }
    },
    colors: colors,  
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      y: {
        formatter: function (val:any) {
          return val;// + "K";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
        position: "top",
        show: true,
    },/*
    grid: {
        show: false,
    },*/
    xaxis: {
        categories: this.getDataDashboardInstallation('label','permisos')
    },
};

this.basicBarChartReportesInstallations = {
  series: [/*{
      data: this.getDataDashboardInstallation('value','reportes'),
      name: 'Articulos',
  }*/{
          data: this.getDataDashboardInstallation('value','reportes','alta'),
          name: 'Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','reportes','media'),
          name: 'Cumple Parcial',
        },
        {
          data: this.getDataDashboardInstallation('value','reportes','baja'),
          name: 'No Cumple',
        },
        {
          data: this.getDataDashboardInstallation('value','reportes','otros'),
          name: 'No Evaluado',
        }],
seriesCriticidad: [{
  data: this.getDataDashboardInstallation('value','reportes','alta'),
  name: 'Alta',
},
{
  data: this.getDataDashboardInstallation('value','reportes','media'),
  name: 'Media',
},
{
  data: this.getDataDashboardInstallation('value','reportes','baja'),
  name: 'Baja',
},
{
  data: this.getDataDashboardInstallation('value','reportes','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: this.getDataDashboardInstallation('value','reportes','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: this.getDataDashboardInstallation('value','reportes','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: this.getDataDashboardInstallation('value','reportes','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: this.getDataDashboardInstallation('value','reportes','otros'),
  name: 'No especificado',
}],
  chart: {
      type: 'bar',
      height: this.getDataDashboardInstallation('label','reportes').length > 20 ? 800 : 400,    
      stacked: true,
      //stackType: "100%",
      toolbar: {
          show: false,
      }
  },
  plotOptions: {
      bar: {
          //borderRadius: 4,
          horizontal: true,
          distributed: false,
          dataLabels: {
            position: 'top',
            style: {
              colors: [this.criticidad ? '#ffffff' : '#f7b84b']
            }
        },
      },
      dataLabels: {
        enabled: true,
        style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
        },
        offsetX: this.criticidad ? 0 : 0
      },
  },
  dataLabels: {
      enabled: true,
      offsetX: this.criticidad ? 0 : 0,
      style: {
          //fontSize: '12px',
          //fontWeight: 400,
          colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
      }
  },
  colors: colors,
  stroke: {
    width: 1,
    colors: ["#fff"],
  },
  tooltip: {
    y: {
      formatter: function (val:any) {
        return val;// + "K";
      },
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
      position: "top",
      show: true,
  },/*
  grid: {
      show: false,
  },*/
  xaxis: {
      categories: this.getDataDashboardInstallation('label','reportes')
  },
};

this.basicBarChartMonitoreosInstallations = {
series: [/*{
    data: this.getDataDashboardInstallation('value','monitoreos'),
    name: 'Articulos',
}*/{
  data: this.getDataDashboardInstallation('value','monitoreos','alta'),
  name: 'Cumple',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','media'),
  name: 'Cumple Parcial',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','baja'),
  name: 'No Cumple',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','otros'),
  name: 'No Evaluado',
}],
seriesCriticidad: [{
  data: this.getDataDashboardInstallation('value','monitoreos','alta'),
  name: 'Alta',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','media'),
  name: 'Media',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','baja'),
  name: 'Baja',
},
{
  data: this.getDataDashboardInstallation('value','monitoreos','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: this.getDataDashboardInstallation('value','monitoreos','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: this.getDataDashboardInstallation('value','monitoreos','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: this.getDataDashboardInstallation('value','monitoreos','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: this.getDataDashboardInstallation('value','monitoreos','otros'),
  name: 'No especificado',
}],
chart: {
    type: 'bar',
    height: this.getDataDashboardInstallation('label','monitoreos').length > 20 ? 800 : 400,    
    stacked: true,
    //stackType: "100%",
    toolbar: {
        show: false,
    }
},
plotOptions: {
    bar: {
        //borderRadius: 4,
        horizontal: true,
        distributed: false,
        dataLabels: {
            position: 'top',
            style: {
              colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
            }
        },
    },
    dataLabels: {
      enabled: true,
      style: {
          colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
      },
      offsetX: this.criticidad ? 0 : 0
    },
},
dataLabels: {
    enabled: true,
    offsetX: this.criticidad ? 0 : 0,
    style: {
        //fontSize: '12px',
        //fontWeight: 400,
        colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
    }
},
colors: colors,
stroke: {
  width: 1,
  colors: ["#fff"],
},
tooltip: {
  y: {
    formatter: function (val:any) {
      return val;// + "K";
    },
  },
},
fill: {
  opacity: 1,
},
legend: {
    position: "top",
    show: true,
},/*
grid: {
    show: false,
},*/
xaxis: {
    categories: this.getDataDashboardInstallation('label','monitoreos')
},
};

this.basicBarChartOtrosInstallations = {
series: [/*{
    data: this.getDataDashboardInstallation('value','otros'),
    name: 'Articulos',
}*/{
  data: this.getDataDashboardInstallation('value','otros','alta'),
  name: 'Cumple',
},
{
  data: this.getDataDashboardInstallation('value','otros','media'),
  name: 'Cumple Parcial',
},
{
  data: this.getDataDashboardInstallation('value','otros','baja'),
  name: 'No Cumple',
},
{
  data: this.getDataDashboardInstallation('value','otros','otros'),
  name: 'No Evaluado',
}],
seriesCriticidad: [{
  data: this.getDataDashboardInstallation('value','otros','alta'),
  name: 'Alta',
},
{
  data: this.getDataDashboardInstallation('value','otros','media'),
  name: 'Media',
},
{
  data: this.getDataDashboardInstallation('value','otros','baja'),
  name: 'Baja',
},
{
  data: this.getDataDashboardInstallation('value','otros','otros'),
  name: 'No especificado',
}],
seriesAlta: [{
  data: this.getDataDashboardInstallation('value','otros','alta'),
  name: 'Alta',
}],
seriesMedia: [{
  data: this.getDataDashboardInstallation('value','otros','media'),
  name: 'Media',
}],
seriesBaja: [{
  data: this.getDataDashboardInstallation('value','otros','baja'),
  name: 'Baja',
}],
seriesOtros: [{
  data: this.getDataDashboardInstallation('value','otros','otros'),
  name: 'No especificado',
}],
chart: {
    type: 'bar',
    height: this.getDataDashboardInstallation('label','otros').length > 20 ? 800 : 400,    
    stacked: true,
    //stackType: "100%",
    toolbar: {
        show: false,
    }
},
plotOptions: {
    bar: {
        //borderRadius: 4,
        horizontal: true,
        distributed: false,
        dataLabels: {
          position: 'top',
          style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#f7b84b'*/]
          }
      },
    },
    dataLabels: {
      enabled: true,
      style: {
      colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
      },
      offsetX: this.criticidad ? 0 : 0
    },
},
dataLabels: {
    enabled: true,
    offsetX: this.criticidad ? 0 : 0,
    style: {
        //fontSize: '12px',
        //fontWeight: 400,
    colors: [this.criticidad ? '#ffffff' : '#ffffff'/*'#adb5bd'*/]
    }
},
colors: colors,
stroke: {
  width: 1,
  colors: ["#fff"],
},
tooltip: {
  y: {
    formatter: function (val:any) {
      return val;// + "K";
    },
  },
},
fill: {
  opacity: 1,
},
legend: {
    position: "top",
    show: true,
},/*
grid: {
    show: false,
},*/
xaxis: {
    categories: this.getDataDashboardInstallation('label','otros')
},
};

}

/**
   * Basic Bar Chart Cuerpos
   */
private _basicBarChartGeneralCuerpos(colors: any) {
  colors = this.getChartColorsArray(this.getColorsCriticidadCuerpo(this.criticidad_cuerpo));
  this.basicBarChartGeneralCuerpos = {
      series: [
      {
        data: this.getDataDashboardAreaCuerpo('value','general','cumple'),
        name: 'Cumple',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','cumple_parcial'),
        name: 'Cumple Parcial',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','no_cumple'),
        name: 'No Cumple',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','no_evaluado'),
        name: 'No Evaluado',
      }],
      seriesCriticidad: [{
        data: this.getDataDashboardAreaCuerpo('value','general','alta'),
        name: 'Alta',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','media'),
        name: 'Media',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','baja'),
        name: 'Baja',
      },
      {
        data: this.getDataDashboardAreaCuerpo('value','general','otros'),
        name: 'No especificado',
      }],
      seriesAlta: [{
        data: this.getDataDashboardAreaCuerpo('value','general','alta'),
        name: 'Alta',
      }],
      seriesMedia: [{
        data: this.getDataDashboardAreaCuerpo('value','general','media'),
        name: 'Media',
      }],
      seriesBaja: [{
        data: this.getDataDashboardAreaCuerpo('value','general','baja'),
        name: 'Baja',
      }],
      seriesOtros: [{
        data: this.getDataDashboardAreaCuerpo('value','general','otros'),
        name: 'No especificado',
      }],
      chart: {
          type: 'bar',
          height: this.getDataDashboardAreaCuerpo('label','general').length > 20 ? 800 : 400,      
          stacked: true,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
      },
      plotOptions: {
          bar: {
              //borderRadius: 4,
              horizontal: true,
              distributed: false,
              dataLabels: {
                position: 'top',
                style: {
                  colors: [this.criticidad ? '#ffffff' : '#ffffff']
                }
              },
          },
          dataLabels: {
            enabled: true,
            style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff']
            },
            offsetX: this.criticidad ? 0 : 0
          },
      },
      dataLabels: {
          enabled: true,
          offsetX: 0,
          style: {
              //fontSize: '12px',
              //fontWeight: 400,
              colors: ['#ffffff']
          }
      },
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      colors: colors,
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
          position: "top",
          show: true,
      },/*
      grid: {
          show: false,
      },*/
      xaxis: {
          categories: this.getDataDashboardAreaCuerpo('label','general')
      },
  };
}

/**
   * Basic Bar Chart Cuerpos
   */
private _basicBarChartGeneralCuerposInstallation(colors: any) {
  colors = this.getChartColorsArray(this.getColorsCriticidadCuerpo(this.criticidad_cuerpo));
  this.basicBarChartGeneralCuerposInstallation = {
      series: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','cumple'),
        name: 'Cumple',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','cumple_parcial'),
        name: 'Cumple Parcial',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','no_cumple'),
        name: 'No Cumple',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','no_evaluado'),
        name: 'No Evaluado',
      }],
      
      seriesCriticidad: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','alta'),
        name: 'Alta',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','media'),
        name: 'Media',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','baja'),
        name: 'Baja',
      },
      {
        data: this.getDataDashboardInstallationCuerpo('value','general','otros'),
        name: 'No especificado',
      }],
      seriesAlta: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','alta'),
        name: 'Alta',
      }],
      seriesMedia: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','media'),
        name: 'Media',
      }],
      seriesBaja: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','baja'),
        name: 'Baja',
      }],
      seriesOtros: [{
        data: this.getDataDashboardInstallationCuerpo('value','general','otros'),
        name: 'No especificado',
      }],
      chart: {
          type: 'bar',
          height: this.getDataDashboardInstallationCuerpo('label','general').length > 20 ? 800 : 400,      
          stacked: true,
          //stackType: "100%",
          toolbar: {
              show: false,
          }
      },
      plotOptions: {
          bar: {
              //borderRadius: 4,
              horizontal: true,
              distributed: false,
              dataLabels: {
                  position: 'top',
              },
          },
          dataLabels: {
            enabled: true,
            style: {
            colors: [this.criticidad ? '#ffffff' : '#ffffff']
            },
            offsetX: this.criticidad ? 0 : 0
          },
      },
      dataLabels: {
          enabled: true,
          offsetX: 0,
          style: {
              fontSize: '12px',
              fontWeight: 400,
              colors: ['#ffffff']
          }
      },
      colors: colors,
      stroke: {
        width: 1,
        colors: ["#fff"],
      },
      tooltip: {
        y: {
          formatter: function (val:any) {
            return val;// + "K";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
          position: "top",
          //show: false,
      },/*
      grid: {
          show: false,
      },*/
      xaxis: {
          categories: this.getDataDashboardInstallationCuerpo('label','general')
      },
  };
}

getCategoryCumplimientoAtributo(atributo?: any){
  let data: any = [];

  if(!this.tipo){
          switch (atributo) {
            case 'permisos':
              data = ['Aprobado y vigente', 'Actualizado/Regularizado', 'Desmovilizado', 'Desactualizado', 'Rechazado', 'Caducado', 'Suspendido', 'Revocado', 'Por Gestionar', 'En elaboración', 'En trámite', 'No evaluado'];
              break;
    
              case 'reportes':
                data = ['Reporte Regularizado', 'Reportado dentro del plazo sin desviaciones', 'Reportado fuera de plazo con desviaciones', 'Reportado fuera de plazo sin desviaciones', 'Reportado dentro del plazo con desviaciones', 'No reportado', 'No evaluado'];
                break;
    
                case 'monitoreos':
                  data = ['Monitoreo Regularizado', 'Ejecutado dentro del plazo sin desviaciones', 'Ejecutado fuera de plazo con desviaciones', 'Ejecutado fuera de plazo sin desviaciones', 'Ejecutado dentro del plazo con desviaciones', 'No ejecutado', 'En ejecución', 'No evaluado'];
                  break;
                  
                case 'otros':
                  data = ['Cumple', 'Cumple Parcial', 'No Cumple', 'No evaluado'];
                  break;
           
            default:
              break;
          }
        }else{
    
          switch (atributo) {
            case 'permisos':
    
            switch (this.tipo) {
              case 'Cumple':
                data = ['Aprobado y vigente', 'Actualizado/Regularizado'];
                break;
              case 'Cumple Parcial':
                data = ['Desmovilizado', 'Desactualizado'];
                break;
    
              case 'No Cumple':
                data = ['Rechazado', 'Caducado', 'Suspendido', 'Revocado', 'Por gestionar', 'En elaboración', 'En trámite']
                break;
    
              case 'No Evaluado':
                data = ['No evaluado'];
                break;
            
              default:
                break;
            }
            break;
            case 'reportes':

              switch (this.tipo) {
                case 'Cumple':
                  data = ['Reporte Regularizado', 'Reportado dentro del plazo sin desviaciones'];
                  break;
                case 'Cumple Parcial':
                  data = ['Reportado fuera de plazo con desviaciones', 'Reportado fuera de plazo sin desviaciones', 'Reportado dentro del plazo con desviaciones'];
                  break;

                case 'No Cumple':
                  data = ['No reportado'];
                  break;

                case 'No Evaluado':
                  data = ['No evaluado'];
                  break;
              
                default:
                  break;
              }
            break;
            case 'monitoreos':

              switch (this.tipo) {
                case 'Cumple':
                  data = ['Monitoreo Regularizado', 'Ejecutado dentro del plazo sin desviaciones'];
                  break;
                case 'Cumple Parcial':
                  data = ['Ejecutado fuera de plazo con desviaciones', 'Ejecutado fuera de plazo sin desviaciones', 'Ejecutado dentro del plazo con desviaciones'];
                  break;

                case 'No Cumple':
                  data = ['No ejecutado', 'En ejecución'];
                  break;

                case 'No Evaluado':
                  data = ['No evaluado'];
                  break;
              
                default:
                  break;
              }
            break;
            case 'otros':

              data = this.tipo;
          
            break;
      
        default:
          break;
      }
    }

    return data;
}

getTotalAtributo(obligacion: any, criticidad?: any){

  let dato = obligacion.countTotal;

  if(criticidad){
    switch (criticidad) {
      case 'alta':
        dato = obligacion.countAlta;
        break;
        case 'media':
          dato = obligacion.countMedia;
          break;
          case 'baja':
            dato = obligacion.countBaja;
            break;
            case 'otros':
              dato = obligacion.countOtros;
              break;
    
      default:
        break;
    }
  }

  return dato;
}

validExistData(atributo: any, estado: any, criticidad?: any){
  /*Por aquellos estados no reportados en monitoreo que fueron mala carga*/
  let estado_fallido = atributo == 'monitoreo' && estado == 'No ejecutado' ? 'No reportado' : estado;
  const index = this.dashboard.obligacionesAplicabilidadDetalle[atributo].findIndex((a: any) => 
    a.label == estado || a.label == estado_fallido
  );

  return index != -1 ? this.getTotalAtributo(this.dashboard.obligacionesAplicabilidadDetalle[atributo][index], criticidad) : 0;
}

getDataCumplimientoAtributo(atributo?: any, criticidad?: any){
      let data: any = [];
      let valor: any = 0;
            
      //if(!this.tipo){
        switch (atributo) {
          case 'permisos':
            //data = [6, 5, 7, 20, 3, 1, 2, 2, 2, 3, 2, 55];
            let permisos = this.getCategoryCumplimientoAtributo('permisos');
            for (let p = 0; p < permisos.length; p++) {
              valor = this.dashboard && this.dashboard.obligacionesAplicabilidadDetalle ? this.validExistData('permiso',permisos[p], criticidad) : 0;
              data.push(valor);
            }
            break;
            case 'reportes':
              //data = [6, 3, 5, 15, 4, 13, 50];
              let reportes = this.getCategoryCumplimientoAtributo('reportes');
              for (let r = 0; r < reportes.length; r++) {
                valor = this.dashboard && this.dashboard.obligacionesAplicabilidadDetalle ? this.validExistData('reporte',reportes[r], criticidad) : 0;
                data.push(valor);
              }
              break;
              
            case 'monitoreos':
              //data = [0, 1, 1, 1, 2, 1, 1, 5];
              let monitoreos = this.getCategoryCumplimientoAtributo('monitoreos');
              for (let m = 0; m < monitoreos.length; m++) {
                valor = this.dashboard && this.dashboard.obligacionesAplicabilidadDetalle ? this.validExistData('monitoreo',monitoreos[m], criticidad) : 0;
                data.push(valor);
              }
              break;
  
            case 'otros':
              data = [23, 63, 28, 321];
              break;
        
          default:
            break;
        }
      /*}else{
        switch (atributo) {
          case 'permisos':
            switch (this.tipo) {
              case 'No Cumple':
                data = [3, 1, 2, 2, 2, 3, 2, 55];    
                break;
              case 'Cumple':
                data = [6, 5];    
                break;
                case 'Cumple Parcial':
                  data = [7, 20];    
                  break;
                  case 'No Evaluado':
                    data = [7, 20];    
                    break;
            
              default:
                  data = [6, 5, 7, 20, 3, 1, 2, 2, 2, 3, 2, 55];
                break;
            }
            
            break;
            
          case 'reportes':
            switch (this.tipo) {
              case 'No Cumple':
                data = [13];    
                break;
              case 'Cumple':
                data = [6, 3];    
                break;
                case 'Cumple Parcial':
                  data = [5, 15, 4];    
                  break;
                  case 'No Evaluado':
                    data = [50];    
                    break;
            
              default:
                  data = [6, 3, 5, 15, 4, 13, 50];
                break;
            }
            
            break;
            
            
          case 'monitoreos':
            switch (this.tipo) {
              case 'No Cumple':
                data = [1, 1];    
                break;
              case 'Cumple':
                data = [0, 1];    
                break;
                case 'Cumple Parcial':
                  data = [1, 1, 2];    
                  break;
                  case 'No Evaluado':
                    data = [5];    
                    break;
            
              default:
                  data = [0, 1, 1, 1, 2, 1, 1, 5];
                break;
            }
            
            break;
            
          case 'otros':
            switch (this.tipo) {
              case 'No Cumple':
                data = [28];    
                break;
              case 'Cumple':
                data = [23];    
                break;
                case 'Cumple Parcial':
                  data = [63];    
                  break;
                  case 'No Evaluado':
                    data = [321];    
                    break;
            
              default:
                  data = [23, 63, 28, 321];
                break;
            }
            break;
                   
            default:
            break;
                   
          }
        }*/

        return data;

  }

  getDataTipo(tipo: any, dato: any){
    switch (dato) {
      case 'cuerpos':
        switch (tipo) {
          case 'Cumple':
            return 'cuerpos_cumple';
            break;
            case 'No Cumple':
              return 'cuerpos_no_cumple';
              break;
              case 'Cumple Parcial':
                return 'cuerpos_cumple_parcial';
                break;
                case 'No Evaluado':
                  return 'cuerpos_no_evaluados';
                  break;
        
          default:
            break;
        }
        break;
        
      case 'articulos':
        switch (tipo) {
          case 'Cumple':
            return 'articulos_cumple';
            break;
            case 'No Cumple':
              return 'articulos_no_cumple';
              break;
              case 'Cumple Parcial':
                return 'articulos_cumple_parcial';
                break;
                case 'No Evaluado':
                  return 'articulos_no_evaluados';
                  break;
        
          default:
            break;
        }
        break;
        
        case 'instancias':
          switch (tipo) {
            case 'Cumple':
              return 'instancias_cumple';
              break;
              case 'No Cumple':
                return 'instancias_no_cumple';
                break;
                case 'Cumple Parcial':
                  return 'instancias_cumple_parcial';
                  break;
                  case 'No Evaluado':
                    return 'instancias_no_evaluadas';
                    break;
          
            default:
              break;
          }
          break;
          
        
        case 'elementos':
          switch (tipo) {
            case 'Cumple':
              return 'elementos_cumple';
              break;
              case 'No Cumple':
                return 'elementos_no_cumple';
                break;
                case 'Cumple Parcial':
                  return 'elementos_cumple_parcial';
                  break;
                  case 'No Evaluado':
                    return 'elementos_no_evaluados';
                    break;
          
            default:
              break;
          }
          break;

          case 'permisos':
            switch (tipo) {
              case 'Cumple':
                return 'permisos_cumple';
                break;
                case 'No Cumple':
                  return 'permisos_no_cumple';
                  break;
                  case 'Cumple Parcial':
                    return 'permisos_cumple_parcial';
                    break;
                    case 'No Evaluado':
                      return 'permisos_no_evaluados';
                      break;
            
              default:
                break;
            }
            break;

            case 'reportes':
              switch (tipo) {
                case 'Cumple':
                  return 'reportes_cumple';
                  break;
                  case 'No Cumple':
                    return 'reportes_no_cumple';
                    break;
                    case 'Cumple Parcial':
                      return 'reportes_cumple_parcial';
                      break;
                      case 'No Evaluado':
                        return 'reportes_no_evaluados';
                        break;
              
                default:
                  break;
              }
              break;

              case 'monitoreos':
                switch (tipo) {
                  case 'Cumple':
                    return 'monitoreos_cumple';
                    break;
                    case 'No Cumple':
                      return 'monitoreos_no_cumple';
                      break;
                      case 'Cumple Parcial':
                        return 'monitoreos_cumple_parcial';
                        break;
                        case 'No Evaluado':
                          return 'monitoreos_no_evaluados';
                          break;
                
                  default:
                    break;
                }
                break;

                case 'otros':
                  switch (tipo) {
                    case 'Cumple':
                      return 'otros_cumple';
                      break;
                      case 'No Cumple':
                        return 'otros_no_cumple';
                        break;
                        case 'Cumple Parcial':
                          return 'otros_cumple_parcial';
                          break;
                          case 'No Evaluado':
                            return 'otros_no_evaluados';
                            break;
                  
                    default:
                      break;
                  }
                  break;
    
      default:
        break;
    }

    return dato+'_evaluados';
  }

getChart(criticidad: any, config: any){
  let objeto: any = config;

  switch (criticidad) {
    case 'Alta':
      objeto.stacked = false;
      break;
    
    case 'Media':
      objeto.stacked = false;
      break;
        
    case 'Baja':
      objeto.stacked = false;
      break;
        
    case 'No especificado':
      objeto.stacked = false;
      break;
        
    case 'Todos':
      objeto.stacked = true;
      break;
  
    default:
      objeto.stacked = true;//false;
      break;
  }

  return objeto;
}

  getSeries(criticidad: any, objeto: any){
    switch (criticidad) {
      case 'Alta':
        return objeto.seriesAlta;
        break;
      
      case 'Media':
        return objeto.seriesMedia;
        break;
          
      case 'Baja':
        return objeto.seriesBaja;
        break;
          
        case 'No especificado':
          return objeto.seriesOtros;
          break;
          
        case 'Todos':
          return objeto.seriesCriticidad;
          break;
    
      default:
        return objeto.series;
        break;
    }
  }

  getTipoTag(type?: any, tag?: any){
    switch (type) {
      case 'Cumple':
        tag = tag+'_cumple';
        break;
        case 'Cumple Parcial':        
          tag = tag+'_cumple_parcial';
          break;
          case 'No Cumple':        
            tag = tag+'_no_cumple';
            break;
          
            case 'No Evaluado':        
            tag = tag == 'instancias' ? tag+'_no_evaluadas' : tag+'_no_evaluados';
            break;
    
      default:
        break;
    }

    return tag;
  }

  getDataDashboard(type: any){
    if(this.dashboard){
      switch (type) {
        case 'cuerpos':
          return this.dashboard.tarjetas.countCuerpoLegal;
          break;
          
        case 'cuerpos_evaluados':
            return this.dashboard.estadoCuerposLegales.countEvaluados;
            break;
          
        case 'cuerpos_no_evaluados':
            return /*this.dashboard_new && this.dashboard_new.torta1 && this.dashboard_new.torta1.noEvaluado > 0 ? this.dashboard_new.torta1.noEvaluado : 0;*/this.dashboard.estadoCuerposLegales.countNoEvaluados;
            break;
        
        case 'cuerpos_cumple':
            return /*this.dashboard_new && this.dashboard_new.torta1 && this.dashboard_new.torta1.cumple > 0 ? this.dashboard_new.torta1.cumple : 0;*/this.dashboard.estadoCuerposLegales.countCumple;
            break;
        
        case 'cuerpos_no_cumple':
            return /*this.dashboard_new && this.dashboard_new.torta1 && this.dashboard_new.torta1.noCumple > 0 ? this.dashboard_new.torta1.noCumple : 0;*/this.dashboard.estadoCuerposLegales.countNoCumple;
            break;
        
        case 'cuerpos_cumple_parcial':
            return /*this.dashboard_new && this.dashboard_new.torta1 && this.dashboard_new.torta1.cumpleParcial > 0 ? this.dashboard_new.torta1.cumpleParcial : 0;*/this.dashboard.estadoCuerposLegales.countCumpleParcial;
            break;
          
        case 'cuerpos_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countCuerpoLegal > 0 ? ((/*(!this.tipo ?*/ this.dashboard.estadoCuerposLegales.countEvaluados/* : this.getDataDashboard(this.getTipoTag(this.tipo, 'cuerpos')))*/ * 100) / this.dashboard.tarjetas.countCuerpoLegal).toFixed() : 0;
            break;
        
        case 'articulos':
          return this.dashboard.tarjetas.countArticulos;
          break;
        
        case 'instancias':
          return this.dashboard.tarjetas.countInstanciasCumplimiento;
          break;
        
        case 'elementos':
          return this.dashboard.tarjetas.countInstalaciones;
          break;
          
        case 'elementos_evaluados':
          return this.dashboard.tarjetas.countElementosEvaluados;
          break;
        
        case 'elementos_cumplimiento':
          return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countInstalaciones > 0 ? ((this.dashboard.tarjetas.countElementosEvaluados * 100) / this.dashboard.tarjetas.countInstalaciones).toFixed() : 0;
          break;  

        case 'elementos_no_evaluados':
            return 3;
            break;
        
        case 'elementos_cumple':
              return 2;
              break;
          
        case 'elementos_no_cumple':
              return this.dashboard.tarjetas.countInstanciasNoCumple;
              break;
          
        case 'elementos_cumple_parcial':
              return 3;
              break;
            break;
          
        case 'permisos':
          return this.dashboard.tarjetas.countPermisos;
          break;
        
        case 'monitoreos':
            return this.dashboard.tarjetas.countMonitoreos;
            break;
        
        case 'reportes':
            return this.dashboard.tarjetas.countReportes;
            break;
        
        case 'otros':
            return this.dashboard.tarjetas.countOtrasObligaciones;
            break;
        
        case 'articulos_gestionar':
            return this.dashboard.tarjetas.countArticulosGestionar;
            break;
        
        case 'articulos_definir':
            return this.dashboard.tarjetas.countArticulosDefinir;
            break;

        case 'articulos_evaluados':
            return this.dashboard.tarjetas.countArticulosEvaluados;
            break;
                
        case 'articulos_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countArticulos > 0 ? ((/*(!this.tipo ?*/ this.dashboard.tarjetas.countArticulosEvaluados/* : this.getDataDashboard(this.getTipoTag(this.tipo, 'articulos')))*/ * 100) / this.dashboard.tarjetas.countArticulos).toFixed() : 0;
            break;
          
        case 'articulos_no_evaluados':
              return /*this.dashboard_new && this.dashboard_new.torta2 && this.dashboard_new.torta2.articuloNoEvaluado > 0 ? this.dashboard_new.torta2.articuloNoEvaluado : 0;*/this.dashboard.tarjetas.countArticulosNoEvaluados;
              break;
          
        case 'articulos_cumple':
              return /*this.dashboard_new && this.dashboard_new.torta2 && this.dashboard_new.torta2.articuloCumple > 0 ? this.dashboard_new.torta2.articuloCumple : 0;*/this.dashboard.tarjetas.countArticulosCumple;
              break;
          
        case 'articulos_no_cumple':
              return /*this.dashboard_new && this.dashboard_new.torta2 && this.dashboard_new.torta2.articuloNoCumple > 0 ? this.dashboard_new.torta2.articuloNoCumple : 0;*/this.dashboard.tarjetas.countArticulosNoCumple;
              break;
          
        case 'articulos_cumple_parcial':
              return /*this.dashboard_new && this.dashboard_new.torta2 && this.dashboard_new.torta2.articuloCumpleParcial > 0 ? this.dashboard_new.torta2.articuloCumpleParcial : 0;*/this.dashboard.tarjetas.countArticulosCumpleParcial;
              break;

        case 'articulos_alta':
              return this.dashboard.tarjetas.countArticulosAlta;
              break;
                
        case 'articulos_media':
              return this.dashboard.tarjetas.countArticulosMedia;
              break;
  
        case 'articulos_baja':
              return this.dashboard.tarjetas.countArticulosBaja;
              break;
                    
        case 'articulos_otros':
              return this.dashboard.tarjetas.countArticulosOtros;
              break;
        
        case 'instancias_gestionar':
            return this.dashboard.tarjetas.countInstanciasGestionar;
            break;
          
        case 'instancias_definir':
            return this.dashboard.tarjetas.countInstanciasDefinir;
            break;

        case 'instancias_evaluadas':
              return this.dashboard.tarjetas.countInstanciasEvaluadas;
              break;
  
        case 'instancias_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countInstanciasCumplimiento > 0 ? ((/*(!this.tipo ? */this.dashboard.tarjetas.countInstanciasEvaluadas/* : this.getDataDashboard(this.getTipoTag(this.tipo, 'instancias')))*/ * 100) / this.dashboard.tarjetas.countInstanciasCumplimiento).toFixed() : 0;
            break;

        case 'instancias_no_evaluadas':
              return /*this.dashboard_new && this.dashboard_new.torta3 && this.dashboard_new.torta3.noEvaluado > 0 ? this.dashboard_new.torta3.noEvaluado : 0;*/this.dashboard.tarjetas.countInstanciasNoEvaluadas;
              break;
          
        case 'instancias_cumple':
              return /*this.dashboard_new && this.dashboard_new.torta3 && this.dashboard_new.torta3.cumple > 0 ? this.dashboard_new.torta3.cumple : 0;*/this.dashboard.tarjetas.countInstanciasCumple;
              break;
          
        case 'instancias_no_cumple':
              return /*this.dashboard_new && this.dashboard_new.torta3 && this.dashboard_new.torta3.noCumple > 0 ? this.dashboard_new.torta3.noCumple : 0;*/this.dashboard.tarjetas.countInstanciasNoCumple;
              break;
          
        case 'instancias_cumple_parcial':
              return /*this.dashboard_new && this.dashboard_new.torta3 && this.dashboard_new.torta3.cumpleParcial > 0 ? this.dashboard_new.torta3.cumpleParcial : 0;*/this.dashboard.tarjetas.countInstanciasCumpleParcial;
              break;

        case 'cuerpos_gestionar':
            return this.dashboard.estadoCuerposLegales.countGestionar;
            break;

        case 'cuerpos_definir':
            return this.dashboard.estadoCuerposLegales.countDefinir;
            break;
        
        case 'cuerpos_alta':
            return this.dashboard.estadoCuerposLegales.countAlta;
            break;
  
        case 'cuerpos_media':
            return this.dashboard.estadoCuerposLegales.countMedia;
            break;

        case 'cuerpos_baja':
            return this.dashboard.estadoCuerposLegales.countBaja;
            break;
    
        case 'cuerpos_otros':
            return this.dashboard.estadoCuerposLegales.countOtros;
            break;

        case 'permisos_gestionar':
            return this.dashboard.obligacionesAplicabilidad.permiso.countGestionar;
            break;
          
        case 'permisos_definir':
            return this.dashboard.obligacionesAplicabilidad.permiso.countDefinir;
            break;

        case 'permisos_evaluados':
            return this.dashboard.obligacionesAplicabilidad.permiso.countEvaluados;
            break;
      
        case 'permisos_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countPermisos > 0 ? ((this.dashboard.obligacionesAplicabilidad.permiso.countEvaluados * 100) / this.dashboard.tarjetas.countPermisos).toFixed() : 0;
            break;

       case 'permisos_no_evaluados':
              return this.dashboard.obligacionesAplicabilidad.permiso.countNoEvaluados;
              break;
          
        case 'permisos_cumple':
              return this.dashboard.obligacionesAplicabilidad.permiso.countCumple;
              break;
          
        case 'permisos_no_cumple':
              return this.dashboard.tarjetas.countInstanciasNoCumple;
              break;
          
        case 'permisos_cumple_parcial':
              return this.dashboard.obligacionesAplicabilidad.permiso.countCumpleParcial;
              break;

        case 'permisos_alta':
            return this.dashboard.obligacionesAplicabilidad.permiso.countAlta;
            break;
              
        case 'permisos_media':
            return this.dashboard.obligacionesAplicabilidad.permiso.countMedia;
            break;

        case 'permisos_baja':
            return this.dashboard.obligacionesAplicabilidad.permiso.countBaja;
            break;
                  
        case 'permisos_otros':
            return this.dashboard.obligacionesAplicabilidad.permiso.countOtros;
            break;

        case 'reportes_gestionar':
            return this.dashboard.obligacionesAplicabilidad.reporte.countGestionar;
            break;
      
        case 'reportes_definir':
            return this.dashboard.obligacionesAplicabilidad.reporte.countDefinir;
            break;
        
        case 'reportes_evaluados':
            return this.dashboard.obligacionesAplicabilidad.reporte.countEvaluados;
            break;
        
        case 'reportes_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countReportes > 0 ? ((this.dashboard.obligacionesAplicabilidad.reporte.countEvaluados * 100) / this.dashboard.tarjetas.countReportes).toFixed() : 0;
        
        case 'reportes_no_evaluados':
              return this.dashboard.obligacionesAplicabilidad.reporte.countNoEvaluados;
              break;
          
        case 'reportes_cumple':
              return this.dashboard.obligacionesAplicabilidad.reporte.countCumple;
              break;
          
        case 'reportes_no_cumple':
              return this.dashboard.tarjetas.countInstanciasNoCumple;
              break;
          
        case 'reportes_cumple_parcial':
              return this.dashboard.obligacionesAplicabilidad.reporte.countCumpleParcial;
              break;
            break;
      
        case 'reportes_alta':
            return this.dashboard.obligacionesAplicabilidad.reporte.countAlta;
            break;
                
        case 'reportes_media':
            return this.dashboard.obligacionesAplicabilidad.reporte.countMedia;
            break;
  
        case 'reportes_baja':
            return this.dashboard.obligacionesAplicabilidad.reporte.countBaja;
            break;
                    
        case 'reportes_otros':
            return this.dashboard.obligacionesAplicabilidad.reporte.countOtros;
            break;

        case 'monitoreos_gestionar':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countGestionar;
            break;
      
        case 'monitoreos_definir':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countDefinir;
            break;
        
        case 'monitoreos_evaluados':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countEvaluados;
            break;
            
        case 'monitoreos_cumplimiento':
            return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countMonitoreos > 0 ? ((this.dashboard.obligacionesAplicabilidad.monitoreo.countEvaluados * 100) / this.dashboard.tarjetas.countMonitoreos).toFixed() : 0;
            break;

        case 'monitoreos_no_evaluados':
              return this.dashboard.obligacionesAplicabilidad.monitoreo.countNoEvaluados;
              break;
          
        case 'monitoreos_cumple':
              return this.dashboard.obligacionesAplicabilidad.monitoreo.countCumple;
              break;
          
        case 'monitoreos_no_cumple':
              return this.dashboard.tarjetas.countInstanciasNoCumple;
              break;
          
        case 'monitoreos_cumple_parcial':
              return this.dashboard.obligacionesAplicabilidad.monitoreo.countCumpleParcial;
              break;
            break;
    
        case 'monitoreos_alta':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countAlta;
            break;
                  
        case 'monitoreos_media':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countMedia;
            break;
    
        case 'monitoreos_baja':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countBaja;
            break;
                      
        case 'monitoreos_otros':
            return this.dashboard.obligacionesAplicabilidad.monitoreo.countOtros;
            break;

            case 'otros_evaluados':
              return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countEvaluados;
              break;
         
           case 'otros_no_evaluados':
               return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countNoEvaluadas;
               break;
           
           case 'otros_cumple':
              return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countCumple;
               break;
           
         case 'otros_no_cumple':
               return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countNoCumple;
               break;
           
         case 'otros_cumple_parcial':
               return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countCumpleParcial;
               break;
        
            case 'otros_cumplimiento':
             return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countOtrasObligaciones > 0 ? ((this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countEvaluados * 100) / this.dashboard.tarjetas.countOtrasObligaciones).toFixed() : 0;
              break;
    
            case 'otros_alta':
               return 10;//this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countAlta;
                break;
                        
            case 'otros_media':
               return 10;//this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countMedia;
                break;
          
            case 'otros_baja':
               return 4;//this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countBaja;
                break;
                            
            case 'otros_otros':
               return 4;//this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countOtros;
                break;
        
        /*case 'otros_gestionar':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countGestionar;
            break;
      
        case 'otros_definir':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countDefinir;
            break;

        case 'otros_evaluados':
          return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countEvaluados;
          break;
      
        case 'otros_no_evaluados': 
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countNoEvaluadas;
            break;
        
        case 'otros_cumple':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countCumple;
            break;
        
      case 'otros_no_cumple':
        return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countNoCumple;
            break;
        
      case 'otros_cumple_parcial':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countCumpleParcial;
            break;
    
        case 'otros_cumplimiento':
          return this.tipo && this.tipo == 'No Cumple' ? 0 : this.dashboard.tarjetas.countOtrasObligaciones > 0 ? ((this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countEvaluados * 100) / this.dashboard.tarjetas.countOtrasObligaciones).toFixed() : 0;
          break;

        case 'otros_alta':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countAlta;
            break;
                    
        case 'otros_media':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countMedia;
            break;
      
        case 'otros_baja':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countBaja;
            break;
                        
        case 'otros_otros':
            return this.dashboard.obligacionesAplicabilidad.otrasObligaciones.countOtros;
            break;*/

        case 'cuerpo_general':
              return this.dashboard.ambitoNormativo.cuerpoLegal.GENERAL ? this.dashboard.ambitoNormativo.cuerpoLegal.GENERAL : 0;
              break;

        case 'cuerpo_ma':
            return this.dashboard.ambitoNormativo.cuerpoLegal.MA ? this.dashboard.ambitoNormativo.cuerpoLegal.MA : 0;
            break;
        
        case 'cuerpo_energia':
            return this.dashboard.ambitoNormativo.cuerpoLegal.ENERGIA ? this.dashboard.ambitoNormativo.cuerpoLegal.ENERGIA : 0;
            break;
        
        case 'cuerpo_sst':
            return this.dashboard.ambitoNormativo.cuerpoLegal.SST ? this.dashboard.ambitoNormativo.cuerpoLegal.SST : 0;
            break;

        case 'cuerpo_laboral':
            return this.dashboard.ambitoNormativo.cuerpoLegal.LABORAL ? this.dashboard.ambitoNormativo.cuerpoLegal.LABORAL : 0;
            break;
            
        case 'general':
            return this.dashboard.ambitoNormativo.articulos.GENERAL ? this.dashboard.ambitoNormativo.articulos.GENERAL : 0;
            break;
            
        case 'ma':
            return this.dashboard.ambitoNormativo.articulos.MA ? this.dashboard.ambitoNormativo.articulos.MA : 0;
            break;
      
        case 'energia':
            return this.dashboard.ambitoNormativo.articulos.ENERGIA ? this.dashboard.ambitoNormativo.articulos.ENERGIA : 0;
            break;
      
        case 'sst':
            return this.dashboard.ambitoNormativo.articulos.SST ? this.dashboard.ambitoNormativo.articulos.SST : 0;
            break;
      
        case 'laboral':
            return this.dashboard.ambitoNormativo.articulos.LABORAL ? this.dashboard.ambitoNormativo.articulos.LABORAL : 0;
            break;
        
        case 'instancias_general':
              return this.dashboard.ambitoNormativo.instancias.GENERAL ? this.dashboard.ambitoNormativo.instancias.GENERAL : 0;
              break;

        case 'instancias_ma':
            return this.dashboard.ambitoNormativo.instancias.MA ? this.dashboard.ambitoNormativo.instancias.MA : 0;
            break;
        
        case 'instancias_energia':
            return this.dashboard.ambitoNormativo.instancias.ENERGIA ? this.dashboard.ambitoNormativo.instancias.ENERGIA : 0;
            break;
        
        case 'instancias_sst':
            return this.dashboard.ambitoNormativo.instancias.SST ? this.dashboard.ambitoNormativo.instancias.SST : 0;
            break;

        case 'instancias_laboral':
            return this.dashboard.ambitoNormativo.instancias.LABORAL ? this.dashboard.ambitoNormativo.instancias.LABORAL : 0;
            break;
            
        case 'alta':
          return this.dashboard.criticidad.countCriticidadAlta;
          break;
        case 'media':
          return this.dashboard.criticidad.countCriticidadMedia;
          break;
        case 'baja':
          return this.dashboard.criticidad.countCriticidadBaja;
          break;
        case 'sin_criticidad':
          return this.dashboard.tarjetas.countArticulos - this.dashboard.criticidad.countCriticidadBaja - this.dashboard.criticidad.countCriticidadAlta - this.dashboard.criticidad.countCriticidadMedia;
          break;
            
        default:
          break;
      }
    } else {
      return 0;
    }
  }

  getDataDashboardCuerpo(type: any){
    if(this.dashboardCuerpo){
      switch (type) {
        case 'cuerpos':
          return this.dashboardCuerpo.tarjetas.countCuerpoLegal;
          break;
        
        case 'articulos':
          return this.dashboardCuerpo.tarjetas.countArticulos;
          break;
        
        case 'instancias':
          return this.dashboardCuerpo.tarjetas.countInstanciasCumplimiento;
          break;
        
        case 'elementos':
          return this.dashboardCuerpo.tarjetas.countInstalaciones;
          break;

        case 'elementos_evaluados':
          return this.dashboardCuerpo.tarjetas.countElementosEvaluados;
          break;
        
        case 'elementos_cumplimiento':
          return this.dashboardCuerpo.tarjetas.countInstalaciones > 0 ? ((this.dashboardCuerpo.tarjetas.countElementosEvaluados * 100) / this.dashboardCuerpo.tarjetas.countInstalaciones).toFixed() : 0;
          break;
        
        case 'permisos':
          return this.dashboardCuerpo.tarjetas.countPermisos;
          break;
        
        case 'monitoreos':
            return this.dashboardCuerpo.tarjetas.countMonitoreos;
            break;
        
        case 'reportes':
            return this.dashboardCuerpo.tarjetas.countReportes;
            break;
        
        case 'otros':
            return this.dashboardCuerpo.tarjetas.countOtrasObligaciones;
            break;
            
        case 'articulos_evaluados':
          return this.dashboardCuerpo.tarjetas.countArticulosEvaluados;
          break;
            
        case 'articulos_cumplimiento':
          return this.dashboardCuerpo.tarjetas.countArticulos > 0 ? ((this.dashboardCuerpo.tarjetas.countArticulosEvaluados * 100) / this.dashboardCuerpo.tarjetas.countArticulos).toFixed() : 0;
          break;
        
        case 'articulos_gestionar':
            return this.dashboardCuerpo.tarjetas.countArticulosGestionar;
            break;
        
        case 'articulos_definir':
            return this.dashboardCuerpo.tarjetas.countArticulosDefinir;
            break;
        
        case 'instancias_evaluadas':
            return this.dashboardCuerpo.tarjetas.countInstanciasEvaluadas;
            break;

        case 'instancias_cumplimiento':
          return this.dashboardCuerpo.tarjetas.countInstanciasCumplimiento > 0 ? ((this.dashboardCuerpo.tarjetas.countInstanciasEvaluadas * 100) / this.dashboardCuerpo.tarjetas.countInstanciasCumplimiento).toFixed() : 0;
          break;
        
        case 'instancias_gestionar':
            return this.dashboardCuerpo.tarjetas.countInstanciasGestionar;
            break;
            
        case 'instancias_definir':
            return this.dashboardCuerpo.tarjetas.countInstanciasDefinir;
            break;

        case 'permisos_gestionar':
            return this.dashboardCuerpo.obligacionesAplicabilidad.permiso.countGestionar;
            break;

        case 'permisos_evaluados':
            return this.dashboardCuerpo.obligacionesAplicabilidad.permiso.countEvaluados;
            break;
      
        case 'permisos_cumplimiento':
            return this.dashboardCuerpo.tarjetas.countPermisos > 0 ? ((this.dashboardCuerpo.obligacionesAplicabilidad.permiso.countEvaluados * 100) / this.dashboardCuerpo.tarjetas.countPermisos).toFixed() : 0;
            break;
          
        case 'permisos_definir':
            return this.dashboardCuerpo.obligacionesAplicabilidad.permiso.countDefinir;
            break;

        case 'reportes_gestionar':
            return this.dashboardCuerpo.obligacionesAplicabilidad.reporte.countGestionar;
            break;
      
        case 'reportes_definir':
            return this.dashboardCuerpo.obligacionesAplicabilidad.reporte.countDefinir;
            break;
  
        case 'reportes_evaluados':
            return this.dashboardCuerpo.obligacionesAplicabilidad.reporte.countEvaluados;
            break;
      
        case 'reportes_cumplimiento':
            return this.dashboardCuerpo.tarjetas.countReportes > 0 ? ((this.dashboardCuerpo.obligacionesAplicabilidad.reporte.countEvaluados * 100) / this.dashboardCuerpo.tarjetas.countReportes).toFixed() : 0;
            break;

        case 'monitoreos_gestionar':
            return this.dashboardCuerpo.obligacionesAplicabilidad.monitoreo.countGestionar;
            break;
      
        case 'monitoreos_definir':
            return this.dashboardCuerpo.obligacionesAplicabilidad.monitoreo.countDefinir;
            break;
        
        case 'monitoreos_evaluados':
            return this.dashboardCuerpo.obligacionesAplicabilidad.monitoreo.countEvaluados;
            break;
        
        case 'monitoreos_cumplimiento':
            return this.dashboardCuerpo.tarjetas.countMonitoreos > 0 ? ((this.dashboardCuerpo.obligacionesAplicabilidad.monitoreo.countEvaluados * 100) / this.dashboardCuerpo.tarjetas.countMonitoreos).toFixed() : 0;
            break;

        case 'otros_gestionar':
            return this.dashboardCuerpo.obligacionesAplicabilidad.otrasObligaciones.countGestionar;
            break;
      
        case 'otros_definir':
            return this.dashboardCuerpo.obligacionesAplicabilidad.otrasObligaciones.countDefinir;
            break;
        
        case 'otros_evaluados':
            return this.dashboardCuerpo.obligacionesAplicabilidad.otrasObligaciones.countEvaluados;
            break;
      
          case 'otros_cumplimiento':
            return this.dashboardCuerpo.tarjetas.countOtrasObligaciones > 0 ? ((this.dashboardCuerpo.obligacionesAplicabilidad.otrasObligaciones.countEvaluados * 100) / this.dashboardCuerpo.tarjetas.countOtrasObligaciones).toFixed() : 0;
            break;

        case 'cuerpo_ma':
            return this.dashboardCuerpo.ambitoNormativo.cuerpoLegal.MA;
            break;
        
        case 'cuerpo_energia':
            return this.dashboardCuerpo.ambitoNormativo.cuerpoLegal.ENERGIA;
            break;
        
        case 'cuerpo_sso':
            return this.dashboardCuerpo.ambitoNormativo.cuerpoLegal.SSO;
            break;
            
        case 'ma':
            return this.dashboardCuerpo.ambitoNormativo.articulos.MA;
            break;
      
        case 'energia':
            return this.dashboardCuerpo.ambitoNormativo.articulos.ENERGIA;
            break;
      
        case 'sso':
            return this.dashboardCuerpo.ambitoNormativo.articulos.SSO;
            break;
            
        default:
          break;
      }
    } else {
      return 0;
    }
  }

    getDataDashboardArea(parametro: any, type?: any, criticidad?: any){
    if(this.dashboardArea){

      let data: any = [];
      let data_type: any = [];

      switch (type) {
        case 'general':
          data_type = this.dashboardArea.general;
          break;
        case 'permisos':
          data_type = this.dashboardArea.permisos;
          break;
        case 'reportes':
          data_type = this.dashboardArea.reportes;
          break;
        case 'monitoreos':
          data_type = this.dashboardArea.monitoreos;
          break;
        case 'otros':
          data_type = this.dashboardArea.otrasObligaciones;
          break;
        /*case 'alta':
          data_type = this.dashboardArea.general;//this.dashboardArea.criticidad.criticidadAlta;
          break;
        case 'media':
          data_type = this.dashboardArea.general;//this.dashboardArea.criticidad.criticidadMedia;
          break;
        case 'baja':
          data_type = this.dashboardArea.general;//this.dashboardArea.criticidad.criticidadBaja;
          break;*/
        
        default:
          break;
      }

      for (let x = 0; x < data_type.length; x++) {
        
        switch (parametro) {
          case 'label':
            data.push(data_type[x].nombreArea);
            break;
          
          case 'value':
            if(criticidad){
              data.push(data_type[x].criticidad[criticidad]);
            }else{
              switch (this.tipo) {
                case 'Gestionar':              
                  data.push(data_type[x].total_gestionar);
                  break;
                case 'Por definir':              
                    data.push(data_type[x].total_definir);
                    break;
              
                default:
                  data.push(data_type[x].total);
                  break;
              }
            }
            break;
              
          default:
            break;
        }
      }

      return data;
    } else {
      return [];
    }
  }

  getDataDashboardInstallation(parametro: any, type?: any, criticidad?: any){
    if(this.dashboardInstallation){

      let data: any = [];
      let data_type: any = [];

      switch (type) {
        case 'general':
          data_type = this.dashboardInstallation.general;
          break;
        case 'permisos':
          data_type = this.dashboardInstallation.permisos;
          break;
        case 'reportes':
          data_type = this.dashboardInstallation.reportes;
          break;
        case 'monitoreos':
          data_type = this.dashboardInstallation.monitoreos;
          break;
        case 'otros':
          data_type = this.dashboardInstallation.otrasObligaciones;
          break;
      
        default:
          break;
      }
      
      for (let x = 0; x < data_type.length; x++) {
        
        switch (parametro) {
          case 'label':
            //if((criticidad && data_type[x].criticidad[criticidad] > 0) || (!criticidad && data_type[x].total > 0)){
              data.push(data_type[x].nombre);
            //}
            break;
          
          case 'value':
            if(criticidad/* && data_type[x].criticidad[criticidad] > 0*/){
              data.push(data_type[x].criticidad[criticidad]);
            }else{
              
              switch (this.tipo) {
                case 'Gestionar':              
                    //if(data_type[x].total_gestionar > 0){
                      data.push(data_type[x].total_gestionar);
                    //}
                  break;
                  case 'Por definir':              
                      //if(data_type[x].total_definir > 0){
                        data.push(data_type[x].total_definir);
                      //}
                    break;
              
                default:
                    //if(data_type[x].total > 0){
                    data.push(data_type[x].total);
                    //}
                  break;
              }
            }
            break;
              
          default:
            break;
        }
      }

      return data;
    } else {
      return [];
    }
  }

  getDataDashboardAreaCuerpo(parametro: any, type?: any, criticidad?: any){
    if(this.dashboardAreaCuerpo){

      let data: any = [];
      let data_type: any = [];

      switch (type) {
        case 'general':
          data_type = this.dashboardAreaCuerpo.general;
          break;
      
        default:
          break;
      }
      
      for (let x = 0; x < data_type.length; x++) {
        
        switch (parametro) {
          case 'label':
            data.push(data_type[x].nombreArea);
            break;
          
          case 'value':
            if(criticidad){
              data.push(data_type[x].criticidad[criticidad]);
            }else{
              
              switch (this.tipo_cuerpo) {
                case 'Gestionar':              
                  data.push(data_type[x].total_gestionar);
                  break;
                  case 'Por definir':              
                    data.push(data_type[x].total_definir);
                    break;
              
                default:
                  data.push(data_type[x].total);
                  break;
              }
            }
            break;
              
          default:
            break;
        }
      }

      return data;
    } else {
      return [];
    }
  }

  getDataDashboardInstallationCuerpo(parametro: any, type?: any, criticidad?: any){
    if(this.dashboardInstallationCuerpo){

      let data: any = [];
      let data_type: any = [];

      switch (type) {
        case 'general':
          data_type = this.dashboardInstallationCuerpo.general;
          break;
      
        default:
          break;
      }
      
      for (let x = 0; x < data_type.length; x++) {
        
        switch (parametro) {
          case 'label':
            data.push(data_type[x].nombre);
            break;
          
          case 'value':
            if(criticidad){
              data.push(data_type[x].criticidad[criticidad]);
            }else{
              switch (this.tipo_cuerpo) {
                case 'Gestionar':              
                  data.push(data_type[x].total_gestionar);
                  break;
                  case 'Por definir':              
                    data.push(data_type[x].total_definir);
                    break;
              
                default:
                  data.push(data_type[x].total);
                  break;
              }
            }
            break;
              
          default:
            break;
        }
      }

      return data;
    } else {
      return [];
    }
  }
  

  private resetFiltro(project_id?: any, refresh?: boolean, areaId?: any/*, atributo?: any*/, criticidad?: any){
    
    //this.getDashboardNew(project_id, refresh, areaId, criticidad, this.tipo);
    this.getDashboard(project_id, refresh, areaId/*, atributo*/, criticidad);
    this.getDashboardArea(project_id, 'articulos', refresh, undefined,areaId, undefined, criticidad); //cuerpoLegal, articulos, instancias
    this.getDashboardInstalaciones(project_id, 'articulos', refresh, undefined, areaId, undefined, criticidad);

  }

  private resetFiltroCuerpo(project_id?: any, cuerpoId?: any, refresh?: boolean, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){

    atributo = atributo ? atributo.toLowerCase() : atributo;
    
    this.getDashboardCuerpo(project_id, cuerpoId, refresh, areaId, atributo, criticidad, articuloId);
    this.getDashboardAreaCuerpo(project_id, 'instancias', cuerpoId, refresh, areaId, atributo, criticidad, articuloId);
    this.getDashboardInstallationCuerpo(project_id, 'instancias',cuerpoId, refresh, areaId, atributo, criticidad, articuloId);
  }

  private setChart(){

    this._basicBarChartGeneral('["--vz-info"]');
    this._basicBarChartGeneralInstallation('["--vz-info"]');
    this._basicBarChartAtributos('["--vz-info"]');
    this._basicBarChartAtributosInstallations('["--vz-info"]');
    this._basicBarChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
    this._basicBarChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');
    
    this._simpleDonutChartArticulos('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartInstancias('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartMonitoreos('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartReportes('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartPermisos('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartOtros('["--vz-success", "--vz-warning", "--vz-danger","--vz-gray"]');
    this._simpleDonutChartArticulosAmbito('["--vz-success", "--vz-warning", "--vz-danger", "--vz-info","--vz-primary"]');
    this._simpleDonutChartCuerposAmbito('["--vz-success", "--vz-warning", "--vz-danger","--vz-primary", "--vz-info"]');
    this._simpleDonutChartInstanciasAmbito('["--vz-success", "--vz-warning", "--vz-danger", "--vz-primary", "--vz-info"]');
    
    this._stacked100BarChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
    this._stacked100BarChartArticulos('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
    this._stacked100BarChartInstancias('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
    this._stacked100BarChartAtributos('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
    this._stacked100BarChartAmbienteCriticidad('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
  
    this._basicBarChartGeneralCuerpos('["--vz-info"]');
    this._basicBarChartGeneralCuerposInstallation('["--vz-info"]');
  }

  getAreas(idProject?: any) {
    this.projectsService.getAreasUser()/*getAreas(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.areas = data.data;
          this.areas_chart = data.data;
      },
      (error: any) => {
      });
  }
  
  private setArticulos(articulos: any){

    articulos.forEach((x: any) => {
      
      this.articulos.push(x);
      if(x.hijas){
        this.setArticulos(x.hijas);
      }
    
    });

  }

  private getArticleProyect(project_id: any, refresh?: boolean){

    this.showPreLoader();
    this.projectsService.getArticleProyect(project_id).pipe().subscribe(
      (data: any) => {
        const articles_proyects = data.data;

        this.articles_proyects_group = [];
        this.articulos = [];
        articles_proyects.forEach((x: any) => {

          this.articulos.push(x);
          if(x.hijas){
            this.setArticulos(x.hijas);
          }
          
          const index = this.articles_proyects_group.findIndex(
            (co: any) =>
              co.normaId == x.normaId
          );

          if(index == -1){
            this.articles_proyects_group.push({
              cuerpoLegal: x.cuerpoLegal, organismo: x.organismo, normaId: x.normaId, encabezado: x.encabezado, tituloNorma: x.tituloNorma, ambito: x.ambito, proyectoId: x.proyectoId, articulos: [x]
            });

          }else{
            this.articles_proyects_group[index].articulos.push(x);
          }

        });

        //if(refresh){
          this.setChartCuerpo();
        //}

        this.hidePreLoader();
    },
    (error: any) => {
      this.hidePreLoader();
      //this.error = error ? error : '';
    });
    //document.getElementById('elmLoader')?.classList.add('d-none')
}

  getArticulos(){
    this.articles_filter = [];
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2') && ins.normaId == this.filtro_cuerpoId
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

  selectCriticidad(criticidad?: any){
    this.criticidad = criticidad;

    //this.resetFiltro(this.project_id, true, this.filtro_area, /*this.tipo,*/ criticidad);
    
    this.setChart();
  }

  selectCriticidadCuerpo(criticidad?: any){
    this.criticidad_cuerpo = criticidad;
    
    this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), this.filtro_atributo, criticidad,this.filtro_articuloId);
    
    this.setChart();
  }

  selectTipo(tipo?: any){
    this.tipo = tipo;

    //this.getDashboardNew(this.project_id, true, this.filtro_area, this.criticidad, tipo);

    this.setChart();
    //this.getDashboard(this.project_id, this.filtro_area, tipo, this.criticidad);
  }

  selectTipoCuerpo(tipo?: any){
    this.tipo_cuerpo = tipo;

    this.setChart();
  }

  selectAtributoFiltro(atributo?: any){
    this.filtro_atributo = atributo;
    
    if(atributo){
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), atributo, this.criticidad_cuerpo,this.filtro_articuloId);
    }else{
      
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), undefined, this.criticidad_cuerpo,this.filtro_articuloId);
    }
  }

  selectCuerpoFiltro(cuerpo?: any, normaId?: any){
    this.filtro_cuerpo = cuerpo;
    this.filtro_cuerpoId = normaId;
  
    if(cuerpo){
  
      this.getArticulos();    
      this.resetFiltroCuerpo(this.project_id, normaId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), this.tipo_cuerpo, this.criticidad_cuerpo,this.filtro_articuloId);

      /*const index = this.articles_proyects_group.findIndex(
        (ap: any) =>
          ap.cuerpoLegal == cuerpo
      );

      if(index != -1){
        this.articulos_chart = this.articles_proyects_group[index].articulos;
      }*/
    }/*else{
        this.articulos_chart = [];
    }*/

  }
  
  selectProjectFiltro(id?: any, nombre?: any){
    this.filtro_proyectoId = id > 0 ? id : null;
    this.filtro_proyecto = id > 0 ? nombre : null;
    
    if(id > 0){
      
      this.project_id = id;
            
      this.getProject(id);    
      this.getAreas(id);
      this.getEvaluations(id);
      this.getInstallations(id);
      
      this.resetFiltro(this.project_id, true, this.filtro_area, this. criticidad);
    
      this.setChart();
    }else{
      
      /*this.resetFiltro(this.project_id, true, this.filtro_area, this. criticidad);
    
      this.setChart();*/
    }
  }

  selectArticuloFiltro(id?: any, articulo?: any){
    this.filtro_articuloId = id > 0 ? id : null;
    this.filtro_articulo = id > 0 ? articulo : null;
    
    if(id > 0){
      
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), this.tipo_cuerpo, this.criticidad_cuerpo, id);
    }else{
      
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, (this.filtro_area_cuerpo ? this.filtro_area_cuerpo.id : null), this.tipo_cuerpo, this.criticidad_cuerpo);
    }
  }
  
  selectGestion(x: any) {
    this.select_gestion = x;
    this.getDashboardArea(this.project_id, x, true);
    /*if (x == 'all') {
        this.basicBarChart.series = [{
            data: [1010, 1640, 490, 1255, 1050, 689, 800, 420, 1085, 589],
            name: 'Sessions',
        }]
    }
    if (x == '1M') {
        this.basicBarChart.series = [{
            data: [200, 640, 490, 255, 50, 689, 800, 420, 85, 589],
            name: 'Sessions',
        }]
    }
    if (x == '6M') {
        this.basicBarChart.series = [{
            data: [1010, 1640, 490, 1255, 1050, 689, 800, 420, 1085, 589],
            name: 'Sessions',
        }]
    }*/
  }

  selectGestionInstalacion(x: any) {
    this.select_gestion_instalacion = x;
    this.getDashboardInstalaciones(this.project_id, x, true);
  }
  
  selectAreaChart(id?: any){
    const existe_area = this.areas_chart.findIndex(
      (arc: any) =>
        arc.id == id
    );

    this.filtro_area = id;

    if(existe_area != -1){
      this.resetFiltro(this.project_id, true, id, /*this.tipo,*/ this.criticidad);

      this.areas_select_chart.push({id: id, nombre: this.areas_chart[existe_area].nombre});
      this.getChildrenChart(id);
    }else{
      this.resetFiltro(this.project_id, true);
    }
    this.setChart();
  }
  
  selectAreaChartCuerpo(id?: any, nombre?: any){
    this.filtro_area_cuerpo = id > 0 ? {id: id, nombre: nombre} : null;
    
    if(id > 0){
      
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, id, this.tipo_cuerpo, this.criticidad_cuerpo, this.filtro_articuloId);
    }else{
      
      this.resetFiltroCuerpo(this.project_id, this.filtro_cuerpoId, true, null, this.tipo_cuerpo, this.criticidad_cuerpo, this.filtro_articuloId);
    }
  }
  
  deleteAreaChart(id: any){
    
    //event.style.display='none';

    const existe_area = this.areas_select_chart.findIndex(
      (arc: any) =>
        arc.id == id
    );

    const chart_length: any = this.areas_select_chart.length;

    //for (let p = 0; p < chart_length; p++) {
      //if(p >= existe_area){
        this.areas_select_chart.splice(existe_area, chart_length - existe_area/*1*/);
      //}
    //}

    if(this.areas_select_chart.length > 0){
      
      this.resetFiltro(this.project_id, true, this.areas_select_chart[(this.areas_select_chart.length - 1)].id, /*this.tipo,*/ this.criticidad);

      this.filtro_area = this.areas_select_chart[(this.areas_select_chart.length - 1)].id;

      this.getChildrenChart(this.areas_select_chart[(this.areas_select_chart.length - 1)].id);
    }else{
      
      this.resetFiltro(this.project_id, true, undefined, /*this.tipo,*/ this.criticidad);

      this.filtro_area = undefined;
      this.areas_chart = this.areas;
    }
    
    this.setChart();

  }

  setChartCuerpo(){
    if(this.articles_proyects_group.length > 0){
      this.filtro_cuerpo = this.articles_proyects_group[0].cuerpoLegal;
      this.filtro_cuerpoId = this.articles_proyects_group[0].normaId;

      this.getArticulos();
      this.getDashboardCuerpo(this.project_id, this.articles_proyects_group[0].normaId);
      this.getDashboardAreaCuerpo(this.project_id, 'instancias',this.articles_proyects_group[0].normaId);
      this.getDashboardInstallationCuerpo(this.project_id, 'instancias',this.articles_proyects_group[0].normaId);
    }
  }

  getDashboardNew(idProject?: any, refresh?: boolean, areaId?: any, criticidad?: any, cumplimiento?: any){

    const filter = cumplimiento ? cumplimiento : undefined;

    this.projectsService.getDashboardEvaluationsNew(idProject, filter, undefined, areaId, undefined, criticidad).pipe().subscribe(
      (data: any) => {
       console.log('dataDashboardNew',data);
       this.dashboard_new = data.data;
       
       if(refresh){
         this.setChart();
       }
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
 }

  getDashboard(idProject?: any, refresh?: boolean, areaId?: any, /*atributo?: any,*/ criticidad?: any){
    this.projectsService.getDashboardEvaluations(idProject, undefined, areaId, undefined, criticidad).pipe().subscribe(
      (data: any) => {
       console.log('dataDashboard',data);
       this.dashboard = data.data;
       
       if(refresh){
         this.setChart();
       }
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
 }

 getDashboardCuerpo(idProject?: any, cuerpoId?: any, refresh?: boolean, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
     this.projectsService.getDashboardEvaluations(idProject, cuerpoId, areaId, atributo, criticidad, articuloId).pipe().subscribe(
       (data: any) => {
        console.log('dataDashboardCuerpo',data);
        this.dashboardCuerpo = data.data;
        
       if(refresh){
         this.setChart();
       }
     },
     (error: any) => {
       //this.error = error ? error : '';
       //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
     });
  }

 getDashboardArea(idProject?: any, type?: any, refresh?: boolean, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any){
     this.projectsService.getDashboardAreaEvaluations(idProject, type, cuerpoId, areaId, atributo, criticidad).pipe().subscribe(
       (data: any) => {
         console.log('dataDashboardArea',data);
         this.dashboardArea = data.data;
         if(refresh){
           this._basicBarChartGeneral('["--vz-info"]');
           this._basicBarChartAtributos('["--vz-info"]');
         }
         //this.project = data.data;
     },
     (error: any) => {
       //this.error = error ? error : '';
       //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
     });
  }
  
 getDashboardInstalaciones(idProject?: any, type?: any, refresh?: boolean, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any){
   this.projectsService.getDashboardInstalations(idProject, type, cuerpoId, areaId, atributo, criticidad).pipe().subscribe(
     (data: any) => {
       console.log('dataDashboardInstalaciones',data);
       this.dashboardInstallation = data.data;
       //if(refresh){
         this._basicBarChartGeneralInstallation('["--vz-info"]');
         this._basicBarChartAtributosInstallations('["--vz-info"]');
       //}
       //this.project = data.data;
   },
   (error: any) => {
     //this.error = error ? error : '';
     //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
   });
}

  getDashboardAreaCuerpo(idProject?: any, type?: any, cuerpoId?: any, refresh?: boolean, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
      this.projectsService./*getDashboardAreaByCuerpo*/getDashboardAreaEvaluations(idProject, type, cuerpoId, areaId, atributo, criticidad, articuloId).pipe().subscribe(
        (data: any) => {
          console.log('dataDashboardAreaCuerpo',data);
          this.dashboardAreaCuerpo = data.data;
          //if(refresh){
            this._basicBarChartGeneralCuerpos('["--vz-info"]');
          //}
          //this.project = data.data;
      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
   }
   

   getDashboardInstallationCuerpo(idProject?: any, type?: any, cuerpoId?: any, refresh?: boolean, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
     this.projectsService./*getDashboardInstallationByCuerpo*/getDashboardInstalations(idProject, type, cuerpoId, areaId, atributo, criticidad, articuloId).pipe().subscribe(
       (data: any) => {
         console.log('dataDashboardInstallationCuerpo',data);
         this.dashboardInstallationCuerpo = data.data;
         //if(refresh){
           this._basicBarChartGeneralCuerposInstallation('["--vz-info"]');
         //}
         //this.project = data.data;
     },
     (error: any) => {
       //this.error = error ? error : '';
       //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
     });
  }

  
  getChildrenChart(padre_id: any){
    this.areas_chart = [];
    if(padre_id > 0){
      this.showPreLoader();
      this.projectsService.getAreasItems(padre_id).pipe().subscribe(
        (data: any) => {
          if(data.data.length > 0){
            this.areas_chart = data.data;
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

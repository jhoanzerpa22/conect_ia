import { Component, OnInit, ViewChild } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from '../data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { round } from 'lodash';

// Sweet Alert
import Swal from 'sweetalert2';

import { estadosData } from '../../../projects/estados';

@Component({
  selector: 'app-evaluations',
  templateUrl: './project-evaluations.component.html',
  styleUrls: ['./project-evaluations.component.scss']
})

/**
 * Projects Component
 */
export class ProjectEvaluationsComponent implements OnInit {

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
  
  finalizeDate: Date = new Date();
  evaluations: any = {};
  
  estados_default: any = estadosData;

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService) {
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Evaluación' },
      { label: 'Cumplimiento', active: true }
    ];

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.getProject(params['id']);
      this.getEvaluations(params['id']);
      this.getInstallations(params['id']);
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
  }

  ngAfterViewInit() {
    //this.scrollRef.SimpleBar.getScrollElement().scrollTop = 600;
  }

  goDetail(id: any){
    this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+id+'/Detail']);
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
              let articulos_group: any = [];

              for (var j = 0; j < obj[i].installations_articles.length; j++) { 
                if(obj[i].installations_articles[j].proyectoId == this.project_id && (obj[i].installations_articles[j].estado == '1' || obj[i].installations_articles[j].estado == '2')){
                  
                  const index = articulos_group.findIndex(
                    (ar: any) =>
                      ar == obj[i].installations_articles[j].articuloId
                  );
              
                  if(index == -1){
                    articulos_group.push(obj[i].installations_articles[j].articuloId);

                  total_articulos.push(obj[i].installations_articles[j]);
                  
                  const index = total_cuerpos.findIndex(
                    (cu: any) =>
                      cu == obj[i].installations_articles[j].cuerpoLegal
                  );

                  if(index == -1){
                    total_cuerpos.push(obj[i].installations_articles[j].cuerpoLegal);
                  }

                  //for (var v = 0; v < obj[i].installations_articles[j].evaluations.length; v++) {
                    if(obj[i].installations_articles[j].evaluations.length > 0){
                      if(obj[i].installations_articles[j].evaluations[0].estado){
                        switch (this.getCategoryStatus(obj[i].installations_articles[j].evaluations[0].estado)) {
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
              }

              if(total_articulos.length > 0){
                this.installations_articles.push(obj[i].installations_articles[j]);
              }
              }
              obj[i].total_articulos = total_articulos.length;
              obj[i].total_cuerpos = total_cuerpos.length;
              let avance: any = total_articulos.length > 0 ? ((((cuerpo_cumple * 100) + (cuerpo_nocumple * 100/** 0*/) + (cuerpo_parcial * 100/** 50*/)) * 100) / (total_articulos.length * 100)) : 0;
              obj[i].avance = round(avance, 0);
              if(total_articulos.length > 0){
                avance_total += obj[i].avance > 0 ? obj[i].avance : 0;
                lista.push(obj[i]);
                
                if(cuerpo_cumple > cuerpo_parcial && cuerpo_cumple > cuerpo_nocumple){
                  cumple_norma ++;
                }else if(cuerpo_nocumple > cuerpo_parcial && cuerpo_nocumple > cuerpo_cumple){
                  cuerpo_nocumple ++;
                }else{
                  cuerpo_parcial ++;
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
          //console.log('avance_evaluacion',this.avance_evaluacion);
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
  
  goControl(){
    this._router.navigate(['/'+this.project_id+'/project-control']);
  }
  
  goDashboard(){
    this._router.navigate(['/'+this.project_id+'/project-dashboard/resumen/evaluation']);
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
      this._router.navigate(['/'+this.project_id+'/project-dashboard']);
    }else{

      if(this.avance_evaluacion < 90){

      Swal.fire({
        /*title: '¿Deseas finalizar la evaluación? Tienes obligaciones pendientes por evaluar. Si presionas continuar, las obligaciones pendientes pasarán a control como "No cumple", con un 0% de cumplimiento',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Si',
        denyButtonText: 'No',
        customClass: {
          actions: 'my-actions',
          //cancelButton: 'order-1 right-gap',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        }*/
          title: '¿Deseas finalizar la evaluación?',
          text: 'Tienes obligaciones pendientes por evaluar. Si presionas continuar, las obligaciones pendientes pasarán a control como "No Evaluado"',//"No cumple", con un 0% de cumplimiento
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#364574',
          cancelButtonColor: 'rgb(243, 78, 78)',
          confirmButtonText: 'Si',
          denyButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
    
      this.showPreLoader();
      const evaluation: any = {
        "cumplimiento": this.avance_evaluacion, 
        "fechaFinalizacion": this.finalizeDate
      };

      this.projectsService.updateEvaluation(this.project_id, evaluation).pipe().subscribe(
        (data: any) => {

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
              this._router.navigate(['/'+this.project_id+'/project-dashboard']);
              //this.getProject(this.project_id);
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
    
    }else{
      this.showPreLoader();
      const evaluation: any = {
        "cumplimiento": this.avance_evaluacion, 
        "fechaFinalizacion": this.finalizeDate
      };

      this.projectsService.updateEvaluation(this.project_id, evaluation).pipe().subscribe(
        (data: any) => {

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
              this._router.navigate(['/'+this.project_id+'/project-dashboard']);
              //this.getProject(this.project_id);
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

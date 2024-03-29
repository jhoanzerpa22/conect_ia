import { Component, OnInit, ViewChildren, QueryList, Input, Output, AfterViewInit, EventEmitter, ViewChild, ElementRef, forwardRef, Renderer2 } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

import { DetailModel, recentModel, ArticulosModel } from './evaluation-detail-all.model';
import { folderData } from './data';
import { RecentService } from './evaluation-detail-all.service';
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
  selector: 'app-evaluation-detail-all',
  templateUrl: './evaluation-detail-all.component.html',
  styleUrls: ['./evaluation-detail-all.component.scss'],
  providers: [RecentService, DecimalPipe]
})

/**
 * EvaluationDetailAll Component
 */
export class EvaluationDetailAllComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  project_id: any = '';
  project: any = {};
  evaluations: any = {};
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
  //total: Observable<number>;
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

  estados_default: any = estadosData;

  term:any;

  @ViewChild('zone') zone?: ElementRef<any>;
  //@ViewChild("collapse") collapse?: ElementRef<any>;
  search: any = {texto: '', cuerpo: '', tipo: '', criticidad: '', atributo: '', articulo: '', area: ''};
  
  filtro_tipo: any;
  filtro_criticidad: any;
  filtro_atributo: any;
  filtro_cuerpo: any;

  constructor(private modalService: NgbModal/*, public service: RecentService*/, private formBuilder: UntypedFormBuilder, private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService,public toastService: ToastService, private sanitizer: DomSanitizer, private renderer: Renderer2,private TokenStorageService : TokenStorageService) {
    //this.recentData = service.recents$;
    //this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Control' },
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
      this.evaluations = data.data.filter(
        (ev: any) =>
          ev.active == true
      )[0];
  },
  (error: any) => {
    //this.error = error ? error : '';
    //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
  });
}

 goControl(id: any){
    this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+this.installation_id+'/TaskControl/'+id]);
}

getArticlesCuerpo(articulos: any){
  let articulosData: any = [];

  for (var j = 0; j < articulos.length; j++) {
    const index = articulosData.findIndex(
      (co: any) =>
        co.articuloId == articulos[j].articuloId
    );

    if(index == -1 && articulos[j].proyectoId == this.project_id && articulos[j].estado == '1'){
      
      if(articulos[j].evaluations && !articulos[j].evaluations.active){
        articulos[j].evaluations = {};
      } 
      articulosData.push(articulos[j]);
    }else if(index != -1 && articulos[j].proyectoId == this.project_id && articulos[j].estado == '1'){

      if((!articulosData[index].evaluations || articulosData[index].evaluations && !articulosData[index].evaluations.active) && articulos[j].evaluations && articulos[j].evaluations.active == true){
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
    this.filtro_cuerpo = cuerpo;  
    this.filterBusqueda();
    /*if(cuerpo){

      this.articles_proyects_group = this.articles_proyects_group_all.filter((data: any) => {
        return data.cuerpoLegal === cuerpo;
      });

    }else{
      this.articles_proyects_group = this.articles_proyects_group_all;
    }*/
    
    //this.hidePreLoader();
  }
  
  selectCumplimiento(e: any){
    let cumplimiento: any = e.target.value;
    this.filtro_tipo = cumplimiento;  
    this.filterBusqueda();
  }
  
  selectCriticidad(e: any){
    let criticidad: any = e.target.value;
    this.filtro_criticidad = criticidad;  
    this.filterBusqueda();
  }
  
  selectAtributo(e: any){
    let atributo: any = e.target.value;
    this.filtro_atributo = atributo;  
    this.filterBusqueda();
  }
  
filterBusqueda() {
  let items = this.articles_proyects_group_all;
  //let search = this.search;
console.log('ITems',items);  
  if (!items) {
    this.articles_proyects_group = [];
  }/* else if (!search) {
    this.articles_proyects_group = items;
  } */else if((!this.filtro_cuerpo || this.filtro_cuerpo == undefined) && (!this.filtro_tipo || this.filtro_tipo == undefined) && (!this.filtro_criticidad || this.filtro_criticidad == undefined) && (!this.filtro_atributo || this.filtro_atributo == undefined)){
    this.articles_proyects_group = items;
  }else{

  items = items.filter((data: any) => {
    //filtro por cuerpo
    return this.filtro_cuerpo ? data.cuerpoLegal === this.filtro_cuerpo : true;
  });

  console.log('Filtro_cuerpo',this.filtro_cuerpo,items);

  items = items.filter((item: any) => {

    let atributo_installation = this.filtro_atributo ? item.articulos.findIndex((at: any) =>{
        return at.project_article.articuloTipo == (this.filtro_atributo == 'Otros' ? null : this.filtro_atributo.toLowerCase());
    }) : -1;

    return this.filtro_atributo ? atributo_installation != -1 : true;
  });

  console.log('Filtro_atributo',this.filtro_atributo,items);

  items = items.filter((item: any) => {
    
    //filtro por cumplimiento
    let cumplimiento_installation = this.filtro_tipo ? item.articulos.findIndex((c: any) =>{
      //return c.evaluations.findIndex((ev: any) => {
          return c.evaluations.estado && c.evaluations.estado != null ? this.getCategoryStatus(c.evaluations.estado) == this.filtro_tipo : (this.filtro_tipo == 'NO EVALUADO' ? true : false);
        //}) != -1;
    }) : -1;

    return this.filtro_tipo ? cumplimiento_installation != -1 : true;
  });

  console.log('Filtro_tipo',this.filtro_tipo,items);

  items = items.filter((item: any) => {
    
    //filtro por criticidad
    let criticidad_installation = this.filtro_criticidad ? item.articulos.findIndex((ins5: any) =>{
        return (ins5.project_article && ins5.project_article.construccion && ins5.project_article.construccion == true && this.filtro_criticidad == 'Alta') || (ins5.project_article && ins5.project_article.operacion &&  ins5.project_article.operacion == true && this.filtro_criticidad == 'Media') || (ins5.project_article && ins5.project_article.cierre && ins5.project_article.cierre == true && this.filtro_criticidad == 'Baja') || ((!ins5.project_article || (!ins5.project_article.construccion && !ins5.project_article.operacion && !ins5.project_article.cierre)) && this.filtro_criticidad == 'No especificado');
    }) : -1;

    return this.filtro_criticidad ? criticidad_installation != -1 : true;
  });

  console.log('Filtro_criticidad',this.filtro_criticidad,items);

  items.forEach((aa: any) => {
    aa.articulos = this.filtro_atributo ? aa.articulos.filter((art: any) => {
      return art.project_article.articuloTipo == (this.filtro_atributo == 'Otros' ? null : this.filtro_atributo.toLowerCase());
    }) : aa.articulos;

    aa.articulos = this.filtro_tipo ? aa.articulos.filter((art2: any) => {
      return art2.evaluations.estado && art2.evaluations.estado != null ? this.getCategoryStatus(art2.evaluations.estado) == this.filtro_tipo : (this.filtro_tipo == 'NO EVALUADO' ? true : false);
    }) : aa.articulos;

    aa.articulos = this.filtro_criticidad ? aa.articulos.filter((art3: any) => {
      return (art3.project_article && art3.project_article.construccion && art3.project_article.construccion == true && this.filtro_criticidad == 'Alta') || (art3.project_article && art3.project_article.operacion && art3.project_article.operacion == true && this.filtro_criticidad == 'Media') || (art3.project_article && art3.project_article.cierre && art3.project_article.cierre == true && this.filtro_criticidad == 'Baja') || ((!art3.project_article || (!art3.project_article.construccion && !art3.project_article.operacion && !art3.project_article.cierre)) && this.filtro_criticidad == 'No especificado');
    }) : aa.articulos;

  });

  this.articles_proyects_group = items;
  }
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
                if(articulos[i].articulos[j].proyectoId == this.project_id && (articulos[i].articulos[j].estado == '1'/* || articulos[i].articulos[j].estado == '2'*/)){
                  
                  const index = articulos_group.findIndex(
                    (ar: any) =>
                      ar == articulos[i].articulos[j].articuloId
                  );
                  
                  const index_articulo = articulos[i].articulos.findIndex(
                    (ar: any) =>
                      ar.evaluations && ar.evaluations.active == true
                  );
              
                  if(index == -1 && (index_articulo == -1 || (index_articulo != -1 && articulos[i].articulos[j].evaluations && articulos[i].articulos[j].evaluations.active == true))){
                    articulos_group.push(articulos[i].articulos[j].articuloId);
                    total += 1;
                    total_cuerpos += 1;
                    procede = true;
                  
                  const evaluation_active = articulos[i].articulos[j].evaluations;
                  
                  if(evaluation_active && evaluation_active.active && evaluation_active.estado){
                    switch (this.getCategoryStatus(evaluation_active.estado)) {
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
                    
                  }/*else{
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
                  }*/
                  }
                }
              }
              if(procede){
                cuerpo_articulos.push(articulos[i]);
                //total_cuerpos = parseInt(articulos[i].articulos.length);

                if(cuerpo_cumple > 0 || cuerpo_parcial > 0 || cuerpo_nocumple > 0){
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

          avance = total > 0 ? ((((cumple * 100) + (nocumple * 0) + (parcial * 50)) * 100) / (total * 100)) : 0;

          this.avance = round(avance, 0);
          this.total_articulos = total;

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
          this.articles_proyects_group = cuerpo_articulos;
          this.articles_proyects_group_all = cuerpo_articulos;
          
          if(localStorage.getItem('filtersControl')) {
            this.search = this.TokenStorageService.getFiltersControl();
      
            this.filtro_tipo = this.search.tipo;
            this.filtro_criticidad = this.search.criticidad;
            this.filtro_atributo = this.search.atributo == 'Otras Obligaciones' ? 'Otros' : this.search.atributo;
            this.filtro_cuerpo = this.search.cuerpoLegal;
            this.term = this.search.articuloName;
            
            this.filterBusqueda();
          }
          
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

  getFindingsCumple(findings: any){
      let cumple: any = findings.filter((f: any) => {
        return f.estado === 1;
      });

      return cumple.length;
  }

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

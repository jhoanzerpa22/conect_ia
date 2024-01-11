import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from './data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { round } from 'lodash';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import { estadosData } from '../../projects/estados';

@Component({
  selector: 'app-project-control',
  templateUrl: './project-control.component.html',
  styleUrls: ['./project-control.component.scss']
})

/**
 * Projects Component
 */
export class ProjectControlComponent implements OnInit {

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
  evaluations: any = {};

  installations_data: any = [];
  installations_articles: any = [];
  installations_group: any = [];
  installations_group_filter: any = [];
  userData: any;
  avance_evaluacion: number = 0;
  
  cumple: number = 0;
  nocumple: number = 0;
  parcial: number = 0;
  cuerpo_cumple: number = 0;
  cuerpo_nocumple: number = 0;
  cuerpo_parcial: number = 0;
  
  estados_default: any = estadosData;
  term:any;
  searchTerm: any;
  search: any = {proyecto_id: '', texto: '', cuerpo: '', cuerpoLegal: '', tipo: '', criticidad: '', atributo: '', articulo: '', articuloName: '', area: ''};

  filtro_cuerpo: any;
  tipo_cuerpo: any;
  filtro_cuerpoId: any;
  criticidad_cuerpo: any;
  filtro_atributo: any;
  filtro_articulo: any;
  filtro_articuloId: any;
  filtro_area: any;
  filtro_area_cuerpo: any;
  articles_filter: any = [];
  articles_proyects_group: any = [];
  articulos: any = [];

  /**Lista de Filtros */
  lista_cuerpos: any = [];
  lista_cumplimientos: any = [];
  lista_criticidad: any = [];
  lista_atributos: any = [];
  lista_articulos: any = [];
  lista_areas: any = [];
  
  areas_all: any = [];
  areas_tree: any = [];
  tree_data: any = [];
  areas: any = [];
  areas_chart: any;
  areas_select_chart: any = [];

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private TokenStorageService: TokenStorageService) {
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Control', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.search.proyecto_id = params['id'];
      this.getProject(params['id']);
      this.getAreas();
      this.getAreasTree();
      this.getEvaluations(params['id']);
      this.getInstallations(params['id']);
      this.getArticleProyect(params['id']);
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

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

  async validateAreaChildren(tree_data: any, instalaciones: any): Promise<boolean>{
    let valid: boolean = false;
    
    for (let index = 0; index < tree_data.length; index++) {
      const tree: any = tree_data[index];
    
      let valid_area: boolean = this.validIndexArea(instalaciones, tree.nombre);
      //console.log('Busque Hijo: ', tree.nombre, valid_area);
      if(valid_area){
        //console.log('HIjo =>', tree.nombre);
        return true;
      }else if(tree.children){
        valid = await this.validateAreaChildren(tree.children, instalaciones);
        //console.log('Hijos 2', valid);
        if(valid){
          return true;
        }
      }

    }

    return valid;
  } 

  validDataArea(tree_data: any, instalaciones: any, type: any){
    
    let valid = this.validIndexArea(instalaciones, tree_data.nombre);
    
    if(valid){
      return true;
    }else if(tree_data.children){

      return tree_data.children.findIndex((tree: any) => {

        let index = this.validIndexArea(instalaciones, tree.nombre);
  
        if(index){
          return true;
        }else if(tree.children){
    
            return tree.children.findIndex((tree2: any) => {

              let index2 = this.validIndexArea(instalaciones, tree2.nombre);
        
              if(index2){
                return true;
              }else if(tree2.children){
                return tree2.children.findIndex((tree3: any) => {

                  let index3 = this.validIndexArea(instalaciones, tree3.nombre);
            
                  if(index3){
                    return true;
                  }else{
                    return false;
                  }
                }) != -1;
              }else{
              return false;
              }
            }) != -1;

        }else{
          return false;
        }
      }) != -1;

    }

      return false;
    
    //let valid = true;

    /*let valid_area: boolean = this.validIndexArea(instalaciones, tree_data.nombre);
    //console.log('BUSCANDO',tree_data.nombre);
    if(valid_area){
      //console.log('ENTRO', type ,tree_data.nombre);
      return true;
    }else if(tree_data.children){

    valid = await this.validateAreaChildren(tree_data.children, instalaciones);
    //console.log('Hijos de =>', tree_data.nombre, valid);
    }*/

    //return valid;
  }
  
  /*getValidChildrenDataArea(tree_data: any, instalaciones: any): boolean{
    let valid: boolean = false;

    for (let index = 0; index < tree_data.length; index++) {
      const tree: any = tree_data[index];

      let valid_area: boolean = this.validIndexArea(instalaciones, tree.nombre);
      
      if(!valid){
        valid = valid_area;
      }

      if(!valid && tree.children){
        valid = this.getValidChildrenDataArea(tree.children, instalaciones);
      }

    }

    return valid;
  }*/

  validIndexArea(instalaciones: any, area: any){
    return instalaciones.findIndex(
      (ins: any) =>
        ins.area == area
    ) != -1;
  }

  getFilterArea(instalaciones: any, area: any){
    return instalaciones.filter(
      (ins: any) =>
        ins.area == area
    );
  }

  goDetail(id: any){
    this.TokenStorageService.saveFiltersControl(this.search);
    this._router.navigate(['/projects/'+this.project_id+'/evaluation/'+id+'/DetailAll']);
  }
  
  goDashboard(){
    this._router.navigate(['/'+this.project_id+'/project-dashboard/resumen/control']);
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
           this.evaluations = data.data.filter(
            (ev: any) =>
              ev.active == true
          )[0];
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

  private getAreasTree(){
    this.showPreLoader();
      this.projectsService.getAreasAll(this.project_id).pipe().subscribe(
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
                if(obj[i].installations_articles[j].proyectoId == this.project_id && (obj[i].installations_articles[j].estado == '1' || obj[i].installations_articles[j].estado == '2')){
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
          
          console.log('installations_group',this.installations_group);
          //console.log('lista_data', this.installations_group);
          this.avance_evaluacion = lista.length > 0 ? round((avance_total / total), 0) : 0;    
          this.getArticulos(); 
          
          this._simplePieChartCuerpos('["--vz-success", "--vz-warning", "--vz-danger"]');
          this._simplePieChartArticulos('["--vz-success", "--vz-warning", "--vz-danger"]');

          /*if(localStorage.getItem('filtersControl')) {
            let storageSearch = this.TokenStorageService.getFiltersControl();

            if(storageSearch.proyecto_id == this.project_id){
              this.search = storageSearch;
              this.tipo_cuerpo = this.search.tipo;
              this.criticidad_cuerpo = this.search.criticidad;
              this.filtro_atributo = this.search.atributo;
              this.filtro_cuerpo = this.search.cuerpoLegal;
              this.filtro_cuerpoId = this.search.cuerpo;
              this.filtro_articuloId = this.search.articulo;
              this.filtro_articulo = this.search.articuloName;
              
              setTimeout(() => {
                this.filterBusqueda();
              }, 1000);
            }
          }else{*/
            this.installations_group_filter = this.installations_group;
            this.getListaFiltros();
          //}

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
  
  getArticulos(){
    this.articles_filter = [];
    const filter: any = this.installations_articles.filter(
      (ins: any) =>
        ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')/* && ins.normaId == this.filtro_cuerpoId*/
    );
   // let articles_group: any = [];
          filter.forEach((x: any) => {
            if(!this.filtro_cuerpoId || (this.filtro_cuerpoId && x.normaId == this.filtro_cuerpoId)){   
              const index = /*articles_group*/this.articles_filter.findIndex(
                (co: any) =>
                  co.id == x.articuloId
              );

              if(index == -1){
                /*articles_group*/this.articles_filter.push({id: x.articuloId, articulo: x.articulo});
              }
            }
          })
    //return articles_group;
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

        //this.hidePreLoader();
    },
    (error: any) => {
      //this.hidePreLoader();
      //this.error = error ? error : '';
    });
}

filterBusqueda() {
  let items = this.installations_group;
  let search = this.search;
  console.log('Busqueda:',search);
  if (!items) {
    this.installations_group_filter = [];
    this.getListaFiltros();
  } else if (!search) {
    this.installations_group_filter = items;
    this.getListaFiltros();
  } else if(!search.texto && (!search.cuerpo || search.cuerpo == undefined) && (!search.articulo || search.articulo == undefined) && (!search.tipo || search.tipo == undefined) && (!search.criticidad || search.criticidad == undefined) && (!search.atributo || search.atributo == undefined) && (!search.area || search.area == undefined)){
    this.installations_group_filter = items;
    this.getListaFiltros();
  }else{

  let texto = '';
  
  if(search.texto){
      texto = search.texto.toLowerCase();
  }

  console.log('Items', search, items);

  items = items.filter((item: any) => {
    
    //filtro por texto
    /*let search_installation = texto ? item.instalaciones.findIndex((i: any) =>{
      return (i.nombre && i.nombre.toLowerCase().includes(texto)) || (i.descripcion && i.descripcion.toLowerCase().includes(texto));
    }) : -1;*/
    
    //filtro por cuerpo
    let cuerpo_installation = search.cuerpo && search.cuerpo != '' ? item.instalaciones.findIndex((d: any) =>{
      return d.installations_articles && d.installations_articles.length > 0 ? d.installations_articles.findIndex((ins: any) => {
        return ins.normaId == search.cuerpo && ins.proyectoId == this.project_id && ins.instalacionId == d.id;
      }) != -1 : false;
    }) : 1;
    
    //filtro por articulo
    /*let articulo_installation = search.articulo ? item.instalaciones.findIndex((a: any) =>{
      return a.installations_articles.findIndex((ins2: any) => {
        return ins2.articuloId == search.articulo;
      }) != -1;
    }) : -1;*/

    //filtro por atributo
    /*let atributo_installation = search.atributo ? item.instalaciones.findIndex((at: any) =>{
      return at.installations_articles.findIndex((ins3: any) => {
        return ins3.project_article.articuloTipo == (search.atributo == 'Otros' ? null : search.atributo.toLowerCase());
      }) != -1;
    }) : -1;*/

    //filtro por cumplimiento
    /*let cumplimiento_installation = search.tipo ? item.instalaciones.findIndex((c: any) =>{
      return c.installations_articles.findIndex((ins4: any) => {
        return ins4.evaluations.findIndex((ev: any) => {
          return this.getCategoryStatus(ev.estado) == search.tipo;
        }) != -1;
      }) != -1;
    }) : -1;*/

    //filtro por criticidad
    /*let criticidad_installation = search.criticidad ? item.instalaciones.findIndex((cri: any) =>{
      return cri.installations_articles.findIndex((ins5: any) => {
        return (ins5.project_article.construccion == true && search.criticidad == 'Alta') || (ins5.project_article.operacion == true && search.criticidad == 'Media') || (ins5.project_article.cierre == true && search.criticidad == 'Baja') || (!ins5.project_article.construccion && !ins5.project_article.operacion && !ins5.project_article.cierre && search.criticidad == 'No especificado');
      }) != -1;
    }) : -1;*/

    //return (texto && item.area && item.area.toLowerCase().includes(texto)) || (texto && item.descripcion && item.descripcion.toLowerCase().includes(texto)) || search_installation != -1 || cuerpo_installation != -1 || articulo_installation != -1 || atributo_installation != -1 || (search.criticidad ? cumplimiento_installation != -1 && criticidad_installation != -1 : cumplimiento_installation != -1) || (search.area && item.area && item.area == search.area)/* || item.normaId.includes(searchText)*/;    
    return search.cuerpo && search.cuerpo != '' ? cuerpo_installation != -1 : true;
  });

  console.log('Cuerpo',search.cuerpo, items);

  items = items.filter((item: any) => {
    
    let articulo_installation = search.articulo ? item.instalaciones.findIndex((a: any) =>{
      return a.installations_articles.findIndex((ins2: any) => {
        return ins2.articuloId == search.articulo;
      }) != -1;
    }) : -1;
    
    return search.articulo ? articulo_installation != -1 : true;
  });

  items = items.filter((item: any) => {

    let atributo_installation = search.atributo ? item.instalaciones.findIndex((at: any) =>{
      return at.installations_articles.findIndex((ins3: any) => {
        return ins3.project_article.articuloTipo == (search.atributo == 'Otros' ? null : search.atributo.toLowerCase());
      }) != -1;
    }) : -1;

    return search.atributo ? atributo_installation != -1 : true;
  });

  items = items.filter((item: any) => {
    
    //filtro por cumplimiento
    let cumplimiento_installation = search.tipo ? item.instalaciones.findIndex((c: any) =>{
      return c.installations_articles.findIndex((ins4: any) => {
        return ins4.evaluations.findIndex((ev: any) => {
          return this.getCategoryStatus(ev.estado) == search.tipo;
        }) != -1;
      }) != -1;
    }) : -1;

    return search.tipo ? cumplimiento_installation != -1 : true;
  });
  
  console.log('Cumplimiento',search.tipo, items);

  items = items.filter((item: any) => {
    
    //filtro por criticidad
    let criticidad_installation = search.criticidad ? item.instalaciones.findIndex((cri: any) =>{
      return cri.installations_articles.findIndex((ins5: any) => {
        return (ins5.project_article && ins5.project_article.construccion && ins5.project_article.construccion == true && search.criticidad == 'Alta') || (ins5.project_article && ins5.project_article.operacion &&  ins5.project_article.operacion == true && search.criticidad == 'Media') || (ins5.project_article && ins5.project_article.cierre && ins5.project_article.cierre == true && search.criticidad == 'Baja') || ((!ins5.project_article || (!ins5.project_article.construccion && !ins5.project_article.operacion && !ins5.project_article.cierre)) && search.criticidad == 'No especificado');
      }) != -1;
    }) : -1;

    return search.criticidad ? criticidad_installation != -1 : true;
  });
  
  /*items = items.filter((item: any) => {
    return search.area ? (item.area && item.area == search.area) : true;
  });*/

  items = items.filter((item: any) => {
    
    //filtro por texto
    let search_installation = texto ? item.instalaciones.findIndex((i: any) =>{
      return (i.nombre && i.nombre.toLowerCase().includes(texto)) || (i.descripcion && i.descripcion.toLowerCase().includes(texto));
    }) : -1;

    return texto ? (texto && item.area && item.area.toLowerCase().includes(texto)) || (texto && item.descripcion && item.descripcion.toLowerCase().includes(texto)) || search_installation != -1 : true;
  });

  console.log('Final', items);

  items.forEach((aa: any) => {
    aa.instalaciones = search.cuerpo ? aa.instalaciones.filter((art: any) => {
      return art.installations_articles.findIndex((ins: any) => {
        return ins.normaId == search.cuerpo;
      }) != -1;
    }) : aa.instalaciones;

    aa.instalaciones = search.articulo ? aa.instalaciones.filter((art2: any) => {
      return art2.installations_articles.findIndex((ins2: any) => {
        return ins2.articuloId == search.articulo;
      }) != -1;
    }) : aa.instalaciones;

    aa.instalaciones = search.atributo ? aa.instalaciones.filter((art3: any) => {
      return art3.installations_articles.findIndex((ins3: any) => {
        return ins3.project_article.articuloTipo == (search.atributo == 'Otros' ? null : search.atributo.toLowerCase());
      }) != -1;
    }) : aa.instalaciones;

    aa.instalaciones = search.tipo ? aa.instalaciones.filter((art4: any) => {
      return art4.installations_articles.findIndex((ins4: any) => {
        return ins4.evaluations.findIndex((ev: any) => {
          return this.getCategoryStatus(ev.estado) == search.tipo;
        }) != -1;
      }) != -1;
    }) : aa.instalaciones;

    aa.instalaciones = search.criticidad ? aa.instalaciones.filter((cri: any) => {
      return cri.installations_articles.findIndex((ins5: any) => {
        return (ins5.project_article && ins5.project_article.construccion && ins5.project_article.construccion == true && search.criticidad == 'Alta') || (ins5.project_article && ins5.project_article.operacion &&  ins5.project_article.operacion == true && search.criticidad == 'Media') || (ins5.project_article && ins5.project_article.cierre && ins5.project_article.cierre == true && search.criticidad == 'Baja') || ((!ins5.project_article || (!ins5.project_article.construccion && !ins5.project_article.operacion && !ins5.project_article.cierre)) && search.criticidad == 'No especificado');
      }) != -1;
    }) : aa.instalaciones;

    aa.instalaciones = texto ? aa.instalaciones.filter((art5: any) => {
      return (art5.nombre && art5.nombre.toLowerCase().includes(texto)) || (art5.descripcion && art5.descripcion.toLowerCase().includes(texto));
    }) : aa.instalaciones;

    aa.instalaciones.forEach((bb: any) => {
      bb.installations_articles = search.cuerpo ? bb.installations_articles.filter((bb1: any) => {
        return bb1.normaId == search.cuerpo;
      }) : bb.installations_articles;
  
      bb.installations_articles = search.articulo ? bb.installations_articles.filter((bb2: any) => {
        return bb2.articuloId == search.articulo;
      }) : bb.installations_articles;
  
      bb.installations_articles = search.atributo ? bb.installations_articles.filter((bb3: any) => {
        return bb3.project_article.articuloTipo == (search.atributo == 'Otros' ? null : search.atributo.toLowerCase());
      }) : bb.installations_articles;
  
      bb.installations_articles = search.tipo ? bb.installations_articles.filter((bb4: any) => {
        return bb4.evaluations.findIndex((ev: any) => {
            return this.getCategoryStatus(ev.estado) == search.tipo;
          }) != -1;
      }) : bb.installations_articles;
  
      bb.installations_articles = search.criticidad ? bb.installations_articles.filter((bb5: any) => {
        return (bb5.project_article && bb5.project_article.construccion && bb5.project_article.construccion == true && search.criticidad == 'Alta') || (bb5.project_article && bb5.project_article.operacion && bb5.project_article.operacion == true && search.criticidad == 'Media') || (bb5.project_article && bb5.project_article.cierre && bb5.project_article.cierre == true && search.criticidad == 'Baja') || ((!bb5.project_article || (!bb5.project_article.construccion && !bb5.project_article.operacion && !bb5.project_article.cierre)) && search.criticidad == 'No especificado');
      }) : bb.installations_articles;
    });

  });
  
  console.log('Final_Filtrado', items);

  this.installations_group_filter = items;
  this.getListaFiltros();
  }
}

getListaFiltros(){

  this.lista_cuerpos = [];
  this.lista_cumplimientos = [];
  this.lista_criticidad = [];
  this.lista_atributos = [];
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
          if(ins.proyectoId == this.project_id && (ins.estado == '1' || ins.estado == '2')){
                
          const index_cuerpo = this.lista_cuerpos.findIndex(
            (lc: any) =>
              lc.normaId == ins.normaId
          );

          const index_articulo = this.lista_articulos.findIndex(
            (la: any) =>
              la.id == ins.articuloId
          );

          const index_atributo = this.lista_atributos.findIndex(
            (latr: any) =>
              latr.atributo == this.capitalizeText(ins.project_article.articuloTipo)
          );

          const index_criticidad = this.lista_criticidad.findIndex(
            (lcrt: any) =>
              (lcrt.criticidad == 'Alta' && ins.project_article.construccion && ins.project_article.construccion == true) || (lcrt.criticidad == 'Media' && ins.project_article.operacion && ins.project_article.operacion == true) || (lcrt.criticidad == 'Baja' && ins.project_article.cierre && ins.project_article.cierre == true) || (lcrt.criticidad == 'No especificado' && !ins.project_article.construccion && !ins.project_article.operacion && !ins.project_article.cierre)
          );

          if(index_cuerpo == -1){
            this.lista_cuerpos.push({normaId: ins.normaId, cuerpoLegal: ins.cuerpoLegal});
          }
          
          if(index_articulo == -1){
            this.lista_articulos.push({id: ins.articuloId, articulo: ins.articulo});
          }
          
          if(index_atributo == -1){
            this.lista_atributos.push({atributo: this.capitalizeText(ins.project_article.articuloTipo)});
          }
          
          if(index_criticidad == -1){
            let criticidad_name = 'No especificado';
            if (ins.project_article.construccion) {
              criticidad_name = 'Alta';
            }else if (ins.project_article.operacion) {
              criticidad_name = 'Media';
            }else if (ins.project_article.cierre) {
              criticidad_name = 'Baja';
            }

            this.lista_criticidad.push({criticidad: criticidad_name});
          }

          ins.evaluations.forEach((ev: any) => {
            //console.log('Evaluacion',this.getCategoryStatus(ev.estado), ev.active, ev.proyectoId, ev);
            if(ev.active/* && ev.proyectoId == this.project_id*/){
              const index_cumplimiento = this.lista_cumplimientos.findIndex(
                (lcum: any) =>
                  lcum.cumplimiento == this.getCategoryStatus(ev.estado)
              );

              if(index_cumplimiento == -1){
                this.lista_cumplimientos.push({cumplimiento: this.getCategoryStatus(ev.estado)});
              }

            }
          });
        }

        });
      });

  })

}

capitalizeText(text?: any){
  if(!text){
    return '';
  }

  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);

  return capitalized;
}

clearFilters(){

  this.filtro_cuerpo = '';
  this.filtro_cuerpoId = '';
  this.tipo_cuerpo = '';
  this.criticidad_cuerpo = '';
  this.filtro_atributo = '';
  this.filtro_articuloId = '';
  this.filtro_articulo = '';
  this.filtro_area_cuerpo = '';
  this.search = {texto: '', cuerpo: '', cuerpoLegal: '', tipo: '', criticidad: '', atributo: '', articulo: '', articuloName: '', area: ''};

  this.filterBusqueda();
}

selectCuerpoFiltro(cuerpo?: any, normaId?: any){
  this.filtro_cuerpo = cuerpo;
  this.filtro_cuerpoId = normaId;
  this.search.cuerpo = normaId;
  this.search.cuerpoLegal = cuerpo;
  this.filterBusqueda();
  //if(cuerpo){
    //this.getArticulos();    
  //}
}

  selectTipoCuerpo(tipo?: any){
    this.tipo_cuerpo = tipo;
    this.search.tipo = tipo;
    this.filterBusqueda();
  }
  
  selectAtributoFiltro(atributo?: any){
    this.filtro_atributo = atributo;
    this.search.atributo = atributo;
    this.filterBusqueda();
  }

  selectCriticidadCuerpo(criticidad?: any){
    this.criticidad_cuerpo = criticidad;
    this.search.criticidad = criticidad;
    this.filterBusqueda();
  }

  selectArticuloFiltro(id?: any, articulo?: any){
    this.filtro_articuloId = id > 0 ? id : null;
    this.filtro_articulo = id > 0 ? articulo : null;
    this.search.articulo = id;
    this.search.articuloName = articulo;
    this.filterBusqueda();
  }

  selectAreaChartCuerpo(nombre?: any){
    this.filtro_area_cuerpo = nombre;
    this.search.area = nombre;
    this.filterBusqueda();
  }
  
  selectAreaChart(id?: any, nombre?: any){
    const existe_area = this.areas_chart.findIndex(
      (arc: any) =>
        arc.id == id
    );

    this.filtro_area = id;
    this.filtro_area_cuerpo = nombre;
    this.search.area = nombre;

    if(existe_area != -1){
      
      this.filterBusqueda();
      
      this.areas_select_chart.push({id: id, nombre: this.areas_chart[existe_area].nombre});
      this.getChildrenChart(id);
    }else{
      this.filterBusqueda();
    }
  }

  deleteAreaChart(id: any){
    
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
      
      this.filtro_area = this.areas_select_chart[(this.areas_select_chart.length - 1)].id;
      this.filtro_area_cuerpo = this.areas_select_chart[(this.areas_select_chart.length - 1)].nombre;
      this.search.area = this.areas_select_chart[(this.areas_select_chart.length - 1)].nombre;
      this.filterBusqueda();
      
      this.getChildrenChart(this.areas_select_chart[(this.areas_select_chart.length - 1)].id);
    }else{
      this.filtro_area = undefined;
      this.filtro_area_cuerpo = undefined;
      this.search.area = '';

      this.areas_chart = this.areas;
      this.filterBusqueda();
      
    }
  }

  getAreas() {
    this.projectsService.getAreasUser().pipe().subscribe(
        (data: any) => {
          this.areas = data.data;
          this.areas_chart = data.data;
      },
      (error: any) => {
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

  filterList(text: any){
    this.search.texto = text;
    this.filterBusqueda();
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

import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { InstallationsTypeModel } from './installations.model';
import { Installations } from './data';
import { InstallationsService } from './installations.service';
import { NgbdInstallationsTypeSortableHeader, SortEvent } from './installations-sortable.directive';
import { ProjectsService } from '../../../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../../../toast-service';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

interface FoodNode {
  id: number;
  nombre: string;
  area?: string;
  cuerpo?: number;
  articulo?: number;
  conectado?: boolean;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    id: 1,
    nombre: 'Instalación 1',
    children: [
      {id: 12, nombre: 'Instalación 1-1', cuerpo: 10, articulo: 2, conectado: false},
      {id: 13, nombre: 'Instalación 1-2', cuerpo: 0},
    ]
  }, 
  {
    id: 2,
    nombre: 'Instalación 2'
  }
  ,
  {
    id: 3,
    nombre: 'Instalacion 3',
    children: [
      {
        id: 31,
        nombre: 'Instalación 3-1',
        children: [
          {id: 311,nombre: 'Instalación 3-1-1'}
        ]
      }, {
        id:32,
        nombre: 'Instalación 3-2',
        children: [
          {id: 321,nombre: 'Instalación 3-2-1'},
          {id: 322,nombre: 'Instalación 3-2-2'},
        ]
      },
    ]
  },
];

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  count: number;
  level: number;
}

@Component({
  selector: 'app-installations-type',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.scss'],
  providers: [InstallationsService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class InstallationsTypeComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  InstallationData!: InstallationsTypeModel[];
  checkedList: any;
  masterSelected!: boolean;
  InstallationDatas: any;

  project_id: any = '';

  // Table data
  InstallationList!: Observable<InstallationsTypeModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdInstallationsTypeSortableHeader) headers!: QueryList<NgbdInstallationsTypeSortableHeader>;

  displayedColumns: string[] = ['nombre', 'area', 'cuerpo', 'articulos','estado','accion'];
  
  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      nombre: node.nombre,
      area: node.area,
      cuerpo: node.cuerpo,
      articulo: node.articulo,
      level: level,
      conectado: node.conectado
    };
  }

  treeControl = new FlatTreeControl<any/*ExampleFlatNode*/>(
      node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, 
      node => node.expandable, node => node.children);

      dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private modalService: NgbModal, public service: InstallationsService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
    this.InstallationList = service.installations$;
    this.total = service.total$;
  }
  
  hasChild = (_: number, node: any/*ExampleFlatNode*/) => node.expandable;

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Vinculación'},
      { label: 'Instalaciones y Procesos', active: true }
    ];

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.fetchData();
    });

    /**
     * fetches data
     */
    this.InstallationList.subscribe(x => {
      this.InstallationDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.InstallationData = Installation;
  //   this.InstallationDatas = Object.assign([], this.InstallationData);
  // }

  private getHijas(hijos: any){
    let tree_data: any = [];
    for (let d in hijos) {
      let total_articulos: any = [];
      let total_cuerpos: any = [];
    
      for (var j = 0; j < hijos[d].installations_articles.length; j++) {
        if(hijos[d].installations_articles[j].proyectoId == this.project_id){
          total_articulos.push(hijos[d].installations_articles[j]);
          
          const index = total_cuerpos.findIndex(
            (cu: any) =>
              cu == hijos[d].installations_articles[j].cuerpoLegal
          );

          if(index == -1){
            total_cuerpos.push(hijos[d].installations_articles[j].cuerpoLegal);
          }

        }
      }

        tree_data.push({ id: hijos[d].id, nombre: hijos[d].nombre, area: hijos[d].area ? hijos[d].area.nombre : '', cuerpo: total_cuerpos.length, articulo: total_articulos.length, conectado: hijos[d].conectado, children: hijos[d].hijas.length > 0 ? this.getHijas(hijos[d].hijas) : null });
    }
    return tree_data;
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getInstallationsAll(this.project_id).pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let tree_data: any = [];
          
          for (let c in obj) {
            let padre: any = obj[c].padre;

            let total_articulos: any = [];
            let total_cuerpos: any = [];
          
          for (var j = 0; j < padre.installations_articles.length; j++) {
            if(padre.installations_articles[j].proyectoId == this.project_id){
              total_articulos.push(padre.installations_articles[j]);
              
              const index = total_cuerpos.findIndex(
                (cu: any) =>
                  cu == padre.installations_articles[j].cuerpoLegal
              );

              if(index == -1){
                total_cuerpos.push(padre.installations_articles[j].cuerpoLegal);
              }

            }
          }

              tree_data.push({ id: padre.id, nombre: padre.nombre, area: padre.area ? padre.area.nombre : '', cuerpo: total_cuerpos.length, articulo: total_articulos.length, conectado: padre.conectado, children: padre.hijas.length > 0 ? this.getHijas(padre.hijas) : null });
          }
          this.service.installations_data = tree_data;    
          this.dataSource.data = tree_data;
          console.log('data',tree_data);

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
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
      this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          this.fetchData();
          document.getElementById('lj_'+id)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
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

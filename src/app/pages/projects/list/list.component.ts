import { Component, OnInit, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { projectListWidgets/*, projectListWidgets1, projectListWidgets2*/ } from './data';
import { projectListModel/*, projectListModel1, projectListModel2*/ } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { ProjectsService } from '../../../core/services/projects.service';
import { first } from 'rxjs/operators';
import { ToastService } from '../toast-service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import { round } from 'lodash';

@Component({
  selector: 'app-list',
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
  //projectListWidgets1!: projectListModel1[];
  //projectListWidgets2!: projectListModel2[];
  //projectmodel!: Observable<projectListModel2[]>;
  total: Observable<number>;
  sellers?: any;
  pagLength?: number = 0;
  term:any;
  userData: any;

  constructor(private modalService: NgbModal,
    public service: listService, private projectsService: ProjectsService, public toastService: ToastService,private _router: Router, private TokenStorageService: TokenStorageService) {
    //this.projectmodel = service.companies$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Requisitos legales' },
      { label: 'Lista de Proyectos', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    /**
     * Fetches the data
     */
    this.fetchData();

    if (localStorage.getItem('toast')) {
      this.toastService.show('Proyecto Creado.', { classname: 'bg-success text-center text-white', delay: 5000 });
      localStorage.removeItem('toast');
    }
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
    // this.projectListWidgets = projectListWidgets;
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

          for (var j = 0; j < resp.length; j++) {
            if(resp[j].tipoProyectoId && resp[j].tipoProyectoId != '' && resp[j].tipoProyectoId != null && resp[j].tipoProyectoId != 3 && ((this.validateRol(1) || this.validateRol(2)) || this.validateShowProject(resp[j].estado))){
              proyectos.push(resp[j]);
            }
          }

          this.projectListWidgets = proyectos;
          this.pagLength = proyectos.length;
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

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
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

  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }
  
  validateShowProject(estado?:any){
    const rol_evaluador: boolean = this.userData.rol.findIndex(
      (r: any) =>
        r == 3
    ) != -1;

    const rol_control: boolean = this.userData.rol.findIndex(
      (r: any) =>
        r == 4 || r == 5
    ) != -1;

    if((rol_evaluador && estado == 2) || (rol_control && estado > 2)){
      return true;
    }else{
      return false;
    }

      return true;
  }

  comenzar(proyecto_id: any, estado?: number){
    //this.showPreLoader();

    switch (estado) {
      case 1:
          this._router.navigate(['/projects/'+proyecto_id+'/identification']);
        break;
      case 2:
          this._router.navigate(['/'+proyecto_id+'/project-dashboard']);
        break;
      case 3:
          this._router.navigate(['/'+proyecto_id+'/project-control']);
        break;
    
      default:  
          this._router.navigate(['/projects/'+proyecto_id+'/identification']);
        break;
    }
    
    /*this.projectsService.getAnswerQuestion(6, proyecto_id).pipe().subscribe(
      (data: any) => {
        const info: any = data.data;
        
            this._router.navigate(['/projects/'+proyecto_id+'/project-anality']);
          
        this.hidePreLoader(); 
    },
    (error: any) => {
      
      this._router.navigate(['/pages/'+proyecto_id+'/steps']);
      
      this.hidePreLoader();
    });*/
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

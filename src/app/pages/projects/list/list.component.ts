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

  constructor(private modalService: NgbModal,
    public service: listService, private projectsService: ProjectsService, public toastService: ToastService,private _router: Router) {
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
          this.projectListWidgets = data.data;
          this.pagLength = data.data.length;
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

  comenzar(proyecto_id: any){
    this.showPreLoader();
    
    this.projectsService.getAnswerQuestion(6, proyecto_id).pipe().subscribe(
      (data: any) => {
        const info: any = data.data;
        
            this._router.navigate(['/projects/'+proyecto_id+'/project-anality']);
          
        this.hidePreLoader(); 
    },
    (error: any) => {
      
      this._router.navigate(['/pages/'+proyecto_id+'/steps']);
      
      this.hidePreLoader();
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

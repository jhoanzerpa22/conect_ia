import { Component, OnInit, ViewChild } from '@angular/core';
import { statData, ActiveProjects, MyTask, TeamMembers } from './data';
import { circle, latLng, tileLayer } from 'leaflet';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import { Observable } from 'rxjs';

import { normasListWidgets } from './data';
import { normaListModel } from './list.model';
import { listService } from './list.service';
import { DecimalPipe } from '@angular/common';
import { first } from 'rxjs/operators';
import { ToastService } from '../toast-service';

import { round } from 'lodash';

// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss'],
  providers: [listService, DecimalPipe]
})

/**
 * Projects Component
 */
export class IdentificationComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  statData!: any;
  OverviewChart: any;
  ActiveProjects: any;
  MyTask: any;
  TeamMembers: any;
  status7: any;
  simpleDonutChart: any;
  @ViewChild('scrollRef') scrollRef: any;

  project_id: any = '';
  project: any = {};

  installations_data: any = [];
  areas_data: any = [];
  userData: any;
  installations_articles: any = [];

  normasListWidgets!: normaListModel[];
  total: Observable<number>;
  sellers?: any;
  pagLength?: number = 0;
  term:any;

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private TokenStorageService: TokenStorageService, public service: listService) {
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Proyecto' },
      { label: 'Identificación', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    if (localStorage.getItem('toast')) {
      localStorage.removeItem('toast');
    }

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.getProject(params['id']);
      this.getAreas(params['id']);
      this.getInstallations(params['id']);
      this.getArticlesInstallation();
      this.getNormas();
    });

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  ngAfterViewInit() {
    //this.scrollRef.SimpleBar.getScrollElement().scrollTop = 600;
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
   
  private getNormas() {
    
    this.showPreLoader();
      this.projectsService./*getBodyLegalALl(this.project_id, 1, 10)*/getBodyLegal(this.project_id).pipe().subscribe(
        (data: any) => {
          
          this.normasListWidgets = data.data;
          this.pagLength = data.data.length;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

   getAreas(idProject?: any) {
    this.projectsService.getAreasUser()/*getAreas(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.areas_data = data.data;
      },
      (error: any) => {
      });
  }

  getInstallations(idProject?: any) {
    this.projectsService.getInstallationsUser()/*getInstallations(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.installations_data = data.data;
      },
      (error: any) => {
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

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
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

  private getArticlesInstallation() {

      this.projectsService./*getArticlesInstallationByProyecto(this.project_id)*/getInstallationsUser()/*getInstallations(this.project_id)*/.pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let lista: any = [];

          for (var i = 0; i < obj.length; i++) {
            
            if(obj[i].installations_articles.length > 0){

              let total_articulos: any = [];

              for (var j = 0; j < obj[i].installations_articles.length; j++) {
                if(obj[i].installations_articles[j].proyectoId == this.project_id){
                  total_articulos.push(obj[i].installations_articles[j]);
                }
              }
              
              if(total_articulos.length > 0){
                lista.push(obj[i]);
              }
            }
          }
          
          this.installations_articles = lista;

      },
      (error: any) => {
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }


  validateRol(rol: any){
    return this.userData.rol.findIndex(
      (r: any) =>
        r == rol
    ) != -1;
  }

}

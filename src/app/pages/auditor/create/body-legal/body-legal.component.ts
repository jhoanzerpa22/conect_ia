import {Component, QueryList, ViewChildren, ViewChild, OnInit, Input, NgZone, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { BodyLegalTypeModel } from './body-legal.model';
import { BodyLegal } from './data';
import { BodyLegalService } from './body-legal.service';
import { NgbdBodyLegalTypeSortableHeader, SortEvent } from './body-legal-sortable.directive';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../../toast-service';

@Component({
  selector: 'app-body-legal-auditor',
  templateUrl: './body-legal.component.html',
  styleUrls: ['./body-legal.component.scss'],
  providers: [BodyLegalService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class BodyLegalTypeComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  BodyLegalData!: BodyLegalTypeModel[];
  checkedList: any;
  masterSelected!: boolean;
  BodyLegalDatas: any;

  installations_articles: any = [];
  total_cuerpos: number = 0;
  total_articulos: number = 0;

  // Table data
  BodyLegalList!: Observable<BodyLegalTypeModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdBodyLegalTypeSortableHeader) headers!: QueryList<NgbdBodyLegalTypeSortableHeader>;

  @Input('project_id') project_id: any;
  @Input('installation_id') installation_id: any;
  @Input('installation_nombre') installation_nombre: any;

  @Output() backFunction = new EventEmitter();
  @Output() conectarFunction = new EventEmitter();

  constructor(private modalService: NgbModal, public service: BodyLegalService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
    this.BodyLegalList = service.bodylegal$;
    this.total = service.total$;
  }

  ngOnInit(): void {
  
      this.fetchData();

        this.getArticlesByInstallation(this.installation_id);

    /**
     * fetches data
     */
    this.BodyLegalList.subscribe(x => {
      this.BodyLegalDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.BodyLegalData = BodyLegal;
  //   this.BodyLegalDatas = Object.assign([], this.BodyLegalData);
  // }

  /**
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService.getBodyLegal(this.project_id).pipe().subscribe(
        (data: any) => {
          this.service.bodylegal_data = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getArticlesByInstallation(installation_id: any){

      this.projectsService.getArticlesByInstallation(installation_id).pipe().subscribe(
        (data: any) => {
          this.installations_articles = data.data;
          let total_articulos: any = [];
          let total_cuerpos: any = [];

          for (var j = 0; j < this.installations_articles.length; j++) {
            if(this.installations_articles[j].proyectoId == this.project_id){
              total_articulos.push(this.installations_articles[j]);
              
              const index = total_cuerpos.findIndex(
                (cu: any) =>
                  cu == this.installations_articles[j].cuerpoLegal
              );

              if(index == -1){
                total_cuerpos.push(this.installations_articles[j].cuerpoLegal);
              }

            }
          }
          this.total_articulos = total_articulos.length;
          this.total_cuerpos = total_cuerpos.length;
      },
      (error: any) => {
      });
  }

  validateIdparte(idNorma: any){
    const index = this.installations_articles.findIndex(
      (co: any) =>
        co.normaId == idNorma && co.proyectoId == this.project_id
    );

    return index == -1;
  }

  backClicked(){
    this.backFunction.emit();
  }

  conectarBody(id: any){
    this.conectarFunction.emit(id);
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

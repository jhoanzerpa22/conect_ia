import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { ComplianceModel } from './compliance.model';
import { Installations } from './data';
import { ComplianceService } from './compliance.service';
import { NgbdComplianceSortableHeader, SortEvent } from './compliance-sortable.directive';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../../toast-service';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss'],
  providers: [ComplianceService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class ComplianceComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  InstallationData!: ComplianceModel[];
  checkedList: any;
  masterSelected!: boolean;
  InstallationDatas: any;

  project_id: any = '';

  // Table data
  InstallationList!: Observable<ComplianceModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdComplianceSortableHeader) headers!: QueryList<NgbdComplianceSortableHeader>;

  displayedColumns: string[] = ['nombre', 'cuerpo', 'articulos', 'avance','estado','accion'];
  

  constructor(private modalService: NgbModal, public service: ComplianceService, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService) {
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
      { label: 'Evaluar Cumplimiento', active: true }
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
   * Fetches the data
   */
  private fetchData() {
    
    this.showPreLoader();
      this.projectsService./*getArticlesInstallationByProyecto(this.project_id)*/getInstallationsUser()/*getInstallations(this.project_id)*/.pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          let lista: any = [];

          for (var i = 0; i < obj.length; i++) {
            
            if(obj[i].installations_articles.length > 0){

              let total_articulos: any = [];
              let total_cuerpos: any = [];
          
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
                  
                }
              }
              obj[i].total_articulos = total_articulos.length;
              obj[i].total_cuerpos = total_cuerpos.length;
            
              lista.push(obj[i]);
            }/*else{
              obj[i].total_articulos = 0;
              obj[i].total_cuerpos = 0;
            }*/

          }

          this.service.installations_data = lista;

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
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
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
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

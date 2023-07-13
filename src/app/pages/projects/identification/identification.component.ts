import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  installations_group: any = [];
  areas_data: any = [];
  userData: any;
  installations_articles: any = [];

  normasListWidgets!: normaListModel[];
  total: Observable<number>;
  sellers?: any;
  pagLength?: number = 0;
  term:any;
  articles_proyects: any = [];
  articles_proyects_group: any = [];

  cuerpo_select: any = 'Cuerpo Legal';
  showRow: any = [];

  submitted = false;
  installationForm!: UntypedFormGroup; 
  installations: any = [];
  areas: any = [];
  area_id_select: any = [];
  
  cuerpoForm!: UntypedFormGroup; 
  articulos: any = [];
  cuerpo_id_select: any = [];
  
  items: any = [];
  selectChecked: any = [];
  selectChecked2: any = [];
  selectList: boolean = true;
  activeTab: number = 1;
  
  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService, private TokenStorageService: TokenStorageService, public service: listService, private formBuilder: UntypedFormBuilder, private modalService: NgbModal, private ref: ChangeDetectorRef) {
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
    
    this.installationForm = this.formBuilder.group({
      ids: [''],
      area: ['']
    });
    
    this.cuerpoForm = this.formBuilder.group({
      ids: [''],
      cuerpo: ['']
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
      this.getProject(params['id']);
      this.getAreas(params['id']);
      this.getInstallations(params['id']);
      this.getArticlesInstallation();
      this.getArticleProyect(this.project_id);
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

  selectCuerpo(cuerpo: any){
    
    this.showPreLoader();
    this.cuerpo_select = cuerpo;
    /*this.articulosDatas = this.detail.data.filter((data: any) => {
      return data.cuerpoLegal === cuerpo;
    })[0].articulos;
    */
    this.hidePreLoader();
  }

  validateCuerpo(cuerpo: any){
    return this.cuerpo_select == cuerpo;
 }

 onChangeList(e: any){
    this.selectList = !this.selectList;
    this.ref.detectChanges();
 }

 formatArticle(texto:any, idParte: any){
    
  const index = this.showRow.findIndex(
    (co: any) =>
      co == idParte
  );

  return index != -1 ? texto : texto.substr(0,250)+'...';
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

validateIdparte(idParte: any){
  const index = this.articles_proyects.findIndex(
    (co: any) =>
      co.articuloId == idParte && co.proyectoId == this.project_id
  );

  return index == -1;
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
  
  private getArticleProyect(project_id: any){

    this.showPreLoader();
      this.projectsService.getArticleProyect(project_id).pipe().subscribe(
        (data: any) => {
          this.articles_proyects = data.data;

          this.articles_proyects_group = [];
          this.articles_proyects.forEach((x: any) => {
            
            const index = this.articles_proyects_group.findIndex(
              (co: any) =>
                co.cuerpoLegal == x.cuerpoLegal
            );

            if(index == -1){
              this.articles_proyects_group.push({
                cuerpoLegal: x.cuerpoLegal, organismo: x.organismo, normaId: x.normaId, encabezado: x.encabezado, tituloNorma: x.tituloNorma, articulos: [x]
              });
            }else{
              this.articles_proyects_group[index].articulos.push(x);
            }
          })

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

   getAreas(idProject?: any) {
    this.projectsService.getAreasUser()/*getAreas(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.areas = data.data;
      },
      (error: any) => {
      });
  }

  getInstallations(idProject?: any) {
    this.projectsService.getInstallationsUser()/*getInstallations(idProject)*/.pipe().subscribe(
        (data: any) => {
          this.installations_data = data.data;

          this.installations_group = [];
          this.installations_data.forEach((x: any) => {
            
            const index = this.installations_group.findIndex(
              (co: any) =>
                co.area == x.area.nombre
            );

            if(index == -1){
              this.installations_group.push({
                area: x.area.nombre, instalaciones: [x]
              });
            }else{
              this.installations_group[index].instalaciones.push(x);
            }
          })
      },
      (error: any) => {
      });
  }

   /**
   * Open modal
   * @param content modal content
   */
   openModal(content: any, id: any) {
    this.submitted = false;
    
    this.installations = [];
    this.selectChecked = [];

    this.modalService.open(content, { size: 'md', centered: true });
    
    //var listData = this.areas_all.filter((data: { id: any; }) => data.id === id);
    this.installationForm.controls['ids'].setValue(/*listData[0].*/id);
  }
  
  openModal2(content: any, id: any) {
    this.submitted = false;
    
    this.selectChecked2 = [];

    //this.cuerpoForm.reset();
    this.modalService.open(content, { size: 'md', centered: true });
    this.cuerpoForm.controls['ids'].setValue(id);
  }
  
  saveInstallation(){

  }
  
  saveCuerpo(){

  }

  selectArea(event: any){

    if(this.area_id_select.length > 0){
    
    let vacio = event.target.value > 0 ? 1 : 0;
    
    this.area_id_select.splice(0 + vacio, (this.area_id_select.length-(1+vacio)));
    
      if(event.target.value > 0){
        
        const index = this.areas.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.areas[index].nombre;

        this.area_id_select[0] = {value: event.target.value, label: nombre};
      }

    }else{
      
      const index2 = this.areas.findIndex(
        (co: any) =>
          co.id == event.target.value
      );

      let nombre2 = this.areas[index2].nombre;
      this.area_id_select.push({value: event.target.value, label: nombre2});
    }

    //this.area_id_select = event.target.value;
      this.items = [];
      this.getInstallationsByAreaId(event.target.value);
      this.getChildren(event.target.value);
  }

  selectAreaChildren(event: any, parent?: any){
    //this.addElement(parent);
      let vacio = event.target.value > 0 ? 2 : 1;
    
      this.area_id_select.splice((parent+vacio), (this.area_id_select.length-(parent+vacio)));

      if(event.target.value > 0){
        
        const index = this.items[parent].options.findIndex(
          (co: any) =>
            co.id == event.target.value
        );

        let nombre = this.items[parent].options[index].nombre;

        this.area_id_select[parent+1] = {value: event.target.value, label: nombre};
      }

    //this.area_id_select = event.target.value;
      this.items.splice((parent+1), (this.items.length-(parent+1)));
      this.items[parent].value = event.target.value;
      this.getInstallationsByAreaId(event.target.value);
      this.getChildren(event.target.value);
  }

  getChildren(padre_id: any){
    if(padre_id > 0){
      this.showPreLoader();
      this.projectsService.getAreasItems(padre_id).pipe().subscribe(
        (data: any) => {
          if(data.data.length > 0){
            this.items.push({value: null, options: data.data});
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
  
  private getInstallationsByAreaId(area_id: any) {
    
    this.showPreLoader();
    this.installations = [];

      this.projectsService.getInstallationByAreaId(area_id).pipe().subscribe(
        (data: any) => {
          this.installations = data.data ? data.data : [];

          setTimeout(() => {
            this.validChecked();
          }, 1400);

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  selectCuerpoLegal(event: any){

    if(this.cuerpo_id_select.length > 0){
    
    let vacio = event.target.value != '' && event.target.value != null && event.target.value != undefined ? 1 : 0;
    
    this.cuerpo_id_select.splice(0 + vacio, (this.cuerpo_id_select.length-(1+vacio)));
    
      if(event.target.value != '' && event.target.value != null && event.target.value != undefined){
        
        const index = this.articles_proyects_group.findIndex(
          (co: any) =>
            co.cuerpoLegal == event.target.value
        );

        let nombre = this.articles_proyects_group[index].cuerpoLegal;
        this.cuerpo_id_select[0] = {value: event.target.value, label: nombre};
        this.articulos = this.articles_proyects_group[index].articulos;
      }

    }else{
      
      const index2 = this.articles_proyects_group.findIndex(
        (co: any) =>
          co.cuerpoLegal == event.target.value
      );

      let nombre2 = this.articles_proyects_group[index2].cuerpoLegal;
      this.cuerpo_id_select.push({value: event.target.value, label: nombre2});
      this.articulos = this.articles_proyects_group[index2].articulos;
    }
  }
  
  validChecked(){
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      const index = this.installations_data.findIndex(
        (ins: any) =>
          ins.id == checkboxes[j].id
      );

      if(index != - 1){
        checkboxes[j].checked = true;
        this.selectChecked.push(this.installations_data[index]);
      }/*else{
        checkboxes[j].checked = false;
      }*/
    }
  }

  checkedValGet: any[] = [];
  onCheckboxChange(e: any) {
    //checkArray.push(new UntypedFormControl(e.target.value));
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations.length; i++) {
        result = this.installations[i];
        checkedVal.push(result);
        if(this.installations[i].id == e.target.value){
          const index = this.selectChecked.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectChecked.splice(index, 1);
          }else{
            this.selectChecked.push(this.installations[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
      }
    }

    //this.checkedValGet = checkedVal
    //checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

  checkedValGet2: any[] = [];
  onCheckboxChange2(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.installations.length; i++) {
        result = this.installations[i];
        checkedVal.push(result);
        if(this.installations[i].id == e.target.value){
          const index = this.selectChecked.findIndex(
            (ch: any) =>
              ch.id == e.target.value
          );

          if(index != - 1){
            this.selectChecked2.splice(index, 1);
          }else{
            this.selectChecked2.push(this.installations[i]);
          }
        }
    }
    var checkboxes: any = document.getElementsByName('checkAll');
    for (var j = 0; j < checkboxes.length; j++) {
      if (checkboxes[j].checked && checkboxes[j].id != e.target.value) {
        //checkboxes[j].checked = false;
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

  changeTab(active: number){
    this.activeTab = active;
    if (this.articles_proyects < 1) {
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Rellene todos los campos..',
        showConfirmButton: true,
        timer: 5000,
      });

      return;
    }
  }

  conectCuerpo(cuerpo_id?: any, data?: any){
    
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.normaId == cuerpo_id && co.proyectoId == this.project_id
    );

    if(index != -1){
      this.articles_proyects.splice(index, 1);
    }else{

    const cuerpo_proyect: any = {
      normaId: cuerpo_id,
      cuerpoLegal: data.identificador ? data.identificador.tipoNorma+' '+data.identificador.numero : null,
      organismo: data.organismos.length > 0 ? data.organismos[0] : '',
      encabezado: data.encabezado ? data.encabezado.texto : '',
      tituloNorma: data.tituloNorma,
      proyectoId: this.project_id,
      monitoreo: false,
      reporte: false,
      permiso: false,
      articulos: JSON.stringify(data.EstructurasFuncionales)
    };

    this.articles_proyects.push(cuerpo_proyect);
    }
  }

  validateIdNorma(idNorma: any){
    const index = this.articles_proyects.findIndex(
      (co: any) =>
        co.normaId == idNorma && co.proyectoId == this.project_id
    );

    return index == -1;
  }
  
  saveCuerpos(){
    
    this.showPreLoader();
    if(this.articles_proyects.length > 0){

    for (var j = 0; j < this.articles_proyects.length; j++) {
    
    this.projectsService.conectArticleProyect(this.articles_proyects[j]).pipe().subscribe(
      (data: any) => {     
       
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
      this.modalService.dismissAll()
    });

    }

    this.hidePreLoader();

    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Cuerpos Legales guardados',
      showConfirmButton: true,
      timer: 5000,
    });

    setTimeout(() => {
      this.getArticleProyect(this.project_id);
      this.activeTab = this.activeTab + 1;
    }, 5000);

    }else{
      
      this.hidePreLoader();
      
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
    }
    
  }

}

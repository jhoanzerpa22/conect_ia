import { Component, OnInit, QueryList, ViewChildren, TemplateRef } from '@angular/core';
import { NgbModal, NgbOffcanvas  } from '@ng-bootstrap/ng-bootstrap';
import {DecimalPipe} from '@angular/common';
import {Observable} from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { UserProfileService } from '../../../core/services/user.service';
import { first } from 'rxjs/operators';

//import {teamModel} from './team.model';
import {userModel} from './user.model';
import { Team } from './data';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { Router } from '@angular/router';
import { ToastService } from '../toast-service';
import { ProjectsService } from '../../../core/services/projects.service';
import { round } from 'lodash';
// Sweet Alert
import Swal from 'sweetalert2';

@Component({
  selector: 'app-team-projects',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})

/**
 * Team Component
 */
export class TeamComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  Team!: userModel[];
  submitted = false;
  teamForm!: UntypedFormGroup;
  term:any;
  showLoad: boolean = false;
  rol: any = 2;

  areas: any = [];
  area_id_select: any = [];
  projects: any = [];
  roles: any = [{id:2, nombre: 'Administrador'},{id:3, nombre: 'Evaluador'},{id:4, nombre: 'Encargado Area'},{id:5, nombre: 'Operador'}];
  items: any = [];

  pagLength?: number = 0;
  userData: any;
  perfil: any;

  constructor(private formBuilder: UntypedFormBuilder, private modalService: NgbModal, private offcanvasService: NgbOffcanvas, private userService: UserProfileService, private router: Router, private TokenStorageService: TokenStorageService, public toastService: ToastService, private projectsService: ProjectsService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Usuarios', active: true }/*,
      { label: 'Team', active: true }*/
    ];

    this.userData = this.TokenStorageService.getUser();

    /**
     * Form Validation
     */
     this.teamForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      rut: ['', [Validators.required]],
      telefono: [''],
      cargo: [''],
      email: ['', [,Validators.required, Validators.email]],
      rol: ['', [Validators.required]],/*
      designation: ['', [Validators.required]],*/
      projects: [['']/*, [Validators.required]*/],
      areas: [['']],
      /*empresa: ['']
      tasks: ['', [Validators.required]]*/
    });
    
    this.getAreas();
    this.getProjects();

     // Chat Data Get Function
     this._fetchData();
  }

  // Chat Data Fetch
  private _fetchData() {

    this.showLoad = true;
    //this.Team = Team;
    this.userService.getCoworkers().pipe().subscribe(
      (obj: any) => {
        this.Team = obj.data;
        this.pagLength = obj.data.length;
        this.showLoad = false;
      }
    )
  }

  private getProjects(){
    
      this.showPreLoader();
        this.projectsService.get().pipe().subscribe(
          (data: any) => {        
            this.projects = data.data;
            this.hidePreLoader();
        },
        (error: any) => {
          this.hidePreLoader();
        });
        document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getAreas() {
    
    this.showPreLoader();
      this.projectsService.getAreasUser()/*getAreas(this.project_id)*/.pipe().subscribe(
        (data: any) => {
          //this.service.bodylegal_data = data.data;
          this.areas = data.data;
          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
  }

  selectRol(event: any){
    const rol_select = event.target.value;
    this.rol = rol_select > 0 ? rol_select : 2;

    if(this.rol < 3){      
      this.teamForm.get('projects')?.setValue('');
      this.teamForm.get('areas')?.setValue('');
      this.items = [];
    }
  }

  selectArea(event: any){

    let valor: any = event.target.value;
    if (valor.includes(':')) {
      const new_valor = valor.split(':');
      valor = new_valor[1] ? parseInt(new_valor[1].replace(/'/g, '')) : 0;
    }

    if(this.area_id_select.length > 0){
    
    let vacio = valor > 0 ? 1 : 0;
    
    this.area_id_select.splice(0 + vacio, (this.area_id_select.length-(1+vacio)));
    
      if(valor > 0){
        
        const index = this.areas.findIndex(
          (co: any) =>
            co.id == valor
        );

        let nombre = this.areas[index].nombre;

        this.area_id_select[0] = {value: valor, label: nombre};
      }

    }else{

      if(valor > 0){
      
      const index2 = this.areas.findIndex(
        (co: any) =>
          co.id == valor
      );

      let nombre2 = this.areas[index2].nombre;
      this.area_id_select.push({value: valor, label: nombre2});
      }
    }

    //this.area_id_select = event.target.value;
      this.items = [];
      this.getChildren(valor);
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
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
   openModal(content: any) {
    
    this.teamForm.reset();
    this.rol = 2;
    this.submitted = false;
  
    this.modalService.open(content, { size: 'md', centered: true });
  }

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }

   /**
   * Form data get
   */
    get form() {
      return this.teamForm.controls;
    }

    getRol(rol: any){
      if(rol && rol[0] != 1){
        const index = this.roles.findIndex(
          (r: any) =>
            r.id == rol[0]
        );
    
        return index != -1 ? this.roles[index].nombre : 'Super Admin';
      }else{
        return "Super Admin";
      }
    }

  /**
  * Save Team
  */
   saveTeam() {
    if (this.teamForm.valid) {
      /*
      const id = '10';
      const backgroundImg = 'assets/images/small/img-6.jpg';
      const userImage = null;
      const nombre =  this.teamForm.get('name')?.value;
      const jobPosition = this.teamForm.get('designation')?.value;
      const projectCount = this.teamForm.get('projects')?.value;
      const taskCount = this.teamForm.get('tasks')?.value;*/      
      /*this.Team.push({
        id,
        backgroundImg,
        userImage,
        name,
        jobPosition,
        projectCount,
        taskCount
      });*/

      //let area_id = this.area_id_select[this.area_id_select.length - 1] ? this.area_id_select[this.area_id_select.length - 1].value : null;
        
      let areas: any = [];
      
      for (let ar = 0; ar < this.area_id_select.length; ar++) {
        const area_id = this.area_id_select[ar].value;
        areas.push(area_id);
      }

      const proyectos_form = this.teamForm.get('projects')?.value ? this.teamForm.get('projects')?.value : [];
      const areas_form = this.teamForm.get('areas')?.value ? this.teamForm.get('areas')?.value : [];

      const data = {
        nombre: this.teamForm.get('nombre')?.value,
        apellido: this.teamForm.get('apellido')?.value,
        rut: this.teamForm.get('rut')?.value,
        telefono: this.teamForm.get('telefono')?.value,
        cargo: this.teamForm.get('cargo')?.value,
        email: this.teamForm.get('email')?.value,
        rol: [this.teamForm.get('rol')?.value],
        projects: proyectos_form.filter((pr: any) => pr.trim() !== ""),
        areas: areas_form.filter((ar: any) => ar.trim() !== ""),//area_id ? area_id : null,
        empresaId: this.userData.empresaId,
        empresa: this.userData.empresa
      };

      this.userService.create(data).pipe(first()).subscribe(
        (data: any) => {
          this.toastService.show('Registro exitoso.', { classname: 'bg-success text-center text-white', delay: 5000 });
          this._fetchData();
          this.modalService.dismissAll()
        },
      (error: any) => {
        //console.log(error);
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: error,
          showConfirmButton: true,
          timer: 5000,
        });
        this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
      });
    }
    this.submitted = true
  }

  /**
   * Active Toggle navbar
   */
   activeMenu(id:any) {            
    document.querySelector('.star_'+id)?.classList.toggle('active');
  }

  /**
  * Delete Model Open
  */
   deleteId: any;
   confirm(content: any,id:any) {
     this.deleteId = id;
     this.modalService.open(content, { centered: true });
   }

   // Delete Data
   deleteData(id:any) { 
    this.userService.delete(id)
    .subscribe(
      response => {
        this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
        this._fetchData();
        document.getElementById('t_'+id)?.remove();
      },
      error => {
        console.log(error);
        this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
      });
  }

  // View Data Get
  viewDataGet(id:any){
    var teamData = this.Team.filter((team:any) => {     
      return team.id === id;
    });
    this.perfil = teamData[0];
    var profile_img = teamData[0].userImage ? 
      `<img src="`+teamData[0].userImage+`" alt="" class="avatar-lg img-thumbnail rounded-circle mx-auto">`:
      `<div class="avatar-lg img-thumbnail rounded-circle flex-shrink-0 mx-auto fs-20">
        <div class="avatar-title bg-soft-danger text-danger rounded-circle">`+teamData[0].nombre[0]+`</div>
      </div>`
    var img_data = (document.querySelector('.profile-offcanvas .team-cover img') as HTMLImageElement);
    img_data.src = 'assets/images/logo_conect_ia.png';//teamData[0].backgroundImg;
    var profile = (document.querySelector('.profileImg') as HTMLImageElement);
    profile.innerHTML = profile_img;
    (document.querySelector('.profile-offcanvas .p-3 .mt-3 h5') as HTMLImageElement).innerHTML = teamData[0].nombre;
    (document.querySelector('.profile-offcanvas .p-3 .mt-3 p') as HTMLImageElement).innerHTML = teamData[0].email;
    (document.querySelector('.telefono') as HTMLImageElement).innerHTML = teamData[0].telefono ? teamData[0].telefono : '';
    (document.querySelector('.rut') as HTMLImageElement).innerHTML = teamData[0].rut ? teamData[0].rut : '';
    (document.querySelector('.cargo') as HTMLImageElement).innerHTML = teamData[0].cargo ? teamData[0].cargo : '';
    (document.querySelector('.project_count') as HTMLImageElement).innerHTML = teamData[0].projectCount > 0 ? teamData[0].projectCount : '0';
    (document.querySelector('.task_count') as HTMLImageElement).innerHTML = teamData[0].taskCount > 0 ? teamData[0].taskCount : '0';
  }

  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  // File Upload
  imageURL: string | undefined;
  fileChange(event:any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    document.getElementById('')
    this.teamForm.patchValue({
      // image_src: file.name
      image_src: 'avatar-8.jpg'
    }); 
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      (document.getElementById('member-img') as HTMLImageElement).src = this.imageURL;
    }
    reader.readAsDataURL(file)
  }

  // File Upload
  bgimageURL: string | undefined;
  bgfileChange(event:any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    document.getElementById('')
    this.teamForm.patchValue({
      // image_src: file.name
      image_src: 'avatar-8.jpg'
    }); 
    const reader = new FileReader();
    reader.onload = () => {
      this.bgimageURL = reader.result as string;
      (document.getElementById('cover-img') as HTMLImageElement).src = this.bgimageURL;
    }
    reader.readAsDataURL(file)
  }

  irPerfil(userData: any){
    this.TokenStorageService.saveUserProfile(userData);
    this.router.navigate(['/pages/profileUser']);
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

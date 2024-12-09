import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../../core/services/token-storage.service';import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user.service';import { AuthenticationService } from '../../../../core/services/auth.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

// Sweet Alert
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../toast-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

/**
 * Profile Settings Component
 */
export class SettingsComponent implements OnInit {
  userData:any;
  userLogin:any;
  
  submitted = false;
  userForm!: UntypedFormGroup;
  successmsg = false;
  error = '';
  passresetForm!: UntypedFormGroup;
  
  roles: any = [{id:2, nombre: 'Administrador'},{id:3, nombre: 'Evaluador'},{id:4, nombre: 'Encargado Area'},{id:5, nombre: 'Operador'}];
  rol: any = 2;
  rol_user: any;

  areas: any = [];
  area_id_select: any = [];
  projects: any = [];
  items: any = [];
  
  keyword = 'name';

  public Empresas = [
    {
      id: 'e13eefe',
      name: 'ConectIA',
    }
  ];

  empresaUsuario: any = '';
  
  proyectos_permisos: any = [];
  areas_permisos: any = [];
  areas_permisos_all: any = [];
  areas_all: any = [];
  areaForm!: UntypedFormGroup;

  constructor(private modalService: NgbModal, public toastService: ToastService, private TokenStorageService: TokenStorageService, private formBuilder: UntypedFormBuilder, private userService: UserProfileService, private router: Router, private authenticationService: AuthenticationService, private _location: Location, private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.userData =  !this.TokenStorageService.getUserProfile() ? this.TokenStorageService.getUser() : this.TokenStorageService.getUserProfile();
    this.userLogin =  this.TokenStorageService.getUser(); 

    //console.log('UserProfile',this.TokenStorageService.getUserProfile());
    //console.log('User',this.TokenStorageService.getUser());
    
    /**
     * Form Validation
     */
    
    this.userForm = this.formBuilder.group({
      nombre: [this.userData.nombre, [Validators.required]],
      apellido: [this.userData.apellido, [Validators.required]],
      rut: [this.userData.rut, [Validators.required]],
      telefono: [this.userData.telefono],
      email: [this.userData.email, [Validators.required, Validators.email]],
      rol: [this.userData.rol[0].toString(), [Validators.required]],
      projects: [[""]/*, [Validators.required]*/],
      areas: [[""]],
      empresa: [this.userData.empresa]
      //joinDate: ['']
    });

    this.passresetForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      cpassword: ['', [Validators.required]]
    });

    this.areaForm = this.formBuilder.group({
      ids: [''],
      areas: ['', [Validators.required]],
    });

    this.rol = this.userData.rol[0];
    this.rol_user = this.userLogin.rol[0];

    this.getAreas();
    this.getAreasTree(this.userData.empresaId);  
    this.getProjects();
    this.getEmpresas();

  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Illustrator', 'Photoshop', 'CSS', 'HTML', 'Javascript', 'Python', 'PHP'];

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

   // convenience getter for easy access to form fields
  get r() { return this.passresetForm.controls; }
  
  selectEvent(item: any) {  }
  onChangeSearch(search: any) {}
  onFocused(e: any) { }

  setRules(){

    // Password Validation set
    var myInput = document.getElementById("password-input") as HTMLInputElement;
    var letter = document.getElementById("pass-lower");
    var capital = document.getElementById("pass-upper");
    var number = document.getElementById("pass-number");
    var length = document.getElementById("pass-length");

    // When the user clicks on the password field, show the message box
    myInput.onfocus = function () {
      let input = document.getElementById("password-contain") as HTMLElement;
      input.style.display = "block"
    };

    // When the user clicks outside of the password field, hide the password-contain box
    myInput.onblur = function () {
      let input = document.getElementById("password-contain") as HTMLElement;
      input.style.display = "none"
    };

    // When the user starts to type something inside the password field
    myInput.onkeyup = function () {
      // Validate lowercase letters
      var lowerCaseLetters = /[a-z]/g;
      if (myInput.value.match(lowerCaseLetters)) {
          letter?.classList.remove("invalid");
          letter?.classList.add("valid");
      } else {
          letter?.classList.remove("valid");
          letter?.classList.add("invalid");
      }

      // Validate capital letters
      var upperCaseLetters = /[A-Z]/g;
      if (myInput.value.match(upperCaseLetters)) {
          capital?.classList.remove("invalid");
          capital?.classList.add("valid");
      } else {
          capital?.classList.remove("valid");
          capital?.classList.add("invalid");
      }

      // Validate numbers
      var numbers = /[0-9]/g;
      if (myInput.value.match(numbers)) {
          number?.classList.remove("invalid");
          number?.classList.add("valid");
      } else {
          number?.classList.remove("valid");
          number?.classList.add("invalid");
      }

      // Validate length
      if (myInput.value.length >= 8) {
          length?.classList.remove("invalid");
          length?.classList.add("valid");
      } else {
          length?.classList.remove("valid");
          length?.classList.add("invalid");
      }
    };
  }

  async sincronizarAreasPermisos(){
    let areas_permisos_array: any = [];
    
    for (let index = 0; index < this.areas_permisos.length; index++) {
     const area_permiso = this.areas_permisos[index];
     
         const index_area = this.areas_all.findIndex(
           (all2: any) =>
             all2.id == area_permiso
         );

         console.log('Area_permiso',index_area, area_permiso);
 
         if(index_area != -1){
 
           const area = this.areas_all[index_area];
           
           if(area.areaId){ 

              const index_padre = this.areas_all.findIndex(
                (all2: any) =>
                  all2.id == area.areaId
              );
      
              if(index_padre != -1){
      
                const area_padre = this.areas_all[index_padre];
              
                areas_permisos_array.push({id: area.id.toString(), nombre: area.nombre, padre: area_padre.nombre});
              }

           }else{
 
              areas_permisos_array.push({id: area.id.toString(), nombre: area.nombre, padre: null});
           }
 
         }
    }
 
    this.areas_permisos_all = areas_permisos_array;
    console.log('Areas_permisos_all',this.areas_permisos_all);
   }
  
  private getEmpresas(){
    this.Empresas = [];
    //this.showPreLoader();
    this.userService.get().pipe().subscribe(
      (obj: any) => {
        const usuarios = obj.data;
        
        const empresas_all = usuarios.filter((us: any) => us.rol.includes(2) && us.active == true);

        for (let index = 0; index < empresas_all.length; index++) {

          if(this.Empresas.findIndex((em: any) => em.id == empresas_all[index].empresaId) == -1){
            this.Empresas.push({id: empresas_all[index].empresaId, name: empresas_all[index].empresa ? empresas_all[index].empresa : empresas_all[index].nombre+' '+empresas_all[index].apellido});  
          }
        }
        
      }
    );
      //document.getElementById('elmLoader')?.classList.add('d-none')
  }

  private getPermisos(){
    const id = this.userData.id ? this.userData.id : (this.userData._id ? this.userData._id : null);
    this.userService.getPermisos(id).pipe().subscribe(
      (data: any) => {        
        const proyectos: any = data.data.projects;
        const areas: any = data.data.areas;

        let proyectos_id: any = [];
        let areas_id: any = [];

        for (let i1 = 0; i1 < proyectos.length; i1++) {
          proyectos_id.push(proyectos[i1].proyectoId.toString());
        }
        
        for (let i2 = 0; i2 < areas.length; i2++) {
          areas_id.push(areas[i2].areaId.toString());
        }

        this.userForm.get('projects')?.setValue(proyectos_id);
        this.userForm.get('areas')?.setValue(areas_id);

        this.proyectos_permisos = proyectos_id;
        this.areas_permisos = areas_id;
        this.sincronizarAreasPermisos();
    },
    (error: any) => {
    });
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
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
    document.getElementById('elmLoader')?.classList.add('d-none')
}

private getAreasTree(empresaId?: any){
  this.showPreLoader();
    this.projectsService.getAreasAll(1, empresaId).pipe().subscribe(
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

        console.log('Areas_all',this.areas_all);
        this.getPermisos();

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

selectRol(event: any){
  this.rol = event.target.value > 0 ? event.target.value : 2; 
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
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 5000 });
    });
    document.getElementById('elmLoader')?.classList.add('d-none')
  }
}

   /**
  * Update User
  */
   updateUser() {
    if (this.userForm.valid) {
      
      //let area_id = this.area_id_select[this.area_id_select.length - 1] ? this.area_id_select[this.area_id_select.length - 1].value : null;

      let areas_permisos = [];

      for (let index = 0; index < this.areas_permisos_all.length; index++) {
        areas_permisos.push(this.areas_permisos_all[index].id);
      }
      
      this.empresaUsuario = this.userForm.get('empresa')?.value;

      const data = {
        nombre: this.userForm.get('nombre')?.value,
        apellido: this.userForm.get('apellido')?.value,
        rut: this.userForm.get('rut')?.value,
        telefono: this.userForm.get('telefono')?.value,
        email: this.userForm.get('email')?.value,
        rol: [this.userForm.get('rol')?.value > 0 ? this.userForm.get('rol')?.value : this.rol_user],
        projects: this.userForm.get('projects')?.value,
        areas: areas_permisos/*this.userForm.get('areas')?.value*//*area_id ? area_id : null*/,
        empresa: typeof this.empresaUsuario === 'string' ? this.empresaUsuario : this.empresaUsuario.name,//this.userForm.get('empresa')?.value
      };
      
      const id = this.userData.id ? this.userData.id : (this.userData._id ? this.userData._id : null);

      this.userService.update(id, data).pipe().subscribe(
        (data: any) => {
          
      this.userData.nombre = this.userForm.get('nombre')?.value;
      this.userData.apellido = this.userForm.get('apellido')?.value;
      this.userData.rut = this.userForm.get('rut')?.value;
      this.userData.telefono = this.userForm.get('telefono')?.value;
      this.userData.email = this.userForm.get('email')?.value;
      this.userData.rol = [this.userForm.get('rol')?.value > 0 ? this.userForm.get('rol')?.value : this.rol_user];
      this.userData.empresa = typeof this.empresaUsuario === 'string' ? this.empresaUsuario : this.empresaUsuario.name,//this.userForm.get('empresa')?.value;

          //this.router.navigate(['/pages/profile']);    
          this.TokenStorageService.saveUserProfile(this.userData);
          this.regresar();
        },
      (error: any) => {
        console.log(error);
      });
    }
    this.submitted = true
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.passresetForm.invalid) {
      return;
    }
    
   this.showPreLoader();

   let token: any = localStorage.getItem('token') ? localStorage.getItem('token') : ''; 
   
   const id = this.userData.id ? this.userData.id : (this.userData._id ? this.userData._id : null);

    //Change Password
    this.authenticationService.updatePasswordProfile(this.r['password'].value,this.r['cpassword'].value, token, id).subscribe(
     (data: any) => {
       this.hidePreLoader();
       this.submitted = false;
       
       Swal.fire({
        title: 'Contraseña Actualizada!',
        icon: 'success',
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonColor: '#364574',
        cancelButtonColor: 'rgb(243, 78, 78)',
        confirmButtonText: 'OK',
        timer: 5000
      });
     },
     (error: any) => {
       
       this.hidePreLoader();
       console.log('error',error);
       Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Ha ocurrido un error..',
        showConfirmButton: true,
        timer: 5000,
      });
     });

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

  saveArea(){

    if (this.areaForm.valid) {
      this.showPreLoader();
      const area = this.areaForm.get('areas')?.value;

      console.log('AreaidSelect', this.area_id_select);

      let area_id = this.area_id_select[this.area_id_select.length - 1] ? this.area_id_select[this.area_id_select.length - 1].value : null;
      let area_nombre = this.area_id_select[this.area_id_select.length - 1] ? this.area_id_select[this.area_id_select.length - 1].label : null;

      const exist_area = this.areas_permisos_all.findIndex(
        (all2: any) =>
          all2.id == area_id
      );

      if(exist_area != -1){ 

        this.hidePreLoader();
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: '¡El area '+area_nombre+' ya se encuentra registrada!',
          showConfirmButton: true,
          timer: 5000,
        });

      }else{

        let area_padre_nombre = this.area_id_select[this.area_id_select.length - 2] ? this.area_id_select[this.area_id_select.length - 2].label : null;

        this.areas_permisos_all.push({id: area_id, nombre: area_nombre, padre: area_padre_nombre});
  
        this.items = [];
        this.area_id_select = [];
        this.areaForm.reset();
  
        this.hidePreLoader();
        this.modalService.dismissAll();
      }
      
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
  * Form data get
  */
  get form() {
    //return this.folderForm.controls;
    return this.areaForm.controls;
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
    if (id) {
      const index_permiso = this.areas_permisos_all.findIndex(
        (all2: any) =>
          all2.id == id
      );

      if(index_permiso != -1){ 
        this.areas_permisos_all.splice(index_permiso, 1);
      }
      /*this.projectsService.deleteInstallation(id)
      .subscribe(
        response => {*/
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          document.getElementById('lj_'+id)?.remove();
        /*},
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 5000 });
        });*/
    }
  }
  

  regresar() {
    this._location.back();
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

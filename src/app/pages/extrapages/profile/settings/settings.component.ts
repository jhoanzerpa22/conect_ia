import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../../core/services/token-storage.service';import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user.service';import { AuthenticationService } from '../../../../core/services/auth.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Router } from '@angular/router';
import {Location} from '@angular/common';

// Sweet Alert
import Swal from 'sweetalert2';

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

  constructor(private TokenStorageService: TokenStorageService, private formBuilder: UntypedFormBuilder, private userService: UserProfileService, private router: Router, private authenticationService: AuthenticationService, private _location: Location, private projectsService: ProjectsService) { }

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
      empresa: ['']
      //joinDate: ['']
    });

    this.passresetForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      cpassword: ['', [Validators.required]]
    });

    this.rol = this.userData.rol[0];
    this.rol_user = this.userLogin.rol[0];

    this.getAreas();
    this.getProjects();
    this.getPermisos();

  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Illustrator', 'Photoshop', 'CSS', 'HTML', 'Javascript', 'Python', 'PHP'];

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

   // convenience getter for easy access to form fields
  get r() { return this.passresetForm.controls; }

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
      
      const data = {
        nombre: this.userForm.get('nombre')?.value,
        apellido: this.userForm.get('apellido')?.value,
        rut: this.userForm.get('rut')?.value,
        telefono: this.userForm.get('telefono')?.value,
        email: this.userForm.get('email')?.value,
        rol: [this.userForm.get('rol')?.value > 0 ? this.userForm.get('rol')?.value : this.rol_user],
        projects: this.userForm.get('projects')?.value,
        areas: this.userForm.get('areas')?.value/*area_id ? area_id : null*/,
        empresa: this.userForm.get('empresa')?.value
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
      this.userData.empresa = this.userForm.get('empresa')?.value;

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

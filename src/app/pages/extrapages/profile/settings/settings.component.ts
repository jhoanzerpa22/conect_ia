import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../../core/services/token-storage.service';import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user.service';import { AuthenticationService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

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
  
  submitted = false;
  userForm!: UntypedFormGroup;
  successmsg = false;
  error = '';
  passresetForm!: UntypedFormGroup;
  
  roles: any = [{id:2, nombre: 'Administrador'},{id:3, nombre: 'Evaluador'},{id:4, nombre: 'Encargado Area'},{id:5, nombre: 'Operador'}];

  constructor(private TokenStorageService: TokenStorageService, private formBuilder: UntypedFormBuilder, private userService: UserProfileService, private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.userData =  !this.TokenStorageService.getUserProfile() ? this.TokenStorageService.getUser() : this.TokenStorageService.getUserProfile(); 
    
    /**
     * Form Validation
     */
    this.userForm = this.formBuilder.group({
      nombre: [this.userData.nombre, [Validators.required]],
      apellido: [this.userData.apellido, [Validators.required]],
      rut: [this.userData.rut, [Validators.required]],
      telefono: [this.userData.telefono],
      email: [this.userData.email, [Validators.required, Validators.email]],
      joinDate: ['']
    });

    this.passresetForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      cpassword: ['', [Validators.required]]
    });

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

   /**
  * Update User
  */
   updateUser() {
    if (this.userForm.valid) {
      const data = {
        nombre: this.userForm.get('nombre')?.value,
        apellido: this.userForm.get('apellido')?.value,
        rut: this.userForm.get('rut')?.value,
        telefono: this.userForm.get('telefono')?.value,
        email: this.userForm.get('email')?.value
      };
      this.userService.update(this.userData.id, data).pipe().subscribe(
        (data: any) => {
          this.router.navigate(['/pages/profile']);
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

    //Change Password
    this.authenticationService.updatePassword(this.r['password'].value,this.r['cpassword'].value, token).subscribe(
     (data: any) => {
       this.hidePreLoader();
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

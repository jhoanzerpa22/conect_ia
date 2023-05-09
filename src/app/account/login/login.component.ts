import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Login Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { first } from 'rxjs/operators';
import { ToastService } from './toast-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {

  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;

  toast!: false;

  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder,private authenticationService: AuthenticationService,private router: Router, private authFackservice: AuthfakeauthenticationService,private route: ActivatedRoute,public toastService: ToastService) {
      // redirect to home if already logged in
      if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
      }
     }

  ngOnInit(): void {
    //this.preLoader();
    if(localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validatyion
     */
     this.loginForm = this.formBuilder.group({
      email: [''/*'admin@themesbrand.com'*/, [Validators.required, Validators.email]],
      password: [''/*'123456'*/, [Validators.required]],
    });
    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (localStorage.getItem('toast')) {
      this.toastService.show('Registro exitoso.', { classname: 'bg-success text-center text-white', delay: 5000 });
      localStorage.removeItem('toast');
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
   onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
        return;
    }

    this.showPreLoader();

    // Login Api
    this.authenticationService.login(this.f['email'].value, this.f['password'].value).subscribe((data:any) => { 
      //if(data.status == 'success'){
      if(data.data){
        this.hidePreLoader();
        const user: any = {
        "_id": data.data.user.id,
        "nombre": data.data.user.nombre,
        "apellido": data.data.user.apellido,
        "email": data.data.user.email,
        "telefono": data.data.user.telefono,
        "rolId": data.rolId,
        "rol": data.user_rol ? data.user_rol.nombre : ''
        };
        //localStorage.setItem('toast', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', data.data.token);
        this.router.navigate(['/']);
      } else {
        this.hidePreLoader();
        this.toastService.show(data.data, { classname: 'bg-danger text-white', delay: 15000 });
      }
    },
    (error: any) => {
      this.hidePreLoader();
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });

    // stop here if form is invalid
    // if (this.loginForm.invalid) {
    //   return;
    // } else {
    //   if (environment.defaultauth === 'firebase') {
    //     this.authenticationService.login(this.f['email'].value, this.f['password'].value).then((res: any) => {
    //       this.router.navigate(['/']);
    //     })
    //       .catch(error => {
    //         this.error = error ? error : '';
    //       });
    //   } else {
    //     this.authFackservice.login(this.f['email'].value, this.f['password'].value).pipe(first()).subscribe(data => {
    //           this.router.navigate(['/']);
    //         },
    //         error => {
    //           this.error = error ? error : '';
    //         });
    //   }
    // }
  }

  /**
   * Password Hide/Show
   */
   toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
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

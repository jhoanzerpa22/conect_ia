import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/auth.service';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})

/**
 * Basic Component
 */
export class BasicComponent implements OnInit {

   // Login Form
   passresetForm!: UntypedFormGroup;
   submitted = false;
   passwordField!: boolean;
   confirmField!: boolean;
   error = '';
   returnUrl!: string;
   // set the current year
   year: number = new Date().getFullYear();
   token_validate: any = '';
 
   constructor(private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService, 
    private _router: Router, private route: ActivatedRoute, public toastService: ToastService) { }
 
   ngOnInit(): void {
     /**
      * Form Validatyion
      */
      this.passresetForm = this.formBuilder.group({
       password: ['', [Validators.required]],
       cpassword: ['', [Validators.required]]
     });

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

      this.route.params.subscribe(params => {
          this.validateToken(params['token']);
      });

   }
 
   // convenience getter for easy access to form fields
   get f() { return this.passresetForm.controls; }
 
   /**
    * Form submit
    */
    onSubmit() {
     this.submitted = true;
 
     // stop here if form is invalid
     if (this.passresetForm.invalid) {
       return;
     }

     //Change Password
     this.authenticationService.updatePassword(this.f['password'].value,this.f['cpassword'].value, this.token_validate).subscribe(
      (data: any) => {
        this._router.navigate(['/auth/success-msg/password']);
      },
      (error: any) => {
        console.log('error',error);
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });

   }

   validateToken(token: any){
          //Validate Token
          this.authenticationService.validToken(token).subscribe(
            (data: any) => {
              console.log('validado:',data);
              console.log('token_generado:',data.token);
              this.token_validate = data.token;
          },
          (error: any) => {
            this._router.navigate(['/auth/errors/expire']);
          });
   }

   /**
   * Password Hide/Show
   */
    togglepasswordField() {
      this.passwordField = !this.passwordField;
    }

    /**
   * Password Hide/Show
   */
    toggleconfirmField() {
      this.confirmField = !this.confirmField;
    }

}

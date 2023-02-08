import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';import { AuthenticationService } from '../../../../core/services/auth.service';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})

/**
 * Pass-Reset Basic Component
 */
export class BasicComponent implements OnInit {

  // Login Form
  passresetForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService,public toastService: ToastService) { }

  ngOnInit(): void {
    /**
     * Form Validatyion
     */
     this.passresetForm = this.formBuilder.group({
      email: ['', [Validators.required]]
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

    //Reset Password
    this.authenticationService.resetPassword(this.f['email'].value).pipe().subscribe(
      (data: any) => {
        this.toastService.show(data, { classname: 'bg-success text-center text-white', delay: 5000 });
    },
    (error: any) => {
      //this.error = error ? error : '';
      console.log('error:',error);
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });

  }

}

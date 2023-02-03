import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../../../../core/services/token-storage.service';import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';
import { UserProfileService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';

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

  constructor(private TokenStorageService: TokenStorageService, private formBuilder: UntypedFormBuilder, private userService: UserProfileService, private router: Router) { }

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
  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Illustrator', 'Photoshop', 'CSS', 'HTML', 'Javascript', 'Python', 'PHP'];

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

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

}

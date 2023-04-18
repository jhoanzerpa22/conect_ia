import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

import { ToastService } from '../toast-service';
import { TokenStorageService } from '../../../core/services/token-storage.service';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})

/**
 * Config Component
 */
export class ConfigComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  typeConfig: boolean = false;
  createForm!: UntypedFormGroup;
  nombreProyecto: any = '';
  descripcionProyecto: any = '';
  types: any = [];
  userData: any;

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private projectsService: ProjectsService,public toastService: ToastService, private TokenStorageService: TokenStorageService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Configuración de Empresas', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();
    this._router.navigate(['/projects/config/'+this.userData._id+'/areas']);
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.createForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

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

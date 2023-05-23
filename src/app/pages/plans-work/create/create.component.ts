import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-create-plan',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

/**
 * Create Component
 */
export class CreateComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  typeCreate: boolean = false;
  createForm!: UntypedFormGroup;
  nombreProyecto: any = '';
  descripcionProyecto: any = '';
  types: any = [];

  public Editor = ClassicEditor;

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private projectsService: ProjectsService,public toastService: ToastService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Planes de Trabajo' },
      { label: 'Crear Plan de Trabajo', active: true }
    ];

    this.createForm = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['']
    });
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.createForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

   savePlan(){
    // stop here if form is invalid
    if (this.createForm.invalid) {
      return;
    }

    this.nombreProyecto = this.f['nombre'].value;
    this.descripcionProyecto = this.f['descripcion'].value;

    const project: any = {
      nombre: this.nombreProyecto,
      descripcion: this.descripcionProyecto,
      tipoProyectoId: 'PlanTrabajo'
    };

    this.showPreLoader();

    this.projectsService.create(project).pipe().subscribe(
      (data: any) => {
        
        this.hidePreLoader();
        localStorage.setItem('toast', 'true');
        let proyecto: any = data.data;
        this._router.navigate(['/plans-work']);
    },
    (error: any) => {
      
      this.hidePreLoader();
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
    
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

import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects.service';

// Ck Editer
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastService } from '../toast-service';

@Component({
  selector: 'app-create',
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
  types: any = [];

  public Editor = ClassicEditor;

  constructor(private formBuilder: UntypedFormBuilder, private _router: Router, private projectsService: ProjectsService,public toastService: ToastService) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Crear Proyecto', active: true }
    ];

    this.createForm = this.formBuilder.group({
      nombre: ['', [Validators.required]]
    });

    this.getTypes();
  }
  
   // convenience getter for easy access to form fields
   get f() { return this.createForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

   siguiente(){
    // stop here if form is invalid
    if (this.createForm.invalid) {
      return;
    }

    this.nombreProyecto = this.f['nombre'].value;

    this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Crear Proyecto' },
      { label: 'Tipo', active: true }
    ];
    this.typeCreate = true;
   }

   getTypes(){
    this.projectsService.getTypes().pipe().subscribe(
      (data: any) => {
        this.types = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   saveProject(type: any){

    const project: any = {
      nombre: this.nombreProyecto,
      descripcion: "descripcion de proyecto",
      tipoProyectoId: type
    };

    this.projectsService.create(project).pipe().subscribe(
      (data: any) => {
        localStorage.setItem('toast', 'true');
        this._router.navigate(['/projects']);
    },
    (error: any) => {
      //this.error = error ? error : '';
      this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
    
   }

}

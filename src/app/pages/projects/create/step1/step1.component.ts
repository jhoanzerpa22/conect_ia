import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ProjectsService } from '../../../../core/services/projects.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})

/**
 * Step1 Component
 */
export class Step1Component implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  step: number = 1;
  step_total: number = 7;
  title: any = 'Paso 1: Define las variables generales de tu proyecto';
  
  regions: any = [];
  comunes: any = [];

  locationForm!: UntypedFormGroup;
  
  visibleSelection = 1;
  visibleBarOptions: Options = {
    floor: 1,
    ceil: 10,
    showSelectionBar: true
  };

  constructor(private _router: Router, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService,) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Variables Generales', active: true }
    ];

    this.locationForm = this.formBuilder.group({
      regionId: ['', [Validators.required]],
      comunaId: ['', [Validators.required]],
      zonaId: ['', [Validators.required]]
    });

    this.getRegions();
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.locationForm.controls; }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

   getRegions(){
    this.projectsService.getRegiones().pipe().subscribe(
      (data: any) => {
        this.regions = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   getComunes(id: any){
    this.projectsService.getComunas(id).pipe().subscribe(
      (data: any) => {
        this.comunes = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   changeStep(step: number){
    this.step = step;
    if(step > this.step_total){
      this._router.navigate(['/projects/anality']);
    }else if(step == this.step_total){
      this.visibleSelection = 2;
      this.title = 'Paso 2: Define las variables específicas de tu proyecto';
      this.breadCrumbItems = [
        { label: 'Proyectos' },
        { label: 'Variables Específicas', active: true }
      ];
    }
   }

}

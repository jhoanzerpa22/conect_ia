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
  zones: any = [];

  pregunta: any = {};
  respuestas: any = [];

  project_id: any = '';

  locationForm!: UntypedFormGroup;
  
  visibleSelection = 1;
  visibleBarOptions: Options = {
    floor: 1,
    ceil: 10,
    showSelectionBar: true
  };

  constructor(private _router: Router, private route: ActivatedRoute, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService) { }

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
      tipoZonaId: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
    });

    this.getRegions();
    this.getZones();
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

   getComunes(e?: any){
    this.comunes = [];
    let id: any = e.value;
    if(id){
      this.projectsService.getComunas(id).pipe().subscribe(
        (data: any) => {
          this.comunes = data.data;
      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
    }
   }

   getZones(){
    this.projectsService.getZones().pipe().subscribe(
      (data: any) => {
        this.zones = data.data;
    },
    (error: any) => {
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   getQuestion(step: any){
    
    this.showPreLoader();
    this.pregunta = {};
    this.respuestas = [];
    
    this.projectsService.getQuestion(step).pipe().subscribe(
      (data: any) => {
        console.log('question',data);
        const info: any = data.data;
        this.pregunta = info.pregunta;
        this.respuestas = info.respuesta;
        
        this.hidePreLoader(); 
    },
    (error: any) => {
      this.hidePreLoader();
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   changeStep(step: number){
    this.step = step;
    if(step > this.step_total){
      //this._router.navigate(['/projects/anality']);
      this._router.navigate(['/'+this.project_id+'/project-anality']);
    }else if(step == this.step_total){
      this.visibleSelection = 2;
      this.title = 'Paso 2: Define las variables específicas de tu proyecto';
      this.breadCrumbItems = [
        { label: 'Proyectos' },
        { label: 'Variables Específicas', active: true }
      ];
    }else if(step == 2){
      
      const location: any = {        
          "regionId": this.locationForm.get('regionId')?.value,
          "comunaId": this.locationForm.get('comunaId')?.value,
          "tipoZonaId": this.locationForm.get('tipoZonaId')?.value,
          "proyectoId": this.project_id
      };

      /*this.projectsService.saveLocation(location).pipe().subscribe(
        (data: any) => {

      },
      (error: any) => {
        //this.error = error ? error : '';
        //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });*/
    }

    this.getQuestion(step - 1);
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

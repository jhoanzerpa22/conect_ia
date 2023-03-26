import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ProjectsService } from '../../../../core/services/projects.service';import { ToastService } from '../../toast-service';

// Sweet Alert
import Swal from 'sweetalert2';

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
  
  selectValues: any = [];
  respuesta_id: any = null;

  constructor(private _router: Router, private route: ActivatedRoute, private formBuilder: UntypedFormBuilder, private projectsService: ProjectsService,public toastService: ToastService) { }

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
    this.getAnswerQuestion(2);
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

   getAnswerQuestion(step: any){
    
    this.showPreLoader();
    
    this.projectsService.getAnswerQuestion(step - 1).pipe().subscribe(
      (data: any) => {
        const info: any = data.data;
        this.step = step + 1;
        
          if((step + 1) > this.step_total){
            //this._router.navigate(['/projects/anality']);
            this._router.navigate(['/'+this.project_id+'/project-anality']);
          }else if((step + 1) == this.step_total){
            this.visibleSelection = 2;
            this.title = 'Paso 2: Define las variables específicas de tu proyecto';
            this.breadCrumbItems = [
              { label: 'Proyectos' },
              { label: 'Variables Específicas', active: true }
            ];
          }
        this.hidePreLoader(); 
        
        this.getQuestion(step);
    },
    (error: any) => {
      this.hidePreLoader();
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

        this.getAnswerQuestion(step + 1);
        
        this.hidePreLoader(); 
    },
    (error: any) => {
      this.hidePreLoader();
      //this.error = error ? error : '';
      //this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
    });
   }

   selectAnswer(answer: any, target: boolean){
    this.respuesta_id = target ? answer.target.value : answer;
   }

   selectVariable(id: any, respuesta: any){
      const index = this.selectValues.indexOf(id);
      if(index != -1){
        this.selectValues.splice(index, 1);
      }else{
        this.selectValues.push(id);
      }
      this.selectAnswer(respuesta, false);
   }
 
   validateVariable(id: any){
    const index = this.selectValues.indexOf(id);
    if(index != -1){
      return true;
    }else{
      return false;
    }
 }

   changeStep(step: number){
    
    if(step == 2){
      this.step = step;
      
      /*const location: any = {        
          "regionId": this.locationForm.get('regionId')?.value,
          "comunaId": this.locationForm.get('comunaId')?.value,
          "tipoZonaId": this.locationForm.get('tipoZonaId')?.value,
          "proyectoId": this.project_id
      };

      this.projectsService.saveLocation(location).pipe().subscribe(
        (data: any) => {*/
          this.getQuestion(step - 1);
      /*},
      (error: any) => {
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });*/
    }else{
      const index3 = this.respuestas.findIndex(
        (co: any) =>
          co.id == this.respuesta_id
      );

      if(index3 == -1){
        Swal.fire({ text: 'Seleccione al menos una respuesta', confirmButtonColor: '#299cdb', });
      }else{

      const answer: any = {        
        "preguntaId": step - 2,
        "respuestaId": this.respuesta_id
      };

      this.projectsService.saveAnswerQuestion(answer).pipe().subscribe(
        (data: any) => {

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
          }
          
          this.getQuestion(step - 1);
        },
        (error: any) => {
          //this.error = error ? error : '';
          this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
        });
      }
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

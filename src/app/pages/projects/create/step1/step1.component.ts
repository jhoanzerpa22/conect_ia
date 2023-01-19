import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';

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
  
  visibleSelection = 1;
  visibleBarOptions: Options = {
    floor: 1,
    ceil: 10,
    showSelectionBar: true
  };

  constructor(private _router: Router) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Variables Generales', active: true }
    ];
  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

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

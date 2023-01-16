import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';

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
  
  visibleSelection = 1;
  visibleBarOptions: Options = {
    floor: 1,
    ceil: 10,
    showSelectionBar: true
  };

  constructor() { }

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

}

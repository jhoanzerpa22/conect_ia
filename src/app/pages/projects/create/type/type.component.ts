import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss']
})

/**
 * Type Component
 */
export class TypeComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor() { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Proyectos' },
      { label: 'Crear Proyecto' },
      { label: 'Tipo', active: true }
    ];
  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

}

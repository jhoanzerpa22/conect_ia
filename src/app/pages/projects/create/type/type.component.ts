import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';

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

  project_id: any = '';

  constructor(private projectsService: ProjectsService, private _router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Requisitos legales' },
      { label: 'Vinculación', active: true }
    ];

    this.route.params.subscribe(params => {
      this.project_id = params['id'];
    });
  }

  /**
  * Multiple Default Select2
  */
   selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})

/**
 * Steps Component
 */
export class StepsComponent implements OnInit {

  project_id: any = '';

  constructor(private _router: Router, private route: ActivatedRoute, private projectsService: ProjectsService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.project_id = params['id'];
    });
  }

  comenzar(){
      /*this.showPreLoader();
      
      this.projectsService.getAnswerQuestion(6, this.project_id).pipe().subscribe(
        (data: any) => {
          const info: any = data.data;
          
              this._router.navigate(['/'+this.project_id+'/project-anality']);
            
          this.hidePreLoader(); 
      },
      (error: any) => {
        */
        this._router.navigate(['/projects/'+this.project_id+'/step']);
        /*
        this.hidePreLoader();
      });*/
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

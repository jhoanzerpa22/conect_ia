import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component Pages
import { AnalyticsComponent } from "./analytics/analytics.component";
import { CrmComponent } from "./crm/crm.component";
import { CryptoComponent } from "./crypto/crypto.component";
import { ProjectsComponent } from "./projects/projects.component";
import { NftComponent } from "./nft/nft.component";
import { JobComponent } from './job/job.component';
import { ProjectAnalityComponent } from './project-anality/project-anality.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectEvaluationsComponent } from './project-dashboard//project-evaluations/project-evaluations.component';
import { ProjectControlComponent } from './project-control/project-control.component';
import { ProjectResumenComponent } from './project-dashboard//project-resumen/project-resumen.component';

const routes: Routes = [
  {
    path: "analytics",
    component: AnalyticsComponent
  },
  {
    path: "crm",
    component: CrmComponent
  },
  {
    path: "crypto",
    component: CryptoComponent
  },
  {
    path: "projects_d",
    component: ProjectsComponent
  },
  {
    path: "nft",
    component: NftComponent
  },
  {
    path: "job",
    component: JobComponent
  },
  {
    path: ":id/project-anality",
    component: ProjectAnalityComponent
  },
  {
    path: ":id/project-dashboard",
    component: ProjectDashboardComponent
  },
  {
    path: ":id/project-dashboard/evaluations",
    component: ProjectEvaluationsComponent
  },
  {
    path: ":id/project-dashboard/resumen",
    component: ProjectResumenComponent
  },
  {
    path: ":id/project-control",
    component: ProjectControlComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DashboardsRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ListComponent } from "./list/list.component";
import { OverviewComponent } from "./overview/overview.component";
import { CreateComponent } from "./create/create.component";
import { TypeComponent } from "./create/type/type.component";
import { Step1Component } from "./create/step1/step1.component";
import { InstallationsComponent } from "./installations/installations.component";
import { AreasComponent } from "./areas/areas.component";
import { IdentificationComponent } from "./identification/identification.component";
import { ConfigComponent } from "./config/config.component";
import { InstallationsTypeComponent } from "./create/type/installations/installations.component";
import { NormasComponent } from "./normas/normas.component";
import { BodyLegalTypeComponent } from "./create/type/body-legal/body-legal.component";
import { BodyLegalDetailComponent } from "./create/type/body-legal/detail/body-legal-detail.component";
import { BodyLegalDetailIdComponent } from "./identification/detail/body-legal-detail.component";
import { ComplianceComponent } from "./create/compliance/compliance.component";
import { ComplianceDetailComponent } from "./create/compliance/detail/compliance-detail.component";
import { ComplianceFollowComponent } from "./create/compliance/follow/follow.component";
import { ComplianceTaskComponent } from "./create/compliance/task/task.component";
import { ComplianceAssessComponent } from "./create/compliance/assess/assess.component";
import { TeamComponent } from "./team/team.component";
import { EvaluationDetailComponent } from "./create/evaluation/detail/evaluation-detail.component";
import { EvaluationFollowComponent } from "./create/evaluation/follow/follow.component";
import { EvaluationTaskComponent } from "./create/evaluation/task/task.component";
import { EvaluationTaskViewComponent } from "./create/evaluation/task-view/task-view.component";
import { EvaluationDetailAllComponent } from "./create/evaluation/detail-all/evaluation-detail-all.component";
import { TaskControlComponent } from "./create/evaluation/task-control/task-control.component";

const routes: Routes = [
  {
    path: "",
    component: ListComponent
  },/*
  {
    path: "list",
    component: ListComponent
  },*/
  {
    path: "overview",
    component: OverviewComponent
  },
  {
    path: "create",
    component: CreateComponent,
    /*children: [
      { path: 'type', component: TypeComponent },
    ]*/
  },
  {
    path: "create/:type",
    component: CreateComponent,
  },
  {
    path: ":id/type",
    component: TypeComponent
  },
  {
    path: ":id/step",
    component: Step1Component
  },
  {
    path: "config",
    component: ConfigComponent,
    children: [
      { 
        path: ':id/areas', 
        component: AreasComponent,
        /*children: [
          {
            path: ':idArea/:nameArea',
            component: AreasComponent,
          }
        ]*/
      },
      {
        path: ':id/areas/:idArea/:nameArea',
        component: AreasComponent,
      },
      {
        path: ":id/installations",
        component: InstallationsComponent
      },
      {
        path: ":id/installations/:idInstallation/:nameInstallation",
        component: InstallationsComponent
      }
    ]
  },
  /*{
    path: ":id/areas/:idArea/:nameArea",
    component: AreasComponent
  },
  {
    path: ":id/areas",
    component: AreasComponent
  },
  {
    path: ":id/installations/:idInstallation/:nameInstallation",
    component: InstallationsComponent
  },
  {
    path: ":id/installations",
    component: InstallationsComponent
  },*/
  {
    path: "users",
    component: TeamComponent
  },
  {
    path: ":id/identification",
    component: IdentificationComponent
  },
  {
    path: ":id/type/installations/:idInstallation/:nameInstallation/bodylegal",
    component: BodyLegalTypeComponent
  },
  {
    path: ":id/type/installations",
    component: InstallationsTypeComponent
  },
  {
    path: ":id/type/bodylegal",
    component: BodyLegalTypeComponent
  },
  {
    path: ":idProject/type/bodylegal/:id/Detail/:idInstallation/:nameInstallation",
    component: BodyLegalDetailComponent
  },
  {
    path: ":idProject/type/bodylegal/:id/Detail",
    component: BodyLegalDetailComponent
  },
  {
    path: ":idProject/identification/bodylegal/:id/Detail",
    component: BodyLegalDetailIdComponent
  },
  {
    path: ":id/compliance",
    component: ComplianceComponent
  },
  {
    path: ":idProject/compliance/:id/Detail",
    component: ComplianceDetailComponent
  },
  {
    path: ":idProject/compliance/:idInstallation/Task/:idArticle/Assess/:id",
    component: ComplianceAssessComponent
  },
  {
    path: ":idProject/compliance/:idInstallation/Follow/:id",
    component: ComplianceFollowComponent
  },
  {
    path: ":idProject/compliance/:idInstallation/Task/:id",
    component: ComplianceTaskComponent
  },
  {
    path: ":idProject/evaluation/:id/Detail/:idEvaluation",
    component: EvaluationDetailComponent
  },
  {
    path: ":idProject/evaluation/:idInstallation/Follow/:id/:idEvaluation",
    component: EvaluationFollowComponent
  },
  {
    path: ":idProject/evaluation/:idInstallation/FollowView/:id/:idEvaluation",
    component: EvaluationTaskViewComponent
  },
  {
    path: ":idProject/evaluation/:idInstallation/FollowEdit/:id/:idEvaluation",
    component: EvaluationTaskComponent
  },
  {
    path: ":idProject/evaluation/:id/DetailAll",
    component: EvaluationDetailAllComponent
  },
  {
    path: ":idProject/evaluation/:idInstallation/TaskControl/:id",
    component: TaskControlComponent
  },
  {
    path: "normas",
    component: NormasComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectsRoutingModule {}

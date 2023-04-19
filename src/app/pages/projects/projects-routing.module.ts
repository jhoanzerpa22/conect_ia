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
import { ProjectAnalityComponent } from "./project-anality/project-anality.component";
import { ConfigComponent } from "./config/config.component";
import { InstallationsTypeComponent } from "./create/type/installations/installations.component";
import { BodyLegalTypeComponent } from "./create/type/body-legal/body-legal.component";
import { BodyLegalDetailComponent } from "./create/type/body-legal/detail/body-legal-detail.component";
import { ComplianceComponent } from "./create/compliance/compliance.component";
import { ComplianceDetailComponent } from "./create/compliance/detail/compliance-detail.component";
import { ComplianceFollowComponent } from "./create/compliance/follow/follow.component";
import { ComplianceTaskComponent } from "./create/compliance/task/task.component";

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
    path: ":id/project-anality",
    component: ProjectAnalityComponent
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
    path: ":id/compliance",
    component: ComplianceComponent
  },
  {
    path: ":idProject/compliance/:id/Detail",
    component: ComplianceDetailComponent
  },
  {
    path: ":idProject/compliance/:idInstallation/Follow/:id",
    component: ComplianceFollowComponent
  },
  {
    path: ":idProject/compliance/:idInstallation/Task/:id",
    component: ComplianceTaskComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectsRoutingModule {}

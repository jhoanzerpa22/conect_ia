import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ListComponent } from "./list/list.component";
import { OverviewComponent } from "./overview/overview.component";
import { CreateComponent } from "./create/create.component";
import { TypeComponent } from "./create/type/type.component";
import { Step1Component } from "./create/step1/step1.component";
import { InstallationsComponent } from "./installations/installations.component";
import { InstallationsTypeComponent } from "./create/type/installations/installations.component";
import { BodyLegalTypeComponent } from "./create/type/body-legal/body-legal.component";
import { BodyLegalDetailComponent } from "./create/type/body-legal/detail/body-legal-detail.component";

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
    ]  */
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
    path: ":id/installations",
    component: InstallationsComponent
  },
  {
    path: ":id/type/installations/:idInstallation/bodylegal",
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
    path: ":idProject/type/bodylegal/:id/Detail/:idInstallation",
    component: BodyLegalDetailComponent
  },
  {
    path: ":idProject/type/bodylegal/:id/Detail",
    component: BodyLegalDetailComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectsRoutingModule {}

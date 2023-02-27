import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ListComponent } from "./list/list.component";
import { OverviewComponent } from "./overview/overview.component";
import { CreateComponent } from "./create/create.component";
import { TypeComponent } from "./create/type/type.component";
import { Step1Component } from "./create/step1/step1.component";
import { InstallationsComponent } from "./installations/installations.component";

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
    path: "create/type",
    component: TypeComponent
  },
  {
    path: ":id/step",
    component: Step1Component
  },
  {
    path: ":id/installations",
    component: InstallationsComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectsRoutingModule {}

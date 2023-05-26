import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ListComponent } from "./list/list.component";
import { CreateComponent } from "./create/create.component";
import { PlansWorkAnalityComponent } from "./plans-work-anality/plans-work-anality.component";
import { PlansAssessComponent } from "./plans-work-anality/assess/assess.component";

const routes: Routes = [
  {
    path: "",
    component: ListComponent
  },
  {
    path: "create",
    component: CreateComponent,
  },
  {
    path: ":id/plans-work-anality",
    component: PlansWorkAnalityComponent
  },
  {
    path: ":idProject/Assess/:id",
    component: PlansAssessComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PlansWorkRoutingModule {}

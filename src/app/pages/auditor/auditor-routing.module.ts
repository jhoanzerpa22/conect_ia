import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { ListComponent } from "./list/list.component";
import { CreateComponent } from "./create/create.component";

const routes: Routes = [
  {
    path: "",
    component: ListComponent
  },
  {
    path: "create",
    component: CreateComponent,
    /*children: [
      { path: 'type', component: TypeComponent },
    ]*/
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuditorRoutingModule {}

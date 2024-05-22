import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { NormsComponent } from './norms.component';
//import { BodyLegalDetailComponent } from './detail/body-legal-detail.component';

const routes: Routes = [
  {
    path: "",
    component: NormsComponent
  },
  {
    path: ":type",
    component: NormsComponent
  },
  {
    path: ":id/Edit",
    component: NormsComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NormsRoutingModule {}

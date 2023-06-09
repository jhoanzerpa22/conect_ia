import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component pages
import { BodyLegalTypeComponent } from './body-legal.component';
import { BodyLegalDetailComponent } from './detail/body-legal-detail.component';


const routes: Routes = [
  {
    path: "",
    component: BodyLegalTypeComponent
  },
  {
    path: ":id/Detail",
    component: BodyLegalDetailComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LibraryRoutingModule {}

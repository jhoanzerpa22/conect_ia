import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { BasicComponent } from "./basic/basic.component";
import { CoverComponent } from "./cover/cover.component";
import { PasswordComponent } from "./password/password.component";

const routes: Routes = [
  {
    path: "basic",
    component: BasicComponent
  },
  {
    path: "cover",
    component: CoverComponent
  },
  {
    path: "password",
    component: PasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuccessMsgRoutingModule { }

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-password-success',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})

/**
 * Success Msg Basic Component
 */
export class PasswordComponent implements OnInit {

  // set the current year
  year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}

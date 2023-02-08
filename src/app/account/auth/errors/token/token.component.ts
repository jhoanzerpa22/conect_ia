import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-error',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})

/**
 * 404 Basic Component
 */
export class TokenComponent implements OnInit {

  // set the current year
  year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}

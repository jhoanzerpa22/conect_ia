import { Component, OnInit, EventEmitter, Input, Output, Inject } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

/**
 * Bread Crumbs Component
 */
export class BreadcrumbsComponent implements OnInit {

  @Input() title: string | undefined;
  @Input()
  breadcrumbItems!: Array<{
    active?: boolean;
    label?: string;
  }>;

  Item!: Array<{
    label?: string;
  }>;
  
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(private _location: Location) { }

  ngOnInit(): void {
  }
  
  backClicked() {
    this._location.back();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    //this.mobileMenuButtonClicked.emit();
      const currentSIdebarSize = document.documentElement.getAttribute("data-sidebar-size");
      if (document.documentElement.clientWidth >= 767) {
        if (currentSIdebarSize == null) {
          (document.documentElement.getAttribute('data-sidebar-size') == null || document.documentElement.getAttribute('data-sidebar-size') == "lg") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'lg')
         } else if (currentSIdebarSize == "md") {
           (document.documentElement.getAttribute('data-sidebar-size') == "md") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'md')
         } else {
           (document.documentElement.getAttribute('data-sidebar-size') == "sm") ? document.documentElement.setAttribute('data-sidebar-size', 'lg') : document.documentElement.setAttribute('data-sidebar-size', 'sm')
         }
       }
       
     if (document.documentElement.clientWidth <= 767) {
       document.body.classList.toggle('vertical-sidebar-enable');
     }
   }
}

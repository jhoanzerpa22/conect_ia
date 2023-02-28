import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

/**
 * Home Component
 */
export class HomeComponent implements OnInit {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  currentDate: any;

  constructor() {
    var dt = new Date();
    dt.setDate(dt.getDate() + 15);
    this.currentDate = { from: new Date(), to: dt }
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Tablero' },
      { label: 'Principal', active: true }
    ];
 }
  /**
 * Swiper Vertical  
   */
  Vertical: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    direction: 'vertical',
    slidesPerView: 2,
    spaceBetween: 0,
    mousewheel: true,
  };

  /**
   * Recent Activity
   */
  toggleActivity() {
    const recentActivity = document.querySelector('.layout-rightside-col');
    if (recentActivity != null) {
      recentActivity.classList.toggle('d-none');
    }

    if (document.documentElement.clientWidth <= 767) {
      const recentActivity = document.querySelector('.layout-rightside-col');
      if (recentActivity != null) {
        recentActivity.classList.add('d-block');
        recentActivity.classList.remove('d-none');
      }
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    const recentActivity = document.querySelector('.layout-rightside-col');
    if (recentActivity != null) {
      recentActivity.classList.remove('d-block');
    }
  }

}

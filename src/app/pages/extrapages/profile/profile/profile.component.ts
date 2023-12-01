import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Observable} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Swiper Slider
import { SwiperOptions } from 'swiper';

import { TokenStorageService } from '../../../../core/services/token-storage.service';

import { projectList, document } from './data';
import { projectListModel, documentModel } from './profile.model';
import { ProfileService } from './profile.service';
import { NgbdProfileSortableHeader, SortEvent } from './profile-sortable.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ProfileService, DecimalPipe]
})

/**
 * Profile Component
 */
export class ProfileComponent {

  projectList!: projectListModel[];
  document!: documentModel[];
  userData:any;
  roles: any = [{id:2, nombre: 'Administrador'},{id:3, nombre: 'Evaluador'},{id:4, nombre: 'Encargado Area'},{id:5, nombre: 'Operador'}];

  // Table data
  //ListJsList!: Observable<projectListModel[]>;
  //total: Observable<number>;
  @ViewChildren(NgbdProfileSortableHeader) headers!: QueryList<NgbdProfileSortableHeader>;

  constructor( private formBuilder: UntypedFormBuilder, private modalService: NgbModal,private TokenStorageService : TokenStorageService, public service: ProfileService, private router: Router) {
    //this.ListJsList = service.countries$;
    //this.total = service.total$;
   }

  ngOnInit(): void {
    
    if(location.pathname === '/pages/profileUser'){
      this.userData =  !this.TokenStorageService.getUserProfile() ? this.TokenStorageService.getUser() : this.TokenStorageService.getUserProfile();
    }else{
      this.userData =  this.TokenStorageService.getUser();
    }
      
    /**
     * Fetches the data
     */
     this.fetchData();
  }

  /**
   * Fetches the data
   */
   private fetchData() {
    this.document = document;
  }

  /**
   * Swiper setting
   */
   config = {
    slidesPerView: 1,
    initialSlide: 0,
    spaceBetween: 25,
    breakpoints:{
      768:{
        slidesPerView: 2, 
      },
      1200:{
        slidesPerView: 3, 
      }
    }
  };

  /**
   * Confirmation mail model
   */
   deleteId: any;
   confirm(content:any,id:any) {
     this.deleteId = id;     
     this.modalService.open(content, { centered: true });
   }

  // Delete Data
  deleteData(id:any) {    }
  
  getRol(rol: any){
    if(rol && rol[0] != 1){
      const index = this.roles.findIndex(
        (r: any) =>
          r.id == rol[0]
      );
  
      return index != -1 ? this.roles[index].nombre : 'Super Admin';
    }else{
      return "Super Admin";
    }
  }
  
  editarPerfil(){
    
    this.TokenStorageService.saveUserProfile(this.userData);

    this.router.navigate(['/pages/profile-setting']);
  }

}

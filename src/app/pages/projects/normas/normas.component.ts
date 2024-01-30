import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

import { NormasModel } from './normas.model';
import { Normas } from './data';
import { NormasService } from './normas.service';
import { NgbdNormasSortableHeader, SortEvent } from './normas-sortable.directive';
import { NormasAllService } from '../../../core/services/normas.service';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { ToastService } from '../toast-service';
import { TokenStorageService } from '../../../core/services/token-storage.service';

import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { round } from 'lodash';

interface FoodNode {
  id: number;
  normaId: string;
  name: string;
  ambito?: string;
}

const TREE_DATA: FoodNode[] = [
  {
    id: 1,
    normaId: '1',
    name: 'Norma 1',
    ambito: ''
  }
];
@Component({
  selector: 'app-normas',
  templateUrl: './normas.component.html',
  styleUrls: ['./normas.component.scss'],
  providers: [NormasService, DecimalPipe]

})

/**
 * Listjs table Component
 */
export class NormasComponent implements OnInit{

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  normaForm!: UntypedFormGroup;
  NormaData!: NormasModel[];
  checkedList: any;
  masterSelected!: boolean;
  NormaDatas: any;
  userData: any;
  normas_all: any = [];

  norma_id: any = '';
  norma_name: any = ''; 
  
  items: any = [];
  filtro: string = '';
  term:any;
  page: number = 1;
  total_paginate: number = 0;

  // Table data
  NormaList!: Observable<NormasModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdNormasSortableHeader) headers!: QueryList<NgbdNormasSortableHeader>;

  displayedColumns: string[] = ['normaId', 'name', 'ambito', 'accion'];

  constructor(private modalService: NgbModal, public service: NormasService, private formBuilder: UntypedFormBuilder, private normasService: NormasAllService, private _router: Router, private route: ActivatedRoute,public toastService: ToastService, private TokenStorageService: TokenStorageService) {
    this.NormaList = service.normas$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Normas', active: true }
    ];

    this.userData = this.TokenStorageService.getUser();

    /**
     * Form Validation
     */
    this.normaForm = this.formBuilder.group({
      ids: [''],
      normaId: ['', [Validators.required]],
      name: ['', [Validators.required]],
      ambito: ['']
    });

    this.getNormas();
    /**
     * fetches data
     */
    this.NormaList.subscribe(x => {
      this.NormaDatas = Object.assign([], x);
    });
  }

  /**
 * User grid data fetches
 */
  //  private _fetchData() {
  //   this.NormaData = Norma;
  //   this.NormaDatas = Object.assign([], this.NormaData);
  // }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.normaForm.reset();
      
      this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.normaForm.controls;
  }

  private getNormas(){
    this.showPreLoader();
      this.normasService.get().pipe().subscribe(
        (data: any) => {
          let obj: any = data.data;
          this.normas_all = [];
          for (let c in obj) {
            
              this.normas_all.push({ id: obj[c].id, normaId: obj[c].normaId, name: obj[c].name, ambito: obj[c].ambito });
              
          }
          //this.dataSource.data = this.normas_all;
          this.service.normas_data = this.normas_all;
          this.total_paginate = this.normas_all.lenght > 0 ? this.normas_all.lenght : 0;

          this.hidePreLoader();
      },
      (error: any) => {
        this.hidePreLoader();
        //this.error = error ? error : '';
        this.toastService.show(error, { classname: 'bg-danger text-white', delay: 15000 });
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    //}, 1200);
  }

  aplicarFiltro() {
    let filterText = this.filtro;
    //this.dataSource.data = this.tree_data.filter((t: any) => t.nombre.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.descripcion.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.area.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1 || t.area_principal.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
  }
  
  /**
  * Save saveNorma
  */
  saveNorma() {
    if (this.normaForm.valid) {
      
      this.showPreLoader();
      
      const normaId = this.normaForm.get('normaId')?.value;
      const name = this.normaForm.get('name')?.value;
      const ambito = this.normaForm.get('ambito')?.value;
              
        const norma: any = {
          normaId: normaId,
          name: name,
          ambito: ambito
        };
        
      if (this.normaForm.get('ids')?.value) {
        
        const idNorma = this.normaForm.get('ids')?.value;
        this.NormaDatas = this.NormaDatas.map((data: { id: any; }) => data.id === this.normaForm.get('ids')?.value ? { ...data, ...this.normaForm.value } : data)

        this.normasService.update(norma, idNorma).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           this.getNormas();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
          this.modalService.dismissAll()
        });

      } else {
        this.NormaDatas.push({
          normaId,
          name,
          ambito
        });

        this.normasService.create(norma).pipe().subscribe(
          (data: any) => {     
           this.hidePreLoader();
           this.toastService.show('El registro ha sido creado.', { classname: 'bg-success text-center text-white', delay: 5000 });

           /*if(this.norma_id){
            this.fetchDataItems();
           }else{
            this.fetchData();
           }*/         
           this.getNormas();
           this.modalService.dismissAll();
        },
        (error: any) => {
          
          this.hidePreLoader();
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
          this.modalService.dismissAll()
        });

      }
      
    }
    this.modalService.dismissAll();
    setTimeout(() => {
      this.normaForm.reset();
    }, 1000);
    this.submitted = true
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.NormaDatas.forEach((x: { state: any; }) => x.state = ev.target.checked)
  }

  isChecked(){
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      return true;
    }else{
      return false;
    }
  }

  /**
  * Confirmation mail model
  */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  /**
  * Multiple Delete
  */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    }
    else {
      Swal.fire({ text: 'Seleccione al menos una casilla de verificación', confirmButtonColor: '#299cdb', });
    }
    this.checkedValGet = checkedVal;

  }

  // Delete Data
  deleteData(id: any) {
    if (id) {
      this.normasService.delete(id)
      .subscribe(
        response => {
          this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          
          /*if(this.norma_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }*/
          this.getNormas();
          document.getElementById('lj_'+id)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        });
    }
    else {
      this.checkedValGet.forEach((item: any) => {
        this.normasService.delete(id)
      .subscribe(
        response => {
          //this.toastService.show('El registro ha sido borrado.', { classname: 'bg-success text-center text-white', delay: 5000 });
          /*if(this.norma_id){
            this.fetchDataItems();
          }else{
            this.fetchData();
          }*/
          this.getNormas();

          document.getElementById('lj_'+item)?.remove();
        },
        error => {
          console.log(error);
          this.toastService.show('Ha ocurrido un error..', { classname: 'bg-danger text-white', delay: 15000 });
        });
      });
    }
  }

  /**
  * Open modal
  * @param content modal content
  */
  editModal(content: any, id: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'lg', centered: true });
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Editar";
    //updateBtn.style.visibility = "hidden";
    var listData = this.normas_all.filter((data: { id: any; }) => data.id === id);
    this.normaForm.controls['normaId'].setValue(listData[0].normaId);
    this.normaForm.controls['name'].setValue(listData[0].name);
    this.normaForm.controls['ambito'].setValue(listData[0].ambito);
    this.normaForm.controls['ids'].setValue(listData[0].id);
  }

  pageTotal(totalRecords: any){
    let tp: number = round((totalRecords / 10),0);
    return (tp * 10) > totalRecords ? tp : (tp + 1);
  }

  pageChange(page: any){
      this.page = page;
  }

  // PreLoader
  showPreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0.8";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "visible";
    }
  }

  // PreLoader
  hidePreLoader() {
    var preloader = document.getElementById("preloader");
    if (preloader) {
        (document.getElementById("preloader") as HTMLElement).style.opacity = "0";
        (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
    }
  }

}

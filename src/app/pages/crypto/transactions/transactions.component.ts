import {Component, QueryList, ViewChildren} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Observable} from 'rxjs';

import { TransactionsModel } from './transactions.model';
import { Transactions } from './data';
import { TransactionsService } from './transactions.service';
import { NgbdTransactionsSortableHeader, SortEvent } from './transactions-sortable.directive';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  providers: [TransactionsService, DecimalPipe]
})

/**
 * Transactions Component
 */
export class TransactionsComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  masterSelected!:boolean;
  checkedList:any;

  // Table data
  TransactionList$!: Observable<TransactionsModel[]>;
  total$: Observable<number>;
  @ViewChildren(NgbdTransactionsSortableHeader) headers!: QueryList<NgbdTransactionsSortableHeader>;

  constructor(public service: TransactionsService) {
    setTimeout(() => {
      this.TransactionList$ = service.countries$;
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1200);
    this.total$ = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
     this.breadCrumbItems = [
      { label: 'Crypto' },
      { label: 'Transactions', active: true }
    ];
    this.service.currency = 'All'
  }

  /**
   * Swiper setting
   */
   config = {
    initialSlide: 0,
    slidesPerView: 1
  };

  setType(id:any){
    this.service.type = id
  }

}

/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {NormasModel} from './normas.model';
import {Normas} from './data';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import { ProjectsService } from '../../../core/services/projects.service';
import {SortColumn, SortDirection} from './normas-sortable.directive';
import { round } from 'lodash';

interface SearchResult {
  normas: NormasModel[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  pageTotal: number;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(normas: NormasModel[], column: SortColumn, direction: string): NormasModel[] {
  if (direction === '' || column === '') {
    return normas;
  } else {
    return [...normas].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function pageTotal(totalRecords: any){
  let tp: number = round((totalRecords / 10),0);
  return (tp * 10) > totalRecords ? tp : (tp + 1);
}

function matches(norma: NormasModel, term: string, pipe: PipeTransform) {
  return norma.name?.toLowerCase().includes(term.toLowerCase())
  || norma.normaId?.toLowerCase().includes(term.toLowerCase());

}

@Injectable({providedIn: 'root'})
export class NormasService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _normas$ = new BehaviorSubject<NormasModel[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0,
    pageTotal: 0
  };

  normas_data: any = [];

  constructor(private pipe: DecimalPipe) {
  
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._normas$.next(result.normas);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  initialSearch(data: any){
    console.log('initialSearch',data);
    this.normas_data = data;
    this._search$.next();
  }

  get normas$() { return this._normas$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }
  get pageTotal() { return this._state.pageTotal; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
  set pageTotal(pageTotal: number) { this._set({ pageTotal }); }
  set dataNormas(data: any) { this.initialSearch(data); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    let data: any = this.normas_data.length > 0 ? this.normas_data : Normas;
    let normas = sort(data/*Normas*/, sortColumn, sortDirection);
    // 2. filter
    normas = normas.filter(norma => matches(norma, searchTerm, this.pipe));
    const total = normas.length;

    // 3. paginate
    this.totalRecords = normas.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
        this.pageTotal = pageTotal(this.totalRecords);
    }
    normas = normas.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({normas, total});
  }
}

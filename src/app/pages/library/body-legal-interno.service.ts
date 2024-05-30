/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {BodyLegalTypeModel} from './body-legal.model';
import {BodyLegal} from './data';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from './body-legal-sortable.directive';

interface SearchResult {
  bodylegal: BodyLegalTypeModel[];
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
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(bodylegal: BodyLegalTypeModel[], column: SortColumn, direction: string): BodyLegalTypeModel[] {
  if (direction === '' || column === '') {
    return bodylegal;
  } else {
    return [...bodylegal].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(installation: BodyLegalTypeModel, term: string, pipe: PipeTransform) {
  return installation.TituloNorma?.toLowerCase().includes(term.toLowerCase())
  || installation.encabezado?.texto?.toLowerCase().includes(term.toLowerCase());

}

@Injectable({providedIn: 'root'})
export class BodyLegalInternoService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _bodylegal$ = new BehaviorSubject<BodyLegalTypeModel[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0
  };

  bodylegal_data: any = [];

  constructor(private pipe: DecimalPipe) {
  
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._bodylegal$.next(result.bodylegal);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  initialSearch(data: any){
    console.log('initialSearch',data);
    this.bodylegal_data = data;
    this._search$.next();
  }

  get bodylegal$() { return this._bodylegal$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
  set dataBodyLegal(data: any) { this.initialSearch(data); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    let data: any = this.bodylegal_data.length > 0 ? this.bodylegal_data : BodyLegal;
    let bodylegal = sort(data, sortColumn, sortDirection);
    // 2. filter
    bodylegal = bodylegal.filter(installation => matches(installation, searchTerm, this.pipe));
    const total = bodylegal.length;

    // 3. paginate
    this.totalRecords = bodylegal.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
    }
    //bodylegal = bodylegal.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({bodylegal, total});
  }
}

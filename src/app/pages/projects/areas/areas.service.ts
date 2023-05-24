/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

import {AreasModel} from './areas.model';
import {Areas} from './data';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import { ProjectsService } from '../../../core/services/projects.service';
import {SortColumn, SortDirection} from './areas-sortable.directive';
import { round } from 'lodash';

interface SearchResult {
  areas: AreasModel[];
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

function sort(areas: AreasModel[], column: SortColumn, direction: string): AreasModel[] {
  if (direction === '' || column === '') {
    return areas;
  } else {
    return [...areas].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function pageTotal(totalRecords: any){
  let tp: number = round((totalRecords / 10),0);
  return (tp * 10) > totalRecords ? tp : (tp + 1);
}

function matches(area: AreasModel, term: string, pipe: PipeTransform) {
  return area.nombre?.toLowerCase().includes(term.toLowerCase())
  || area.descripcion?.toLowerCase().includes(term.toLowerCase());

}

@Injectable({providedIn: 'root'})
export class AreasService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _areas$ = new BehaviorSubject<AreasModel[]>([]);
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

  areas_data: any = [];

  constructor(private pipe: DecimalPipe, private projectsService: ProjectsService) {
  
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._areas$.next(result.areas);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  initialSearch(data: any){
    console.log('initialSearch',data);
    this.areas_data = data;
    this._search$.next();
  }

  get areas$() { return this._areas$.asObservable(); }
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
  set dataAreas(data: any) { this.initialSearch(data); }
  set pageTotal(pageTotal: number) { this._set({ pageTotal }); }
  
  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    let data: any = this.areas_data.length > 0 ? this.areas_data : Areas;
    let areas = sort(data/*Areas*/, sortColumn, sortDirection);
    // 2. filter
    areas = areas.filter(area => matches(area, searchTerm, this.pipe));
    const total = areas.length;

    // 3. paginate
    this.totalRecords = areas.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
        this.endIndex = this.totalRecords;
        this.pageTotal = pageTotal(this.totalRecords);
    }
    areas = areas.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({areas, total});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Norma } from '../models/norma.models';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const API_URL_BACK = GlobalComponent.API_URL_BACK;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),

  };

@Injectable({ providedIn: 'root' })
export class NormasAllService {

    norma!: Norma;

    constructor(private http: HttpClient) { }

    getToken(){
        const httpOptions3 = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),
        
          };
          return httpOptions3;
    }
    /***
     * Get All Project
     */
    getAll() {
        return this.http.get<Norma[]>(`api/norm/normas/all`);
    }

    get() {
        return this.http.get(API_URL_BACK + 'norm/normas/all', /*httpOptions*/this.getToken());
    }

    getById(id: any) {
        return this.http.get(API_URL_BACK + 'norm/normas/'+id, /*httpOptions*/this.getToken());
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'norm/normas', data/*{
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "tipoProyectoId": data.tipoProyectoId
      }*/, /*httpOptions*/this.getToken());
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'norm/normas/'+id, data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'norm/normas/'+id, /*httpOptions*/this.getToken());
    }
}

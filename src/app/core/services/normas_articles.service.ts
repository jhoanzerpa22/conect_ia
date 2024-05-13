import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NormaArticle } from '../models/norma_article.models';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const API_URL_BACK = GlobalComponent.API_URL_BACK;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),

  };

@Injectable({ providedIn: 'root' })
export class NormasArticlesAllService {

    norma_article!: NormaArticle;

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
        return this.http.get<NormaArticle[]>(`api/norm_article/all`);
    }

    get() {
        return this.http.get(API_URL_BACK + 'norm_article/all', /*httpOptions*/this.getToken());
    }

    getById(id: any) {
        return this.http.get(API_URL_BACK + 'norm_article/'+id, /*httpOptions*/this.getToken());
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'norm_article', data/*{
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "tipoProyectoId": data.tipoProyectoId
      }*/, /*httpOptions*/this.getToken());
    
    }

    update(data: any, id: number): Observable<any> {
        return this.http.put(API_URL_BACK + 'norm_article/'+id, data, this.getToken());
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'norm_article/'+id, /*httpOptions*/this.getToken());
    }
    
    deleteByNorma(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'norm_article/all/'+id, /*httpOptions*/this.getToken());
    }
}

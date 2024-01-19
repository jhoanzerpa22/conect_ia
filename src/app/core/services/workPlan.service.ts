import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const API_URL_BACK = GlobalComponent.API_URL_BACK;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),

  };

@Injectable({ providedIn: 'root' })
export class WorkPlanService {

    constructor(private http: HttpClient) { }

    getToken(){
        const httpOptions3 = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),
        
          };
          return httpOptions3;
    }
    /***
     * Get All WorkPlan
     */
    getAll() {
        return this.http.get<any[]>(`api/work-plan`);
    }

    get() {
        return this.http.get(API_URL_BACK + 'work-plan', /*httpOptions*/this.getToken());
    }

    getById(id: any) {
        return this.http.get(API_URL_BACK + 'work-plan/'+id, /*httpOptions*/this.getToken());
    }

    getByParams(project_id: any, installation_id: any, cuerpo_id: any){
        return this.http.get(API_URL_BACK + 'work-plan/project/'+project_id+'/'+installation_id+'/'+cuerpo_id, /*httpOptions*/this.getToken());
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'work-plan', data, /*httpOptions*/this.getToken());
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'work-plan/'+id, data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'work-plan/'+id, /*httpOptions*/this.getToken());
    }

}

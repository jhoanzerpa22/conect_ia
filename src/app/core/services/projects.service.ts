import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Project } from '../models/project.models';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const API_URL_BACK = GlobalComponent.API_URL_BACK;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }),

  };

@Injectable({ providedIn: 'root' })
export class ProjectsService {

    project!: Project;

    constructor(private http: HttpClient) { }
    /***
     * Get All Project
     */
    getAll() {
        return this.http.get<Project[]>(`api/project`);
    }

    getTypes() {
        return this.http.get(API_URL_BACK + 'project/types', httpOptions);
    }
    
    get() {
        return this.http.get(API_URL_BACK + 'project', httpOptions);
    }

    getById(id: any) {
        return this.http.get(API_URL_BACK + 'project/'+id, httpOptions);
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "tipoProyectoId": data.tipoProyectoId
      }, httpOptions);
    
    }

    saveLocation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'question/location', {
        "regionId": data.regionId,
        "comunaId": data.comunaId,
        "tipoZonaId": data.tipoZonaId,
        "proyectoId": data.proyectoId        
      }, httpOptions);
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'project/'+id, data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/'+id, httpOptions);
    }

    getRegiones() {
        return this.http.get(API_URL_BACK + 'question/regions', httpOptions);
    }

    getComunas(id: any) {
        return this.http.get(API_URL_BACK + 'question/communes/'+id, httpOptions);
    }

    getZones() {
        return this.http.get(API_URL_BACK + 'question/zones', httpOptions);
    }

    getQuestion(step: any){
        return this.http.get(API_URL_BACK + 'question/main/'+step, httpOptions);
    }

    getInstallations(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/'+project_id, httpOptions);
    }

    createInstallation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project/installation', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "proyectoId": data.proyectoId
      }, httpOptions);
    
    }

    deleteInstallation(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/installation/'+id, httpOptions);
    }
}

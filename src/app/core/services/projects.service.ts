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

    getAnswerQuestion(questionId: any){
        return this.http.get(API_URL_BACK + 'question/answer/'+questionId, httpOptions);
    }

    saveAnswerQuestion(data: any): Observable<any> {
        return this.http.post(API_URL_BACK + 'question/answer/save', {
            "preguntaId": data.preguntaId,
            "respuestaId": data.respuestaId,
          }, httpOptions);
    }

    getInstallationsAll(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/all/'+project_id, httpOptions);
    }

    getInstallations(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/project/'+project_id, httpOptions);
    }
    
    getInstallationsItems(installation_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/'+installation_id, httpOptions);
    }

    getArticlesByInstallation(installation_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/article/'+installation_id, httpOptions);
    }

    createInstallation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project/installation', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "proyectoId": data.proyectoId,
        "areaId": data.areaId,
        "instalacionId": data.installationId
      }, httpOptions);
    
    }

    deleteInstallation(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/installation/'+id, httpOptions);
    }

    getAreasAll(project_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/all/'+project_id, httpOptions);
    }

    getAreas(project_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/project/'+project_id, httpOptions);
    }
    
    getAreasItems(area_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/'+area_id, httpOptions);
    }

    createArea(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project/areas', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "proyectoId": data.proyectoId,
        "areaId": data.areaId
      }, httpOptions);
    
    }

    deleteArea(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/areas/'+id, httpOptions);
    }
    
    getBodyLegal(project_id: any){
        return this.http.get(API_URL_BACK + 'norm/home', httpOptions);
    }
    
    getBodyLegalByNorma(id: any){
        return this.http.get(API_URL_BACK + 'norm/home/'+id, httpOptions);
    }

    conectArticleInstallation(installation_id: any, article: any){
        return this.http.post(API_URL_BACK + 'project/installation/article/'+installation_id, article, httpOptions);
    }
}

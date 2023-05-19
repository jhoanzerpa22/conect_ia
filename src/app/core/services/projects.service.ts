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
        return this.http.get<Project[]>(`api/project`);
    }

    getTypes() {
        return this.http.get(API_URL_BACK + 'project/types', /*httpOptions*/this.getToken());
    }
    
    get() {
        return this.http.get(API_URL_BACK + 'project', /*httpOptions*/this.getToken());
    }

    getById(id: any) {
        return this.http.get(API_URL_BACK + 'project/'+id, /*httpOptions*/this.getToken());
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "tipoProyectoId": data.tipoProyectoId
      }, /*httpOptions*/this.getToken());
    
    }

    saveLocation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'question/location', {
        "regionId": data.regionId,
        "comunaId": data.comunaId,
        "tipoZonaId": data.tipoZonaId,
        "proyectoId": data.proyectoId        
      }, /*httpOptions*/this.getToken());
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'project/'+id, data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/'+id, /*httpOptions*/this.getToken());
    }

    getRegiones() {
        return this.http.get(API_URL_BACK + 'question/regions', /*httpOptions*/this.getToken());
    }

    getComunas(id: any) {
        return this.http.get(API_URL_BACK + 'question/communes/'+id, /*httpOptions*/this.getToken());
    }

    getZones() {
        return this.http.get(API_URL_BACK + 'question/zones', /*httpOptions*/this.getToken());
    }

    getQuestion(step: any){
        return this.http.get(API_URL_BACK + 'question/main/'+step, /*httpOptions*/this.getToken());
    }

    getAnswerQuestion(questionId: any, project_id: any){
        return this.http.get(API_URL_BACK + 'question/answer/'+project_id+'/'+questionId, /*httpOptions*/this.getToken());
    }

    saveAnswerQuestion(data: any): Observable<any> {
        return this.http.post(API_URL_BACK + 'question/answer/save', {
            "preguntaId": data.preguntaId,
            "respuestaId": data.respuestaId,
            "proyectoId": data.proyectoId
          }, /*httpOptions*/this.getToken());
    }

    getInstallationsAll(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/all/'+project_id, /*httpOptions*/this.getToken());
    }

    getInstallations(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/project/'+project_id, /*httpOptions*/this.getToken());
    }

    getInstallationsUser(){
        return this.http.get(API_URL_BACK + 'project/installation/user', /*httpOptions*/this.getToken());
    }
    
    getInstallationsItems(installation_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/'+installation_id, /*httpOptions*/this.getToken());
    }

    getArticlesByInstallation(installation_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/article/'+installation_id, /*httpOptions*/this.getToken());
    }

    getArticlesInstallationByProyecto(proyecto_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/article-by-proyecto/'+proyecto_id, /*httpOptions*/this.getToken());
    }

    getArticlesByInstallationBody(installation_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/article/'+installation_id+'/legalText', /*httpOptions*/this.getToken());
    }

    createInstallation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project/installation', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "proyectoId": data.proyectoId,
        "areaId": data.areaId,
        "instalacionId": data.installationId
      }, /*httpOptions*/this.getToken());
    
    }

    deleteInstallation(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/installation/'+id, /*httpOptions*/this.getToken());
    }

    getAreasAll(project_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/all/'+project_id, /*httpOptions*/this.getToken());
    }

    getAreas(project_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/project/'+project_id, /*httpOptions*/this.getToken());
    }

    getAreasUser(){
        return this.http.get(API_URL_BACK + 'project/areas/user', /*httpOptions*/this.getToken());
    }
    
    getAreasItems(area_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/'+area_id, /*httpOptions*/this.getToken());
    }

    createArea(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project/areas', {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "proyectoId": data.proyectoId,
        "areaId": data.areaId
      }, /*httpOptions*/this.getToken());
    
    }

    deleteArea(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/areas/'+id, /*httpOptions*/this.getToken());
    }
    
    getBodyLegal(project_id: any){
        return this.http.get(API_URL_BACK + 'norm/home', /*httpOptions*/this.getToken());
    }
    
    getBodyLegalByNorma(id: any){
        return this.http.get(API_URL_BACK + 'norm/home/'+id, /*httpOptions*/this.getToken());
    }

    conectArticleInstallation(installation_id: any, article: any){
        return this.http.post(API_URL_BACK + 'project/installation/article/'+installation_id, article, /*httpOptions*/this.getToken());
    }
    
    saveEvaluation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'evaluation', data, /*httpOptions*/this.getToken());
    
    }

    getFindingsByInstallationArticle(installation_article_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+installation_article_id+'/findings', /*httpOptions*/this.getToken());
    }

    createTask(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'evaluation/task', data, /*httpOptions*/this.getToken());
    
    }

    getTasksByFinding(finding_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+finding_id+'/tasks', /*httpOptions*/this.getToken());
    }

    getTaskById(task_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+task_id+'/task', this.getToken());
    }

    updateTaskStatus(task_id: any, estado: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'evaluation/tasks/state/'+task_id, {estado: estado}, this.getToken());
    }

}

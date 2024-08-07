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
    
    getLocation(proyectoId: any) {
        return this.http.get(API_URL_BACK + 'question/location/'+proyectoId, /*httpOptions*/this.getToken());
    }
    
    saveLocation(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'question/location', {
        "regionId": data.regionId,
        "comunaId": data.comunaId,
        "tipoZonaId": data.tipoZonaId,
        "proyectoId": data.proyectoId        
      }, /*httpOptions*/this.getToken());
    
    }
    
    updateLocation(proyectoId: any, data: any): Observable<any> {
        
        return this.http.put(API_URL_BACK + 'question/location/'+proyectoId, {
        "regionId": data.regionId,
        "comunaId": data.comunaId,
        "tipoZonaId": data.tipoZonaId        
      }, /*httpOptions*/this.getToken());
    
    }


    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'project', data/*{
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "tipoProyectoId": data.tipoProyectoId
      }*/, /*httpOptions*/this.getToken());
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'project/'+id, data, /*httpOptions*/this.getToken());
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
        return this.http.get(API_URL_BACK + 'project/installation/all'/*+project_id*/, /*httpOptions*/this.getToken());
    }

    getInstallations(project_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/project/'+project_id, /*httpOptions*/this.getToken());
    }

    getInstallationsUser(empresaId?: any){
        const empresaIdURL = empresaId ? '?empresaId='+empresaId : '';

        return this.http.get(API_URL_BACK + 'project/installation/user'+empresaIdURL, /*httpOptions*/this.getToken());
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

    getInstallationByAreaId(area_id: any){
        return this.http.get(API_URL_BACK + 'project/installation/byArea/'+area_id, /*httpOptions*/this.getToken());
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

    updateInstallation(data: any, id: any): Observable<any> {
    
        return this.http.put(API_URL_BACK + 'project/installation/'+id, {
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
    
    getAreasAll(project_id: any, empresaId?: any){
        const empresaIdURL = empresaId ? '?empresaId='+empresaId : '';
        return this.http.get(API_URL_BACK + 'project/areas/all'+empresaIdURL, /*httpOptions*/this.getToken());
    }

    getAreas(project_id: any){
        return this.http.get(API_URL_BACK + 'project/areas/project/'+project_id, /*httpOptions*/this.getToken());
    }

    getAreasUser(empresaId?: any){
        const empresaIdURL = empresaId ? '?empresaId='+empresaId : '';
        return this.http.get(API_URL_BACK + 'project/areas/user'+empresaIdURL, /*httpOptions*/this.getToken());
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

    updateArea(data: any, id: any): Observable<any> {
    
        return this.http.put(API_URL_BACK + 'project/areas/'+id, {
        "nombre": data.nombre,
        "descripcion": data.descripcion,
        "areaId": data.areaId
      }, /*httpOptions*/this.getToken());
    
    }

    deleteArea(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/areas/'+id, /*httpOptions*/this.getToken());
    }
    
    getBodyLegal(project_id: any){
        return this.http.get(API_URL_BACK + 'norm/home', /*httpOptions*/this.getToken());
    }
    
    getNormas(page: any, limit: any, ambito?: any, search?: any, tipo?: any, empresaId?: any){
        let ambito_url = ambito ? '&ambito='+ambito : ''
        let search_url = search ? '&search='+search : '';
        let tipo_url = tipo ? '&tipo='+tipo : '';
        let empresaId_url = empresaId ? '&empresaId='+empresaId : '';

        return this.http.get(API_URL_BACK + 'norm/all?limit='+limit+'&page='+page+ambito_url+search_url+tipo_url+empresaId_url, /*httpOptions*/this.getToken());
    }
    
    getBodyLegalALl(project_id: any, page: number, limit: number){
        return this.http.get(API_URL_BACK + 'norm?page='+page+'&limit='+limit, /*httpOptions*/this.getToken());
    }
    
    getBodyLegalByNorma(id: any){
        return this.http.get(API_URL_BACK + 'norm/home/'+id, /*httpOptions*/this.getToken());
    }

    getBodyLegalSearch(project_id: any, search: string, limit: number){
        return this.http.get(API_URL_BACK + 'norm/search?query='+search+'&limit='+limit, /*httpOptions*/this.getToken());
    }
    
    getBodyLegalSearchChile(page: number, search?: string, limit?: number, tipo?: any){
        const tipo_filter = tipo && tipo != undefined && tipo != null ? '&tipo='+tipo : '';
        return this.http.get(API_URL_BACK + 'norm/searchChile?query='+search+'&page='+page+'&limit='+limit+tipo_filter, /*httpOptions*/this.getToken());
    }

    conectArticleInstallation(installation_id: any, article: any){
        return this.http.post(API_URL_BACK + 'project/installation/article/'+installation_id, article, /*httpOptions*/this.getToken());
    }

    deleteArticleInstallation(id: any){
        return this.http.delete(API_URL_BACK + 'project/installation/article/'+id, /*httpOptions*/this.getToken());
    }

    estadoArticleInstallation(estado: any, id: any): Observable<any> {
    
        return this.http.put(API_URL_BACK + 'project/installation/article/'+id, {
        "estado": estado
      }, /*httpOptions*/this.getToken());
    
    }

    conectCuerpoInstallation(data: any){
        return this.http.post(API_URL_BACK + 'project/cuerpoLegal/instalacion', data, /*httpOptions*/this.getToken());
    }

    deleteCuerpoInstallation(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'project/cuerpoLegal/instalacion/'+id, /*httpOptions*/this.getToken());
    }

    conectArticleProyect(article: any){
        return this.http.post(API_URL_BACK + 'project/article', article, this.getToken());
    }

    deleteNormaProyect(normaId: any, project_id: any){
        return this.http.delete(API_URL_BACK + 'project/norma/'+normaId+'/'+project_id, /*httpOptions*/this.getToken());    
    }

    getCuerpoInstallationProyect(project_id: any){
        return this.http.get(API_URL_BACK + 'project/cuerpoLegal/instalacion/'+project_id, this.getToken());
    }

    getArticleProyect(project_id: any){
        return this.http.get(API_URL_BACK + 'project/article/'+project_id, this.getToken());
    }
    
    saveEvaluation(data: any): Observable<any> {
        
        const httpOptions4 = {
            headers: new HttpHeaders({ /*'Content-Type': 'multipart/form-data',*/'Authorization': `Bearer ${localStorage.getItem('token')}`, "Accept": 'application/json', 'enctype': 'multipart/form-data', }),
          };

        return this.http.post(API_URL_BACK + 'evaluation', data, httpOptions4);
    
    }

    editEvaluation(id: any, data: any): Observable<any> {
    
        const httpOptions6 = {
            headers: new HttpHeaders({ /*'Content-Type': 'multipart/form-data',*/'Authorization': `Bearer ${localStorage.getItem('token')}`, "Accept": 'application/json', 'enctype': 'multipart/form-data', }),
          };

        return this.http.put(API_URL_BACK + 'evaluation/'+id, data, httpOptions6);
    
    }

    getFindingsByInstallationArticle(installation_article_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+installation_article_id+'/findings', /*httpOptions*/this.getToken());
    }

    getEvaluationsByInstallationArticle(installation_article_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+installation_article_id+'/evaluations', /*httpOptions*/this.getToken());
    }

    createFinding(data: any){
        const httpOptions4 = {
            headers: new HttpHeaders({ /*'Content-Type': 'multipart/form-data',*/'Authorization': `Bearer ${localStorage.getItem('token')}`, "Accept": 'application/json', 'enctype': 'multipart/form-data', }),
          };

        return this.http.post(API_URL_BACK + 'evaluation/findings', data, httpOptions4);
    }

    createTask(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'evaluation/task', data, /*httpOptions*/this.getToken());
    
    }

    getTasksByFinding(finding_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+finding_id+'/tasks', /*httpOptions*/this.getToken());
    }

    getTasksByProyect(project_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+project_id+'/proyect/tasks', /*httpOptions*/this.getToken());
    }

    getTaskById(task_id: any){
        return this.http.get(API_URL_BACK + 'evaluation/'+task_id+'/task', this.getToken());
    }

    updateTaskStatus(task_id: any, data: any): Observable<any> {
        const httpOptions5 = {
            headers: new HttpHeaders({ /*'Content-Type': 'multipart/form-data',*/'Authorization': `Bearer ${localStorage.getItem('token')}`, "Accept": 'application/json', 'enctype': 'multipart/form-data', }),
          };

        return this.http.put(API_URL_BACK + 'evaluation/tasks/state/'+task_id, data, httpOptions5);
    }

    updateTask(data: any, task_id: any): Observable<any> {
          
        return this.http.put(API_URL_BACK + 'evaluation/task/'+task_id, data, /*httpOptions*/this.getToken());
    }

    getTasks(){
        return this.http.get(API_URL_BACK + 'work-plan/task', this.getToken());
    }

    getFindings(){
        return this.http.get(API_URL_BACK + 'evaluation/findings', this.getToken());
    }

    setAttributesArticle(id: any, attribute: any){
        return this.http.post(API_URL_BACK + 'project/article/'+id, attribute, this.getToken());
    }

    estadoProyecto(estado: any, id: any): Observable<any> {
    
        return this.http.put(API_URL_BACK + 'project/setStatus/'+id, {
        "estado": estado
      }, /*httpOptions*/this.getToken());
    
    }
    
    getEvaluations(project_id: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/'+project_id, this.getToken());
    }
    
    getEvaluationsAll(projects_ids: any){
        return this.http.post(API_URL_BACK + 'evaluacionProyecto/proyectos', {proyectosIds: JSON.stringify(projects_ids)}, this.getToken());
    }
    
    getTasksAll(projects_ids: any){
        return this.http.post(API_URL_BACK + 'evaluation/tasks', {proyectosIds: JSON.stringify(projects_ids)}, this.getToken());
    }

    createEvaluation(data: any/*project_id: any, active?: boolean, auditoria?: boolean, auditor?: any, empresa?: any, comentario?: any*/): Observable<any> {
        return this.http.post(API_URL_BACK + 'evaluacionProyecto', data, this.getToken());
    }
    
    updateEvaluation(idEvaluation: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'evaluacionProyecto/'+idEvaluation, data, this.getToken());
    }

    homologarEvaluation(idEvaluation: any, project_id: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/homologar/'+idEvaluation+'/'+project_id, this.getToken());
    }
    
    homologarEvaluationByInstallation(idEvaluation: any, project_id: any, installation_id: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/homologar/'+idEvaluation+'/'+project_id+'/installation/'+installation_id, this.getToken());
    }
    
    homologarEvaluationByArticle(idEvaluation: any, project_id: any, installation_article_id: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/homologar/'+idEvaluation+'/'+project_id+'/article/'+installation_article_id, this.getToken());
    }
    
    getDeleteInstallations(idEvaluation: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/getDeleteInstallations/'+idEvaluation, this.getToken());
    }
    
    deleteEvaluationInstallation(idEvaluation: any, installation_article_id: any){
        return this.http.get(API_URL_BACK + 'evaluacionProyecto/deleteEvaluationInstallation/'+idEvaluation+'/'+installation_article_id, this.getToken());
    }

    getDashboard(project_id: any, empresaId?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }

        return this.http.post(API_URL_BACK + 'dashboard/project/graphics', { projectId: project_id, empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }
    
    getDashboardEvaluationsNew(project_id: any, empresaId?: any, filter?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'alta';//'construccion';                
                break;
            case 'Media':
                criticidad = 'media';//'operacion';                
                break;
            case 'Baja':
                criticidad = 'baja';//'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }

        if(filter){
            filter = filter.toLowerCase();
        }
//installations
        return this.http.post(API_URL_BACK + 'dashboard/project/graphics/data', { projectId: project_id, empresaId, /*areaId,*/ filters: filter, criticity: criticidad, areaId: areaId/*{
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        }*/ }, this.getToken());
    }
    
    getDashboardArea(project_id: any, empresaId?: any, type?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){ //'instancias' | 'cuerpoLegal' | 'articulos'
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }
        return this.http.post(API_URL_BACK + 'dashboard/project/graphics/horizontal?type='+type, { projectId: project_id, empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }

    getDashboardInstalations(project_id: any, empresaId?: any, type?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){ //'instancias' | 'cuerpoLegal' | 'articulos'
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }
        return this.http.post(API_URL_BACK + 'dashboard/project/graphics/horizontal/instalaciones?type='+type, { projectId: project_id,empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }

    getDashboardEvaluations(project_id: any, empresaId?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }

        return this.http.post(API_URL_BACK + 'dashboard/project/graphicsEvaluations', { projectId: project_id, empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }

    getDashboardAreaEvaluations(project_id: any, empresaId?: any, type?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){ //'instancias' | 'cuerpoLegal' | 'articulos'
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }
        return this.http.post(API_URL_BACK + 'dashboard/project/graphicsEvaluations/horizontal?type='+type, { projectId: project_id, empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }

    getDashboardInstalationsEvaluations(project_id: any, empresaId?: any, type?: any, cuerpoId?: any, areaId?: any, atributo?: any, criticidad?: any, articuloId?: any){ //'instancias' | 'cuerpoLegal' | 'articulos'
        
        switch (criticidad) {
            case 'Alta':
                criticidad = 'construccion';                
                break;
            case 'Media':
                criticidad = 'operacion';                
                break;
            case 'Baja':
                criticidad = 'cierre';                
                break;
        
            default:            
                criticidad = undefined;
                break;
        }
        return this.http.post(API_URL_BACK + 'dashboard/project/graphicsEvaluations/horizontal/instalaciones?type='+type, { projectId: project_id, empresaId, areaId, filters: {
            articuloTipo: atributo,
            criticidad: criticidad,
            normaId: cuerpoId,
            articuloId: articuloId
        } }, this.getToken());
    }
    
    saveNotify(evaluation_id: any, data: any): Observable<any> {
        const httpOptions5 = {
            headers: new HttpHeaders({ /*'Content-Type': 'multipart/form-data',*/'Authorization': `Bearer ${localStorage.getItem('token')}`, "Accept": 'application/json', 'enctype': 'multipart/form-data', }),
          };

        return this.http.put(API_URL_BACK + 'evaluation/notify/'+evaluation_id, data, httpOptions5);
    }

}

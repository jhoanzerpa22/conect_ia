import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/auth.models';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const API_URL_BACK = GlobalComponent.API_URL_BACK;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable({ providedIn: 'root' })
export class UserProfileService {

    user!: User;

    constructor(private http: HttpClient) { }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    /***
     * Facked User Register
     */
    register(user: User) {
        return this.http.post(`/users/register`, user);
    }

    get() {
        return this.http.get(API_URL_BACK + 'user/list', httpOptions);
    }

    create(data: any): Observable<any> {
        
        return this.http.post(API_URL_BACK + 'user/create', {
        "email": data.email,
        "nombre": data.nombre,
        "apellido": data.apellido,
        "rut": data.rut,
        "telefono": data.telefono,
        "password": '12345678',
        "confirm_password": '12345678'
      }, httpOptions);
    
    }

    update(id: any, data: any): Observable<any> {
        return this.http.put(API_URL_BACK + 'user/'+id+'/update', data);
    }

    delete(id: any): Observable<any> {
        return this.http.delete(API_URL_BACK + 'user/'+id+'/delete', httpOptions);
    }
}

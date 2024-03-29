import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from '../models/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalComponent } from "../../global-component";

const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {

    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
     }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(email: string, nombre: string, password: string, confirm_password: string) {        
        // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        // Register Api
        return this.http.post(AUTH_API + 'signUp', {
            "email": email,
            "nombre": nombre,/*
            "apellido": apellido,
            "rut": rut,
            "telefono": telefono,*/
            "password": password,
            "confirm_password": confirm_password,
            "rol": [2]
          }, httpOptions);
    }

    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    login(email: string, password: string) {
        // return getFirebaseBackend()!.loginUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        return this.http.post(AUTH_API + 'signIn', {
            email,
            password
          }, httpOptions);
    }

    /**
     * Returns the current user
     */
    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }

    /**
     * Logout the user
     */
    logout() {
        // logout the user
        // return getFirebaseBackend()!.logout();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('Profile');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null!);
    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        /*return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });*/
        return this.http.post(AUTH_API + 'forgot-pass', {
            "email": email
          }, httpOptions);
    }

    /**
     * Validate Token
     * @param token token
     */
    validToken(token: string) {
        return this.http.get(AUTH_API + 'check/'+token, httpOptions);
    }

    /**
     * Update Password
     * @param password password
     * @param cpassword cpassword
     */
    updatePassword(password: string, cpassword: string, token: string) {
        var httpOptionsToken = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` })
          };

        return this.http.put(AUTH_API + 'update-pass', {
            "password": password,
            "confirm_password": cpassword
        }, httpOptionsToken);
    }

    
    updatePasswordProfile(password: string, cpassword: string, token: string, id: number) {
        var httpOptionsToken = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` })
          };

        return this.http.put(AUTH_API + 'update-pass-profile/'+id, {
            "password": password,
            "confirm_password": cpassword
        }, httpOptionsToken);
    }

}


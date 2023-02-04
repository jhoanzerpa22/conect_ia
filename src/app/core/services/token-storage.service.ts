import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'currentUser';
const USER_PROFILE = 'profileUser';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);    
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  public saveUserProfile(user: any): void {
    //window.sessionStorage.removeItem(USER_PROFILE);
    //window.sessionStorage.setItem(USER_PROFILE, JSON.stringify(user));
    localStorage.removeItem('Profile');
    localStorage.setItem('Profile', JSON.stringify(user));
  }

  public getUserProfile(): any {
    //const user = window.localStorage.getItem(USER_PROFILE);
    const user = localStorage.getItem('Profile');
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }
}

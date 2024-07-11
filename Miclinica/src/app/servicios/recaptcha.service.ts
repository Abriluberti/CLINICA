import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  private apiUrl = '/validar-recaptcha'; // Cambiar por la URL correcta de tu backend

  constructor(private http: HttpClient) { }

  validarRecaptcha(token: string) {
    return this.http.post<any>(this.apiUrl, { token });
  }
}

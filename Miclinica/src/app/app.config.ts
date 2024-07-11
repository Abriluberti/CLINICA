import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const firebaseConfig = {
  apiKey: "AIzaSyDNLikYsZRPri9E24kHAdcwHDgdmDqql_s",
  authDomain: "clinica-efd25.firebaseapp.com",
  projectId: "clinica-efd25",
  storageBucket: "clinica-efd25.appspot.com",
  messagingSenderId: "445632815623",
  appId: "1:445632815623:web:5be72d4431af83a61080a2"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth(getApp())),
    provideFirestore(() => getFirestore(getApp())),
    provideStorage(() => getStorage(getApp())),
    CommonModule,
    MatDialogModule,
    FormsModule,
    
    DatePipe,
    BrowserAnimationsModule,
    NgxChartsModule,
    RecaptchaModule ,
    BrowserModule,
    HttpClient,
    ReactiveFormsModule,
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: FIREBASE_OPTIONS,
      useValue: firebaseConfig
    }
  ]
};

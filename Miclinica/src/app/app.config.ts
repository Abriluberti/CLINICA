import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

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
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    {
      provide: FIREBASE_OPTIONS,
      useValue: firebaseConfig
    }
  ]
};

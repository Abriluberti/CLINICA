import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  getUserRole(uid: string): Observable<string> {
    return this.firestore.collection('usuarios').doc(uid).valueChanges().pipe(
      map((user: any) => user.rol)
    );
  }
}
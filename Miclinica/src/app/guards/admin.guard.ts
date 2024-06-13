import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        console.log('User:', user); // Depuración
        if (!user) {
          console.log('No user logged in'); // Depuración
          this.router.navigate(['/login']);
          return of(false);
        }
        return this.firestore.collection('administradores').doc(user.uid).get().pipe(
          map(adminDoc => adminDoc.exists),
          tap(isAdmin => {
            console.log('Is Admin:', isAdmin); // Depuración
            if (!isAdmin) {
              Swal.fire('', 'Usuario no autorizado', 'error').then(() => {
                console.log('Navigating to login'); // Depuración
                this.router.navigate(['/login']);
              });
            } else {
              console.log('Admin access granted'); // Depuración
            }
          })
        );
      }),
      map(isAdmin => {
        console.log('Final admin check:', isAdmin); // Depuración
        return isAdmin;
      })
    );
  }
}

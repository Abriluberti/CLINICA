import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Directive({
  selector: '[appEspecialistaOnly]'
})
export class EspecialistaOnlyDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) {
          // Si el usuario no está autenticado, borrar la vista
          this.viewContainer.clear();
          return of(false);
        } else if (this.router.url.includes('/login')) {
          // Si el usuario está autenticado y en la página de login, cerrar sesión y borrar la vista
          this.afAuth.signOut();
          this.viewContainer.clear();
          return of(false);
        } else {
          // Si el usuario está autenticado, verificar si es administrador
          return this.firestore.collection('administradores').doc(user.uid).get().pipe(
            map(adminDoc => adminDoc.exists)
          );
        }
      })
    ).subscribe(isAdmin => {
      if (isAdmin) {
        // Si el usuario es un administrador, crear la vista
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        // Si el usuario no es un administrador, borrar la vista
        this.viewContainer.clear();
      }
    });
  }
}
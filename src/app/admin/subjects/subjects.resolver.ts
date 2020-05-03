
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from '../entity.interface';
import { Store, select } from '@ngrx/store';
import { AdminState } from '../store/MainReducer';
import { areSubjectsLoaded } from '../store/subject/subject-selectors';
import { tap, filter, first } from 'rxjs/operators';
import { loadSubjects } from '../store/subject/subject-actions';
import { areDataLoaded } from '../store/store-operators';

@Injectable({ providedIn: 'root' })
export class SubjectResolver implements Resolve<boolean> {
    constructor(private store: Store<AdminState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // return this.store.pipe(
        //     select(areSubjectsLoaded),
        //     tap((subjectsLoaded) => {
        //         if (!subjectsLoaded) {
        //             this.store.dispatch(loadSubjects());
        //         }
        //     }),
        //     filter(subjectsLoaded => subjectsLoaded),
        //     first()
        // )
        return this.store.pipe(
            select(areSubjectsLoaded),
            areDataLoaded(() => {
                this.store.dispatch(loadSubjects())
            })
        )
    }
}

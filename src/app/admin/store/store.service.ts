import { AdminState } from './MainReducer';
import { Store, ActionCreator } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { areFacultiesLoaded } from './faculty/faculty-selectors';
import { first, switchMap, tap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
// this.store.pipe(
    //   select(areFacultiesLoaded),
    //   tap((hasLoaded) => {
    //     if (!hasLoaded) {
    //       this.store.dispatch(loadAllFaculties())
    //     }
    //   })
    // ).subscribe();

@Injectable()
export class StoreService {
    constructor(private store: Store<AdminState>) { }

    fetchFaculties(action) {
        const selector = () => this.store.select(areFacultiesLoaded)
        return this.getFacultyData(selector, action);
    }
    private getFacultyData(select: () => Observable<boolean>, action) {
        return select().pipe(
            tap(hasLoaded => {
                if (!hasLoaded) {
                    this.store.dispatch(action())
                }
            })
        );
    }
}
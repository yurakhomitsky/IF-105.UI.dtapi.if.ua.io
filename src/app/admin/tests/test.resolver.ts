
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AdminState } from '../store/MainReducer';
import { tap, filter, first, map } from 'rxjs/operators';
import { selectLoadedTestSubject } from '../store/tests/tests-selectors';
import { loadTests } from '../store/tests/tests-actions';

@Injectable({ providedIn: 'root' })
export class TestsResolver implements Resolve<boolean> {
    constructor(private store: Store<AdminState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.store.pipe(
            select(selectLoadedTestSubject),
            tap((subjectIds) => {
                if (!subjectIds.includes(+route.params.id)) {
                    this.store.dispatch(loadTests({subjectId: +route.params.id}))
                }
            }),
            filter(subjectIds => subjectIds.includes(+route.params.id)),
            map((subjectIds) => !!subjectIds),
            first()
        )
    }
}
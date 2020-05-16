import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Injectable } from '@angular/core'
import { StudentState } from '../store/mainReducer'
import { Store, select } from '@ngrx/store'
import { areTimeTableLoaded } from '../store/studentTimeTable/studentTimeTable.selectors'
import { areDataLoaded } from 'src/app/admin/store/store-operators'
import { loadTimeTable } from '../store/studentTimeTable/studentTimeTable.actions'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable({ providedIn: 'root'})
export class StudentInfoResolver implements Resolve<boolean> {
    constructor(private store: Store<StudentState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.store.pipe(
            select(areTimeTableLoaded),
            areDataLoaded(() => {
                console.log('Here');
                this.store.dispatch(loadTimeTable())
            }),
        )
    }
}

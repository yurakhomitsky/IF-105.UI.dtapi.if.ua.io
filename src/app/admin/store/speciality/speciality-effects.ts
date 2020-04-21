import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SpecialityAction from './speciality-actions';
import { ApiService } from 'src/app/shared/services/api.service';
import { concatMap, map, catchError,  tap, filter, withLatestFrom } from 'rxjs/operators';
import {  EMPTY } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Store } from '@ngrx/store';
import { AdminState } from '../MainReducer';
import { areSpecialitiesLoaded } from './speciality-selectors';

@Injectable()
export class SpecialityEffects {

    loadSpecialities$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(SpecialityAction.loadAllSpecialities),
                withLatestFrom(this.store.select(areSpecialitiesLoaded)),
                filter(([ action, hasLoaded ]) => !hasLoaded),
                concatMap(() => {
                   return this.apiService.getEntity('Speciality').pipe(
                        map(data =>SpecialityAction.allSpecialitiesLoaded({ specialities: data })),
                        catchError(() => EMPTY)
                        )}
                    ),

        );
    });

    saveSpeciality$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(SpecialityAction.specialityUpdate),
                concatMap((action) =>
                this.apiService.updEntity('Speciality',action.update.changes,+action.update.id,)
                    .pipe(
                        tap(() => this.modalService.openSnackBar('Спеціальність оновлено')),
                        catchError((err) => {
                            if (err.error.response.includes('Error when update')) {
                                this.modalService.openSnackBar('Інформація про спеціальність не змінювалась');
                                return EMPTY;
                            }

                        })
                    )
                )
        )
    }, {dispatch: false});



    constructor(private actions$: Actions,
                private modalService: ModalService,
                private apiService: ApiService,
                private store: Store<AdminState>) {
    }
}

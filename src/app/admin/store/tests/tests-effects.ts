import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, catchError,  } from 'rxjs/operators';
import {  EMPTY } from 'rxjs';
import { ApiService } from 'src/app/shared/services/api.service';
import TestActions from './tests-types';


@Injectable()
export class TestEffects {

    loadTests$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(TestActions.loadTests),
                concatMap(({subjectId}) => {
                   return  this.apiService.getTestsBySubject('test', subjectId).pipe(
                        map(data => {
                            return data.response === 'no records' ? TestActions.testError({failed: true})
                            : TestActions.testsLoaded({tests: data, subjectId})
                        }),
                        catchError(() => EMPTY)
                        )}
                    ),

        );
    });


    constructor(private actions$: Actions,
                private apiService: ApiService) {
    }
}

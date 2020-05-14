import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SubjectAction from './subject-actions';
import { ApiService } from 'src/app/shared/services/api.service';
import { concatMap, map, catchError, tap, exhaustMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';

@Injectable()
export class SubjectEffects {

    loadSubjects$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(SubjectAction.loadSubjects),
                 exhaustMap(() => {
                   return this.apiService.getEntity('Subject').pipe(
                        map(data => SubjectAction.allSubjectsLoaded({ subjects: data })),
                        catchError(() => {
                            this.modalService.openSnackBar('Не вдалося виконати запит','alert');
                          return  EMPTY;
                        })
                        )}
                    ),

        );
    });

    constructor(private actions$: Actions,
                private modalService: ModalService,
                private apiService: ApiService,
               ) {
    }
}

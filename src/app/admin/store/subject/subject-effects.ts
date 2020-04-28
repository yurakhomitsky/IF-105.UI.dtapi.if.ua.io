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
                            this.modalService.openSnackBar('Не вдалося виконати запит');
                          return  EMPTY;
                        })
                        )}
                    ),

        );
    });

    // saveSubject$ = createEffect(() => {
    //     return this.actions$.pipe(
    //             ofType(SubjectAction.subjectUpdate),
    //             concatMap((action) =>
    //             this.apiService.updEntity('Subject',action.update.changes,+action.update.id)
    //                 .pipe(
    //                     tap(() => this.modalService.openSnackBar('Предмет оновлено')),
    //                     catchError((err) => {
    //                         if (err.error.response.includes('Error when update')) {
    //                             this.modalService.openSnackBar('Інформація про Предмет не змінювалась');
    //                             return EMPTY;
    //                         }

    //                     })
    //                 )
    //             )
    //     )
    // }, {dispatch: false});



    constructor(private actions$: Actions,
                private modalService: ModalService,
                private apiService: ApiService,
               ) {
    }
}

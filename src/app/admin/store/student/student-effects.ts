import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, catchError,  } from 'rxjs/operators';
import {  EMPTY } from 'rxjs';
import { ApiService } from 'src/app/shared/services/api.service';
import StudentAction from './student-types';

@Injectable()
export class StudentEffects {

    loadStudents$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(StudentAction.loadStudents),
                concatMap((action) => {
                   return  this.apiService.getEntityByAction('Student', 'getStudentsByGroup', action.idGroup).pipe(
                        map(data => {
                            return data.response === 'no records' ? StudentAction.noStudents({failed: true})
                            : StudentAction.studentsLoaded({students: data})
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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TimeTableAction from './studentTimeTable.actions';
import { concatMap, map, catchError, tap, filter, withLatestFrom, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { StudentInfoService } from '../../student-info.service';

@Injectable()
export class TimeTableEffects {

    loadTimeTable$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(TimeTableAction.loadTimeTable),
                switchMap(() => {
                   return this.studentInfoService.getUserData().pipe(
                        map(([studentInfo,timeTableArray,testArray]) => {
                          return  TimeTableAction.allTimeTableLoaded({userInfo: studentInfo,
                                    timetable: this.studentInfoService.formDataSource(timeTableArray,testArray)})
                        }),
                        catchError((err) => {
                            console.log(err);
                           this.modalService.openSnackBar('Помилка завантаження даних','alert');
                           return EMPTY;
                        })
                        )}
                    ),

        );
    });




    constructor(private actions$: Actions,
                private studentInfoService: StudentInfoService,
                private modalService: ModalService) {
    }
}

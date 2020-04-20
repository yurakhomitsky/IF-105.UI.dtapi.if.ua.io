import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, catchError,  tap, filter, withLatestFrom } from 'rxjs/operators';
import {  EMPTY } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Store } from '@ngrx/store';
import { AdminState } from '../MainReducer';
import GroupAction from './group-types';
import { GroupService } from '../../group/group.service';
import { ApiService } from 'src/app/shared/services/api.service';

@Injectable()
export class GroupEffects {

    loadGroups$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(GroupAction.loadGroups),
                concatMap((action) => {
                   return  this.groupService.getListGroup(action.pageSize,action.offset).pipe(
                        map(data =>GroupAction.groupsLoaded({ groups: data })),
                        catchError(() => EMPTY)
                        )}
                    ),

        );
    });

    saveGroup$ = createEffect(() => {
        return this.actions$.pipe(
                ofType(GroupAction.groupUpdate),
                concatMap((action) =>
                this.apiService.updEntity('group',action.update.changes, +action.update.id)
                    .pipe(
                        tap(() => this.modalService.openSnackBar('Групу оновлено')),
                        catchError((err) => {
                            if (err.error.response.includes('Error when update')) {
                                this.modalService.openSnackBar('Інформація про групу не змінювалась');
                                return EMPTY;
                            }
                            else {
                                this.modalService.openErrorModal('Помилка оновлення');
                                return EMPTY;
                             }

                        })
                    )
                )
        )
    }, {dispatch: false});



    constructor(private actions$: Actions,
                private modalService: ModalService,
                private groupService: GroupService,
                private apiService: ApiService,
                private store: Store<AdminState>) {
    }
}

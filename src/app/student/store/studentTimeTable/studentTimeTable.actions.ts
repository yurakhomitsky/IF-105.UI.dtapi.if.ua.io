import { createAction, props } from '@ngrx/store';
import { TestsForStudent } from 'src/app/shared/entity.interface';

export const loadTimeTable = createAction(
    '[TimeTable data] Load  all TimeTable'
);
export const allTimeTableLoaded = createAction(
    '[TimeTable data] all TimeTable loaded',
    props<{ timetable: any[], userInfo: object}>()
);
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { TestsForStudent } from 'src/app/shared/entity.interface';
import { createReducer, on } from '@ngrx/store';
import * as TimeTableAction from './studentTimeTable.actions';
export interface TimeTableState extends EntityState<TestsForStudent> {
    allTimeTableLoaded: boolean;
    userInfo: object
}

export const adapter = createEntityAdapter<TestsForStudent>({
    selectId: test => test.test_id,
});

export const initialTimeTableState = adapter.getInitialState({
    allTimeTableLoaded: false,
    userInfo: null
});

export const timeTableReducer = createReducer(
    initialTimeTableState,
    // tslint:disable-next-line:max-line-length
    on(TimeTableAction.allTimeTableLoaded, (state, {userInfo, timetable}) => adapter.addAll(timetable, { ...state, userInfo, allTimeTableLoaded: true })),
);


export const { selectAll: TimeTableAll } = adapter.getSelectors();
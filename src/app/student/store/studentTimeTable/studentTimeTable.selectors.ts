import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StudentState } from '../mainReducer';
import { TimeTableAll } from './studentTimeTable.reducers';

export const selectStudentState = createFeatureSelector<StudentState>('student');

export const selectTimeTableState = createSelector(
    selectStudentState,
    state => state.timetable
)
export const selectTimeTable = createSelector(
    selectTimeTableState,
    TimeTableAll
)

export const areTimeTableLoaded = createSelector(
    selectTimeTableState,
    state => state.allTimeTableLoaded
);

export const selectUserInfo = createSelector(
    selectTimeTableState,
    userInfo => userInfo.userInfo
)

export const selectTimeTableAndUserInfo = createSelector(
    selectTimeTable,
    selectUserInfo,
    (timeTable,userInfo) => {
        if (userInfo && timeTable.length > 0)
        return {
            userInfo,
            timeTable
        }; else return undefined
    }
)
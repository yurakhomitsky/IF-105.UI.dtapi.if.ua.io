import { AdminState } from '../MainReducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectStudents } from './student-reducers';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectStudentState = createSelector(
    selectAdminState,
    state => state.student
)

export const selectAllStudents = createSelector(
    selectStudentState,
    selectStudents
)

export const selectLoadedStudentsGroup = createSelector(
    selectStudentState,
    student => student.groupsLoaded
)
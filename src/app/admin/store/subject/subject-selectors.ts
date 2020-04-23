import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from '../MainReducer';
import { selectAllSubjects } from './subject-reducers';



export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectSubjectState = createSelector(
    selectAdminState,
    state => state.subject
)
export const selectAllSubject = createSelector(
    selectSubjectState,
    selectAllSubjects
)

export const areSubjectsLoaded = createSelector(
    selectSubjectState,
    state => state.allSubjectsLoaded
);
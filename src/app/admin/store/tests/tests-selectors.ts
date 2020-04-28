import { AdminState } from '../MainReducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectTests } from './tests-reducers';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectTestState = createSelector(
    selectAdminState,
    state => state.test
)

export const selectAllTests = createSelector(
    selectTestState,
    selectTests
)

export const selectLoadedTestSubject = createSelector(
    selectTestState,
    test => test.subjectsLoaded
)
export const selectLoadingTests = createSelector(
    selectTestState,
    test => test.loading
);
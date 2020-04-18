import { AdminState } from '../MainReducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import {selectSpecialities} from './speciality-reducer'

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectSpecialityState = createSelector(
    selectAdminState,
    state => state.speciality
)

export const selectAllSpecialities = createSelector(
    selectSpecialityState,
    selectSpecialities
)

export const areSpecialitiesLoaded = createSelector(
    selectSpecialityState,
    state => state.allSpecialitiesLoaded
);
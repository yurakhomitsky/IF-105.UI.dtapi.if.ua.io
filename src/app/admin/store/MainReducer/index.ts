import {
    ActionReducerMap,
} from '@ngrx/store';
import * as fromFaculty  from '../faculty/faculty-reducers';
import * as fromSpeciality from '../speciality/speciality-reducer';
import * as fromGroup from '../group/group-reducers';





export const initialAdminState: AdminState = {
    faculty: fromFaculty.initialFacultiesState,
    speciality: fromSpeciality.initialSpecialityState,
    group: fromGroup.initialGroupsState
};

export interface AdminState {
    faculty: fromFaculty.FacultyState;
    speciality: fromSpeciality.SpecialityState
    group: fromGroup.GroupState

}

export const reducers: ActionReducerMap<AdminState> = {
    faculty: fromFaculty.facultiesReducer,
    speciality: fromSpeciality.specialityReducer,
    group: fromGroup.groupsReducer

}


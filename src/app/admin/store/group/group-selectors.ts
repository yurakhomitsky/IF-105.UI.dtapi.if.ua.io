import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from '../MainReducer';
import { selectGroups} from './group-reducers';
import { selectAllFaculties } from '../faculty/faculty-selectors';
import { selectAllSpecialities } from '../speciality/speciality-selectors';
import { Group } from 'src/app/shared/entity.interface';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

export const selectGroupState = createSelector(
    selectAdminState,
    state => state.group
)

export const selectAllGroups = createSelector(
    selectGroupState,
    selectGroups
)
export const selectIdsSpeciality = createSelector(
    selectAllGroups,
    (groups) => {
    const specialitiesIds = [...new Set(groups.map(item => +item.speciality_id))];
    return specialitiesIds
    }
)
export const selectIdsFaculties = createSelector(
    selectAllGroups,
    (groups) => {
    const facultiesIds = [...new Set(groups.map(item => +item.faculty_id))];
    return facultiesIds
    }

)
export const selectFacultiesGroups = createSelector(
    selectAllFaculties,
    selectIdsFaculties,
    (faculties,ids) => {
        return faculties.filter(item => ids.includes(+item.faculty_id))
    }
)

export const selectSpecialitiesGroups = createSelector(
    selectAllSpecialities,
    selectIdsSpeciality,
    (faculties,ids) => {
        return faculties.filter(item => ids.includes(+item.speciality_id))
    }
)

export const readyGroup = createSelector(
    selectAllGroups,
    selectFacultiesGroups,
    selectSpecialitiesGroups,
    (groups, faculties, specialities) => {
        let arr:Group[];

        return  arr = groups.map( item => {
            const speciality = specialities.find(({speciality_id}) => item.speciality_id === speciality_id).speciality_name;
            const faculty = faculties.find(({faculty_id}) => item.faculty_id === faculty_id).faculty_name;
            return { ...item, speciality, faculty };
          });
    }
)
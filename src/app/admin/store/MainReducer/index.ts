import {
    ActionReducerMap,
} from '@ngrx/store';
import * as fromFaculty  from '../faculty/faculty-reducers';
import * as fromSpeciality from '../speciality/speciality-reducer';
import * as fromGroup from '../group/group-reducers';
import * as fromStudent from '../student/student-reducers';
import * as fromSubject from '../subject/subject-reducers';




export const initialAdminState: AdminState = {
    faculty: fromFaculty.initialFacultiesState,
    speciality: fromSpeciality.initialSpecialityState,
    group: fromGroup.initialGroupsState,
    student: fromStudent.initialStudentState,
    subject: fromSubject.initialSubjectsState,
};

export interface AdminState {
    faculty: fromFaculty.FacultyState;
    speciality: fromSpeciality.SpecialityState;
    group: fromGroup.GroupState;
    student: fromStudent.StudentState;
    subject: fromSubject.SubjectState;

}

export const reducers: ActionReducerMap<AdminState> = {
    faculty: fromFaculty.facultiesReducer,
    speciality: fromSpeciality.specialityReducer,
    group: fromGroup.groupsReducer,
    student: fromStudent.studentsReducer,
    subject: fromSubject.subjectReducer,

}


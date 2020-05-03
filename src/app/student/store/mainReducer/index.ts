import {
    ActionReducerMap,
} from '@ngrx/store';
import * as fromTimeTable from '../studentTimeTable/studentTimeTable.reducers';


export interface StudentState {
    timetable: fromTimeTable.TimeTableState;

}



export const initialStudentState: StudentState = {
    timetable: fromTimeTable.initialTimeTableState,

};

export const reducers: ActionReducerMap<StudentState> = {
    timetable: fromTimeTable.timeTableReducer,

}


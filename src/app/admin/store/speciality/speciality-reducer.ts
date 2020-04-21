import { Speciality } from 'src/app/shared/entity.interface';
import { createReducer, on, Action } from '@ngrx/store';
import * as SpecialityAction from './speciality-actions';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

export interface SpecialityState extends EntityState<Speciality> {
    allSpecialitiesLoaded: boolean;
}

export const adapter = createEntityAdapter<Speciality>({
    selectId: speciality => speciality.speciality_id,
});

export  const initialSpecialityState = adapter.getInitialState({
    allSpecialitiesLoaded: false
});

const specialitiesReducer = createReducer(
    initialSpecialityState,
    // tslint:disable-next-line:max-line-length
    on(SpecialityAction.allSpecialitiesLoaded, (state, action) => adapter.addAll(action.specialities,{...state, allSpecialitiesLoaded: true})),

    on(SpecialityAction.specialityUpdate, (state, action) =>
    adapter.updateOne(action.update, state)),

    on(SpecialityAction.specialityCreate, (state, action) => adapter.addOne(action.create,state)),

    on(SpecialityAction.specialityDelete, (state, action) => adapter.removeOne(action.id,state))
);


export function specialityReducer(state: SpecialityState | undefined, action: Action) {
    return specialitiesReducer(state, action);
  }

  export const { selectAll:selectSpecialities } = adapter.getSelectors();




  // const specialitiesReducer = createReducer(
//     initialSpecalityState,
//     on(SpecialityAction.allSpecialitiesLoaded,(state, action) => {
//      return {
//          ...state,
//          specialities: action.specialities.reduce((acc,speciality) => {
//              acc[speciality.speciality_id] = speciality;
//              return acc;
//              },{}),
//         areSpecialityLoaded: true
//      }
// })
// );
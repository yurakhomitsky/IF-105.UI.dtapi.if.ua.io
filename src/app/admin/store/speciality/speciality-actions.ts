import { createAction, props } from '@ngrx/store';
import { Speciality } from 'src/app/shared/entity.interface';
import { Update } from '@ngrx/entity';


export const loadAllSpecialities= createAction(
    '[Speciality data] Load All Specialities'
);
export const allSpecialitiesLoaded = createAction(
    '[Load Specialities Effect] All Specialities Loaded',
    props<{ specialities: Speciality[] }>()
);

export const specialityUpdate = createAction(
    '[Edit speciality Dialog] Speciality Updated',
    props<{ update: Update<Speciality> }>()
);

export const specialityCreate = createAction(
    '[Create Speciality Dialog] Speciality Create',
    props<{create: Speciality}>()
)
export const specialityDelete = createAction(
    '[Delete speciality Dialog] speciality Delete',
    props<{id: number}>()
)
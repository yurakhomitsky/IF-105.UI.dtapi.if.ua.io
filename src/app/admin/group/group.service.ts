import { Injectable } from '@angular/core';
import { Speciality, Faculty, Group } from '../../shared/entity.interface';
import { ApiService } from 'src/app/shared/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { Observable, of, concat, merge, forkJoin, combineLatest } from 'rxjs';
import { AppState } from 'src/app/reducers';
import { Store, select } from '@ngrx/store';
import { selectAllFaculties, areFacultiesLoaded } from '../store/faculty/faculty-selectors';
import { selectAllSpecialities, areSpecialitiesLoaded } from '../store/speciality/speciality-selectors';
import { filter, map, tap, switchMap, share, first, withLatestFrom, distinctUntilChanged, concatMap } from 'rxjs/operators';
import { loadAllFaculties } from '../store/faculty/faculty-actions';
import { loadAllSpecialities } from '../store/speciality/speciality-actions';
import { readyGroup, selectAllGroups, selectLoadingGroups } from '../store/group/group-selectors';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  getBothEntityLoaded$ = combineLatest(
    this.store.select(areSpecialitiesLoaded).pipe(tap((hasloaded) => {
      if(!hasloaded) {
        this.store.dispatch(loadAllSpecialities());
      }
    })),
    this.store.select(areFacultiesLoaded).pipe(tap((hasloaded) => {
      if(!hasloaded) {
        this.store.dispatch(loadAllFaculties());
      }
    } )),
    this.store.select(selectLoadingGroups),
    (speciality, faculty,groups) => {
      return faculty && speciality && !groups;
    }
  ).pipe(
    filter((hasLoaded) => hasLoaded)
  )


  constructor(private apiService: ApiService, private modalService: ModalService, private store: Store<AppState>) { }

  getListGroup(pageSize: number, offset: number = 0): Observable<any> {
    return this.apiService.getRecordsRange('group', pageSize, offset);
  }

  combineGroup(page?: number,pageSize?:number) {
      return this.getBothEntityLoaded$.pipe(
        concatMap((data) =>  {
         return this.store.pipe(select(readyGroup));
        }),
        map((groups) => groups.slice((page - 1) * pageSize, page * pageSize))
      )
  }
  chunkArray(groups:Group[],page?:number,pageSize?:number) {
    return groups.slice((page -1) * pageSize, page * pageSize);
  }

  getGroups() {
    return this.getBothEntityLoaded$.pipe(
      concatMap((data) =>  {
       return this.store.pipe(select(readyGroup));
      }),
      )
  }

  getListSpeciality() {
    return this.store.select(selectAllSpecialities)
  }

  getNameSpeciality(id: number, list: Speciality[]): string {
    const speciality = list.find(({ speciality_id }) => id === speciality_id);
    return speciality.speciality_name;
  }

  getListFaculty() {
    return  this.store.select(selectAllFaculties)
  }

  getIdsEntity(groups: Group[]) {
    const facultiesIds = [...new Set(groups.map(item => +item.faculty_id))];
    const specialitiesIds = [...new Set(groups.map(item => +item.speciality_id))];
    return {
      facultiesIds,
      specialitiesIds
    }
  }
  getListFacutyEntity(ids: number[]) {
    let faculties: Faculty[];
    this.store.pipe(
      select(selectAllFaculties),
      map(faculty => faculty.filter(item => ids.includes(+item.faculty_id)))
    )
      .subscribe(data => faculties = data);

    return faculties.length > 0 ? of(faculties) : this.apiService.getByEntityManager('Faculty', ids);
  };

  getListSpecialityEntity(ids: number[]) {
    let specialities: Speciality[];
    this.store.pipe(
      select(selectAllSpecialities),
      map(speciality => speciality.filter(item => ids.includes(+item.speciality_id)))
    )
      .subscribe(data => specialities = data);

    return specialities.length > 0 ? of(specialities) : this.apiService.getByEntityManager('Speciality', ids);
  };

  getNameFaculty(id: number, list: Faculty[]): string {
    const faculty = list.find(({ faculty_id }) => id === faculty_id);
    return faculty.faculty_name;
  }

  addPropertyToGroup(listGroup: Group[], listSpeciality: Speciality[], listFaculty: Faculty[]): Group[] {
    return listGroup.map(item => {
      const speciality = listSpeciality.find(({ speciality_id }) => item.speciality_id === speciality_id).speciality_name;
      const faculty = listFaculty.find(({ faculty_id }) => item.faculty_id === faculty_id).faculty_name;
      return { ...item, speciality, faculty };
    });
  }

}

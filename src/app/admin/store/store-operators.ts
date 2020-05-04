import { Observable } from 'rxjs';
import { tap, filter, first, switchMap, map } from 'rxjs/operators';


export function checkIdsLoaded<T>({ id, dispatch, select }: { id: number, dispatch: () => void, select?: () => Observable<T[]> }) {
    return (source: Observable<number[]>) => {
        return source.pipe(
            tap(loadedIds => {
                if (!loadedIds.includes(id)) {
                    dispatch();
                }
            }),
            switchMap(select)
        )
    }
}



export function areDataLoaded(fn: (value?) => void) {
    // tslint:disable-next-line:only-arrow-functions
    return (source: Observable<boolean>) => {
        return source.pipe(
            tap((hasLoaded) => {
                if (!hasLoaded) {
                    fn()
                }
            }),
            filter(dataLoaded => dataLoaded),
            first()
        )
    };
}


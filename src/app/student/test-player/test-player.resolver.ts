import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { TestPlayerService } from '../test-player.service'

@Injectable({ providedIn: 'root'})
export class TestPlayerResolver implements Resolve<any> {
    constructor(private testPlayerService: TestPlayerService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.testPlayerService.getQuestionList(+route.queryParamMap.get('id'))
    }
}

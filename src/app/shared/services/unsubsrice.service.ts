import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class UnSubscribeService {
    unsubscribeP = new Subject<void>();
    constructor() {}
    unSubscribe() {
        this.unsubscribeP.next();
    }
};
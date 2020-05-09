import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class UnSubscribeService {
    unsubscribeP = new Subject<void>();
    constructor() {
        console.log('Unsubscribe Service have been created');
       this.unsubscribeP.subscribe(() => {
           console.log('Опача');
       })
    }
    unSubscribe() {
        this.unsubscribeP.next();
    }
};
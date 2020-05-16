import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TestPlayerService} from '../test-player.service';
import {ActivatedRoute} from '@angular/router';
import {filter, map, switchMap, tap, takeUntil} from 'rxjs/operators';
import {ModalService} from '../../shared/services/modal.service';
import {Test} from '../../admin/entity.interface';
import {SessionStorageService} from 'angular-web-storage';
import {TestLogoutService} from '../../shared/services/test-logout.service';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-test-player',
  templateUrl: './test-player.component.html',
  styleUrls: ['./test-player.component.scss'],
  providers: [UnSubscribeService],
})
export class TestPlayerComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:max-line-length
  public questions: { 'question_id': string; 'test_id': string; 'question_text': string; 'level': string; 'type': string; 'attachment': string; }[];
  public index: number;
  public choosenQuestionId: string;
  public addedQuestionAnswer: any = [];
  public markedQuestions: any = [];
  public isTestDone = false;
  public testResults: any;
  timeForTest: number;
  timer: number;
  userTime: number;
  serverTime: number;
  testInProgress;
  subscription: any;
  unsubscribe$ = new Subject<void>();

  constructor(private testPlayerService: TestPlayerService,
              private route: ActivatedRoute,
              private modalService: ModalService,
              public session: SessionStorageService,
              private testLogoutService: TestLogoutService) {
    this.questions = [];
    this.subscription = this.testLogoutService.getMessage().pipe(
      filter(data => data === true)
    ).subscribe(
      () => this.sendAnswersForCheck()
    );

  }

  get choosenQuestion() {
    return this.questions.find(({question_id}) => {
      return this.choosenQuestionId === question_id;
    }) || this.questions[0];
  }

  get choosenAnswer() {
    return this.addedQuestionAnswer.find(({question}) => {
      return this.choosenQuestionId === question;
    });
  }

  ngOnInit() {
   this.route.queryParamMap
    .pipe(
      takeUntil(this.unsubscribe$),
      tap(() => {
        this.userTime = Math.floor(Date.now() / 1000) + 10800;
      }),
      switchMap((testId) => {
        return  this.getTimeForTest(+testId.get('id'));
      }),
      switchMap(() => this.route.data),
    )
    .subscribe(({questionsList}) => {
      this.questions = this.mapForCheckBoxes(questionsList);
    })
    // this.route.queryParamMap.subscribe((params: any) => {
    //   const testId = params.params.id;
    //   this.getTimeForTest(testId);
    //   this.userTime = Math.floor(Date.now() / 1000) + 10800;
    //   return this.testPlayerService.getQuestionList(+testId)
    //     .subscribe(questions => {
    //       this.questions = this.mapForCheckBoxes(questions);
    //       console.log(this.questions);

    //     });
    // });
    this.testInProgress = setInterval(() => {
      this.synchronizeTime();
    }, 60000);
  }
  mapForCheckBoxes(questions) {
    return questions.map((item) => {
      if (item.type === '2') {
        return {
          ...item,
          answers: item.answers.map((answer) => ({ ...item, checked: false  })),
          shuffledAnswers: [...item.answers]
        }
      } else if(item.type === '1') {
        return {
          ...item,
          shuffledAnswers: [...item.answers]
        }
      }
       else {
        return item
      }
    })
  }
  ngOnDestroy() {
    clearInterval(this.testInProgress);
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  viewQuestionParent(id: string) {
    this.choosenQuestionId = id;
  }

  addQuestionAnswer(res: any) {
    this.addedQuestionAnswer = [...this.addedQuestionAnswer.filter((item: any) => {
      return item.question !== res.question;
    }), res];
  }

  addMarkedQuestion(id: number) {
    if (this.markedQuestions.includes(id)) {
      this.markedQuestions = this.markedQuestions.filter(markedQuestion => {
        return markedQuestion !== id;
      });
      return;
    }
    this.markedQuestions = [...this.markedQuestions, id];

  }

  sendAnswersForCheck() {
    clearInterval(this.testInProgress);
    const testDataForCheck = this.addedQuestionAnswer.map(item => {
      if (typeof item.answer === 'string' || typeof item.answer === 'number') {
        return {question_id: item.question, answer_ids: [item.answer]};
      }
      return {question_id: item.question, answer_ids: item.answer};
    });

    return this.testPlayerService.checkTest(testDataForCheck)
      .subscribe((results) => {
        this.testResults = results;
        this.isTestDone = true;
        this.session.clear();
      });
  }

  getTimeForTest(id): any {
   return this.testPlayerService.getTestInfo(id).pipe(
     tap((data) => {
      const time = data[0].time_for_test * 60;
      this.timeForTest = time;
      this.timer = time;
     })
   )
  }

  synchronizeTime() {
    this.testPlayerService.getTime().subscribe((data: any) => {
      this.serverTime = data.curtime;
      this.timer = this.timeForTest - (this.serverTime - this.userTime) ;
    });
  }

  finish(event) {
    if (event.action === 'done') {
      this.sendAnswersForCheck();
      this.modalService.openInfoModal('Час вийшов!');
    }
  }
}

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TestPlayerService} from '../test-player.service';
import {ActivatedRoute} from '@angular/router';
import {filter, map, switchMap, tap, takeUntil, mergeMap} from 'rxjs/operators';
import {ModalService} from '../../shared/services/modal.service';
import {Test} from '../../admin/entity.interface';
import {SessionStorageService} from 'angular-web-storage';
import {TestLogoutService} from '../../shared/services/test-logout.service';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';
import { Subject, forkJoin } from 'rxjs';
import { UserResults, ScoreCalculate } from '../../shared/entity.interface';

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
  public testResults: ScoreCalculate;
  public mockTestResult  = {
    full_mark: 30,
    number_of_true_answers: 8
  }
  public maxMark: number;
  timeForTest: number;
  timer: number;
  userTime: number;
  serverTime: number;
  testInProgress;
  subscription: any;
  testId: number;
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
      tap((testId) => {
        this.testId = +testId.get('id');
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

    forkJoin(
      this.testPlayerService.checkTest(testDataForCheck),
      this.testPlayerService.maxMarkForTheTest(this.testId))
      .subscribe((result) => {
        const [results, maxMarkForTest] = result;
        // this.testResults = results;
        this.maxMark = (maxMarkForTest as any).testRate;
        this.testResults = this.calculateScore(results as UserResults,this.maxMark);
        this.isTestDone = true;
        this.session.clear();
      });
  }
  calculateScore({full_mark,number_of_true_answers}, maxMark: number): ScoreCalculate {
    const scoreIn100Point = +(+full_mark / +maxMark * 100).toFixed();
    const scoreIn12Point = +(+full_mark / +maxMark * 12).toFixed();
    const scoreInPercent = +((+full_mark / +maxMark) * 100).toFixed();
    return {
      full_mark,
      scoreIn100Point,
      scoreIn12Point,
      scoreInPercent,
      number_of_true_answers,
      question_length: this.questions.length,
      maxMark
    }
  }

  getTitleByScore(score: ScoreCalculate): string {
    if (score.scoreInPercent >= 60) return 'Дуже добре'
    if (score.scoreInPercent > 40 && score.scoreInPercent < 60) return 'Добре'
    if (score.scoreInPercent <= 40) return 'Погано'
  }

  getStyleByScore(score: ScoreCalculate) {
    return  {
      success: (score.scoreInPercent >= 60),
      middle: (score.scoreInPercent > 40 && score.scoreInPercent < 60),
      bad: (score.scoreInPercent <= 40)
    }
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, CanDeactivate, ParamMap } from '@angular/router';
import { SessionStorageService } from 'angular-web-storage';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UnSubscribeService } from 'src/app/shared/services/unsubsrice.service';
import { AddedQuestionAnswer, ScoreCalculate, SlotData, UserResults } from '../../shared/entity.interface';
import { ModalService } from '../../shared/services/modal.service';
import { TestLogoutService } from '../../shared/services/test-logout.service';
import { TestPlayerService } from '../test-player.service';

@Component({
  selector: 'app-test-player',
  templateUrl: './test-player.component.html',
  styleUrls: ['./test-player.component.scss'],
  providers: [UnSubscribeService],
})
export class TestPlayerComponent implements OnInit, OnDestroy, CanDeactivate<TestPlayerComponent> {
  // tslint:disable-next-line:max-line-length
  public questions: { 'question_id': string; 'test_id': string; 'question_text': string; 'level': string; 'type': string; 'attachment': string; }[];
  public index: number;
  public choosenQuestionId: string;
  public addedQuestionAnswer: Array<AddedQuestionAnswer> = [];
  public markedQuestions: any = [];
  public isTestDone = false;
  public testResults: ScoreCalculate;
  public mockTestResult = {
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


  // For Timer
  startDate: number;
  endDate: number;
  distance: number;

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

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.isTestDone) {
      return confirm('Ви не закінчили тестування, якщо ви покинете сторінку, дані можуть не зберегтися');
    }
    else {
      return true;
    }
  }

  get choosenQuestion() {
    return this.questions.find(({ question_id }) => {
      return this.choosenQuestionId === question_id;
    }) || this.questions[0];
  }

  get choosenAnswer() {
    return this.addedQuestionAnswer.find(({ question }) => {
      return this.choosenQuestionId === question;
    });
  }


  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        takeUntil(this.unsubscribe$),
        this.checkData(),
        switchMap(() => this.route.data),
      )
      .subscribe(({ questionsList }) => {
        this.questions = this.mapForCheckBoxes(questionsList);
        // back-end gerenate random question, so we need to filter - addedQuestionAnswer based on new question
        // in order to prevent bag with unexpected score
        this.addedQuestionAnswer = this.addedQuestionAnswer.filter(answer => this.questions.find((question) => {
            return  +question.question_id === +answer.question
        }))
      })

    this.testInProgress = setInterval(() => {
      this.synchronizeTime();
    }, 60000);
  }
  checkData() {
    return (source: Observable<ParamMap>) => {
      return source.pipe(
        switchMap((params) => forkJoin(of(params), this.testPlayerService.getData())),
        switchMap(([params, data]: [ParamMap, SlotData]) => {
          if (!this.checkDataInSlot(data)) {
            this.addedQuestionAnswer = data.addedQuestionAnswer || [];
          }
          return this.getTimeForTest(+params.get('id'))
        })
      )
    }
  }

  getTimeForTest(id): any {
    return this.testPlayerService.getTestInfo(id).pipe(
      tap((data) => {
        this.testId = id;
        const time = data[0].time_for_test * 60;
        this.timeForTest = time;
        this.timer = time;
      }),
      switchMap(() => this.getTime())
      // switchMap(() => this.testPlayerService.getTime().pipe(
      //   tap((data) => {
      //     this.countTimeLeft(data);
      //     this.timeSlot();
      //   })
      // ))
    )
  }
  getTime() {
    return this.testPlayerService.getTime().pipe(
      tap((data) => {
        this.countTimeLeft(data);
      }),
      switchMap(() => this.testPlayerService.getEndTime()),
      switchMap((endOfTest) => {
        if (endOfTest.response === 'Empty slot') {
         return this.testPlayerService.saveEndTime({end: this.startDate + this.distance,})
        } else {
          this.calculateDistance(endOfTest);
          return of(null);
        }
      })
    )
  }
  synchronizeTime() {
    // this.testPlayerService.getTime().pipe(
    //   tap((data: any) => {
    //     this.countTimeLeft(data);
    //   }),
    this.getTime().pipe(
      switchMap(() => this.testPlayerService.saveData({
        testID: this.testId,
        addedQuestionAnswer: this.addedQuestionAnswer
      })),
    )
      .subscribe();
  }
  countTimeLeft(data) {
    this.startDate = new Date(data.unix_timestamp * 1000).getTime();
    this.endDate = this.startDate + this.timer * 1000;
    this.distance = this.endDate - this.startDate;
    this.timer = (this.distance / 1000);
    // this.timeSlot();
  }
  timeSlot() {
    this.testPlayerService.getEndTime().subscribe(endOfTest => {
      if (endOfTest.response === 'Empty slot') {
        this.testPlayerService
          .saveEndTime({
            end: this.startDate + this.distance,
          })
          .subscribe(
            () => { },
            error => {
              console.error(error.error.response);
            }
          );
        this.timeSlot();
      } else {
        this.distance = endOfTest.end - this.startDate;
        if (this.distance > this.endDate - this.startDate) {
          this.distance = this.endDate - this.startDate;
        }
        this.timer = this.distance / 1000;
        if (this.distance === undefined) {
          this.testPlayerService
            .resetSession()
            .subscribe(() => { });
        }
      }
    });
  }
  
  calculateDistance(endOfTest) {
    this.distance = endOfTest.end - this.startDate;
    if (this.distance > this.endDate - this.startDate) {
      this.distance = this.endDate - this.startDate;
    }
    this.timer = this.distance / 1000;
    if (this.distance === undefined) {
      this.testPlayerService
        .resetSession()
        .subscribe(() => { });
    }
  }
  

  checkDataInSlot(data: any) {
    return data?.response?.includes('Empty slot');
  }

  mapForCheckBoxes(questions) {
    return questions.map((item) => {
      if (item.type === '2') {
        return {
          ...item,
          answers: item.answers.map((answer) => ({ ...item, checked: false })),
          shuffledAnswers: [...item.answers]
        }
      } else if (item.type === '1') {
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
    this.testPlayerService.resetSession().subscribe();
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
    this.testPlayerService.resetSession().subscribe();
    const testDataForCheck = this.addedQuestionAnswer.map(item => {
      if (typeof item.answer === 'string' || typeof item.answer === 'number') {
        return { question_id: item.question, answer_ids: [item.answer] };
      }
      return { question_id: item.question, answer_ids: item.answer };
    });

    forkJoin(
      this.testPlayerService.checkTest(testDataForCheck),
      this.testPlayerService.maxMarkForTheTest(this.testId))
      .subscribe((result) => {
        const [results, maxMarkForTest] = result;
        this.maxMark = (maxMarkForTest as any).testRate;
        this.testResults = this.calculateScore(results as UserResults, this.maxMark);
        this.isTestDone = true;
        this.session.clear();
      });
  }
  calculateScore({ full_mark, number_of_true_answers }, maxMark: number): ScoreCalculate {
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
    return {
      success: (score.scoreInPercent >= 60),
      middle: (score.scoreInPercent > 40 && score.scoreInPercent < 60),
      bad: (score.scoreInPercent <= 40)
    }
  }

  finish(event) {
    if (event.action === 'done') {
      this.sendAnswersForCheck();
      this.testPlayerService.resetSession().subscribe();
      this.modalService.openInfoModal('Час вийшов!');
    }
  }
}

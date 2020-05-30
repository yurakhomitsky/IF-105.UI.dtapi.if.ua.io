import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';
import { SlotData } from '../shared/entity.interface';

@Injectable({
  providedIn: 'root'
})
export class TestPlayerService {

  constructor(private http: HttpClient, private authservice: AuthService) { }
  getTestInfo(testId: number) {
    return this.http.get(`Test/getRecords/${testId}`);
  }

  getTestDetails(testId: number) {
    return this.http.get(`testDetail/getTestDetailsByTest/${testId}`);
  }

  saveData(data: SlotData) {
    return this.http.post('TestPlayer/saveData', data);
  }
  getData(): Observable<any> {
    return this.http.get<any>('TestPlayer/getData');
  }
  saveEndTime(endTime: any): Observable<any> {
    return this.http.post('TestPlayer/saveEndTime', endTime);
  }
  getEndTime(): Observable<any> {
    return this.http.get('TestPlayer/getEndTime');
  }
  getTest() {
    return this.http.get('TestPlayer/getTest/210');
  }

  maxMarkForTheTest(testId: number) {
    return this.http.get(`testDetail/getTestRate/${testId}`);
  }

  getQuestionByLevel(test_id: number, level: number, tasks: number) {
    return this.http.get(`question/getQuestionIdsByLevelRand/${test_id}/${level}/${tasks}`);
  }
  getLog(testId: number) {
    return this.authservice.getCurrentUser()
      .pipe(
        switchMap(user =>
          this.http.get(`Log/startTest/${user.id}/${testId}`)
        )
      )
  }
  getQuestions(questionIds: any) {
    return this.http.post('EntityManager/getEntityValues', { entity: 'Question', ids: questionIds });
  }
  getAnswer(questionId: any) {
    return this.http.get(`SAnswer/getAnswersByQuestion/${questionId}`);
  }
  getCurrnetTestId() {
    return this.http.get('testPlayer/getData');
  }
  getQuestionList(testId: number) {
    return this.getTestDetails(testId).pipe(
      switchMap((questionDetails: any) => {
        const questionsByLevel$ = questionDetails
          .map(({ level, tasks }) => this.getQuestionByLevel(testId, level, tasks));
        return forkJoin(questionsByLevel$);
      }),
      switchMap((qwestionsByLevel: any) => {
        const questionIds = qwestionsByLevel.flat().map(({ question_id }) => question_id);
        return this.getQuestions(questionIds);
      }),
      switchMap((questions: any) => {
        const answers$ = questions
          .filter(question => question.type < 3)
          .map(({ question_id }) => this.getAnswer(question_id));
        return forkJoin([of(questions), forkJoin(answers$)]);
      }),
      map(([questions, answers]) => {
        const flattenAnswers = (answers as any).flat();

        return questions.map((question: any) => {
          return {
            ...question,
            answers: this.shuffle(flattenAnswers.filter(({ question_id }) => question_id === question.question_id)),
          }
        });
      })
    )
  }

  checkTest(testData: any) {
    return this.http.post('SAnswer/checkAnswers', testData)
  }

  resetSession() {
    return this.http.get('TestPlayer/resetSessionData');
  }

  getTime() {
    return this.http.get('TestPlayer/getTimeStamp');
  }
  shuffle(answers) {
    if (!answers || !answers.length) {
      return [];
    }
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }
}

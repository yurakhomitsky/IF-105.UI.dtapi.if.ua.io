import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '../shared/shared.module';
import { TestPlayerComponent } from './test-player/test-player.component';
import { QuestionMenuItemComponent } from './question-menu-item/question-menu-item.component';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
import { TestPlayerService } from './test-player.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { StudentInfoComponent } from './student-info/student-info.component';
import { CountdownModule } from 'ngx-countdown';
import { StudentInfoService } from './student-info.service';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/mainReducer';
import { EffectsModule } from '@ngrx/effects';
import { TimeTableEffects } from './store/studentTimeTable/studentTimeTable.effects';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { StudentInfoResolver } from './student-info/student-info.resolver';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { TestPlayerResolver } from './test-player/test-player.resolver';
import { ExitTestPlayerGuard } from '../guards/test-player.guard';

const routes: Routes = [
  {
    path: '',  component: StudentComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: StudentInfoComponent,  resolve: { studentInfo: StudentInfoResolver}},
      { path: 'profile', component: StudentProfileComponent,  resolve: { studentInfo: StudentInfoResolver} },
      { path: 'test-player', component: TestPlayerComponent, resolve: { questionsList: TestPlayerResolver }, 
      canDeactivate: [ExitTestPlayerGuard] },
    ],
  }
];

@NgModule({
  declarations: [
    StudentComponent,
    TestPlayerComponent,
    QuestionMenuItemComponent,
    QuestionAnswerComponent,
    StudentInfoComponent,
    StudentProfileComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatTableModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    SharedModule,
    FormsModule,
    CountdownModule,
    StoreModule.forFeature('student', reducers),
    EffectsModule.forFeature([TimeTableEffects])
  ],
  providers: [
    TestPlayerService,
    StudentInfoService,
    ExitTestPlayerGuard
  ]
})
export class StudentModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

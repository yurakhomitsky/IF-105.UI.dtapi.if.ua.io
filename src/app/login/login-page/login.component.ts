import { Component, OnInit } from '@angular/core';
import { catchError, withLatestFrom, map } from 'rxjs/operators';
import { of, combineLatest, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { LoginService } from '../login.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { LangBtnService } from '../../shared/services/lang-btn.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/reducers';
import { login } from '../store/login.action';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginUser: FormControl;
  password: FormControl;

  public userData: { username: string; password: string; } = { username: null, password: null };
  public error = null;
  public logo: SafeResourceUrl;

  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private langBtnService: LangBtnService,
    private store: Store<AppState>
  ) { }

  ngOnInit() {
    this.getLogo();
    this.createFormControls();
    this.createForm();
  }
  createFormControls() {
    this.loginUser = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
  }
  createForm() {
    this.loginForm = new FormGroup({
      loginUser: this.loginUser,
      password: this.password
    })
    this.loginForm.valueChanges.subscribe(() => this.error = null);
  }
  getLogo() {
    this.loginService.getLogo()
      .subscribe(data => this.logo = data);
  }
  finder(groups, faculties) {
    return groups.map((item) => {
      const faculty = this.findFacultyById(faculties, item.faculty_id);
      return {
        ...item,
        fack: faculty.name
      }
    });

  }
  findFacultyById(faculty: Array<any>, id: number) {
    return faculty.find((item) => item.id === id);
  }
  login() {
    const {loginUser: username, password} = this.loginForm.value;
    this.authService
      .login({ username,password })
      .subscribe((response: any) => {
        const { id, username, roles } = response;
        this.error = null;

        this.store.dispatch(login({ user: { id, username, roles } }));

        const navigateTo = response.roles.includes('admin') ? 'admin' : 'student';
        this.router.navigate([navigateTo]);
      }, ({ error }) => {
        this.userData.username = null;
        this.userData.password = null;
        this.error = 'Не вірний пароль або логін';
      });
  }
  changeLang(language: string) {
    this.langBtnService.switchLanguage(language);
  }
}

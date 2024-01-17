import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CallingFunctionsService {

  private triggerAddClub = new Subject<void>();
  triggerAddClub$ = this.triggerAddClub.asObservable();

  private triggerUserState = new Subject<void>();
  triggerUserState$ = this.triggerUserState.asObservable();

  private triggerGetFav = new Subject<void>();
  triggerGetFav$ = this.triggerGetFav.asObservable();

  private triggerRenderAllClubs = new Subject<void>();
  triggerRenderAllClubs$ = this.triggerRenderAllClubs.asObservable();

  private triggerSetFilterState = new BehaviorSubject<boolean>(null);
  triggerSetFilterState$ = this.triggerSetFilterState.asObservable();

  addClub() {
    this.triggerAddClub.next();
  }

  userState() {
    this.triggerUserState.next();
  }

  getFav() {
    this.triggerGetFav.next();
  }

  renderAllClubs() {
    this.triggerRenderAllClubs.next();
  }

  setFilterState(state) {
    this.triggerSetFilterState.next(state);
  }
}

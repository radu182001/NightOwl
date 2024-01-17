import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoginPageComponent } from 'src/app/pages/login-page/login-page.component';
import { map, take, switchMap } from 'rxjs/operators';

export interface Club {
    name: string,
    lat: number,
    lng: number,
    addr: string,
    img: string,
    desc: string
}

export interface User {
    email: string;
    fav: any[]
}

@Injectable()
export class FirebaseService {

    listFeed: Observable<any[]>;
    objFeed: Observable<any>;

    private currentUserSubject = new BehaviorSubject<firebase.User | null>(null);
    public currentUser = this.currentUserSubject.asObservable();

    constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth) {
        this.afAuth.authState.subscribe(user => {
            this.currentUserSubject.next(user);
          });
    }

    connectToDatabase() {
        this.listFeed = this.db.list('Clubs').valueChanges();
        this.objFeed = this.db.object('obj').valueChanges();
    }

    getChangeFeedList() {
        return this.listFeed;
    }

    getChangeFeedObj() {
        return this.objFeed;
    }

    addClub(lat: number, lng: number, name: string, addr: string, img: string, desc: string) {
        let club: Club = {
            name: name,
            lat: lat,
            lng: lng,
            addr: addr,
            img: img,
            desc: desc
        }
        this.db.list('Clubs').push(club);
    }

    syncPointItem(lat: number, lng: number) {
        // let item: ITestItem = {
        //     name: "test",
        //     lat: lat,
        //     lng: lng
        // };
        // this.db.object('obj').set([item]);
    }


    // Authentification
    public getCurrentUserValue(): firebase.User | null {
        return this.currentUserSubject.value;
    }

    get authState() {
        return this.afAuth.authState;
    }

    async register(email: string, password: string): Promise<any> {
        try {
            const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
            // Handle registration success
            console.log('Registration successful', result);
            this.currentUserSubject.next(result.user);
            const user: User = {
                email: email,
                fav: []
            };
            this.db.list('Users').push(user); // Add user to Users list in database
        } catch (error) {
            // Handle errors here
            console.error('Registration error', error);
            alert(error.message);
        }
    }

    async login(email: string, password: string): Promise<any> {
        return this.afAuth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                // Handle login success
                console.log('Login successful', result);
                // You can perform additional actions on successful login if needed
                this.currentUserSubject.next(result.user);
            })
            .catch((error) => {
                // Handle errors here
                console.error('Login error', error);
                alert(error.message);
                throw new Error('some another error');
            });
    }

    async logout(): Promise<void> {
        return this.afAuth.signOut().then(() => {
          this.currentUserSubject.next(null); // Reset the user's state
        });
    }

    addToFav(email: string, point) {
        console.log("addToFav called");
        this.db.list('Users', ref => ref.orderByChild('email').equalTo(email))
        .snapshotChanges()
        .pipe(
            map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() as any }))),
            take(1)
        )
        .subscribe(users => {
            const user = users[0];
            if (user && user.key) {
                this.db.list(`Users/${user.key}/favorites`).push(point)
                    .then(() => console.log("Added to fav"))
                    .catch(error => console.error('Error adding favorite:', error));
            }
        });
    }

    removeFromFav(email: string, point) {
        this.db.list('Users', ref => ref.orderByChild('email').equalTo(email))
        .snapshotChanges()
        .pipe(
            map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() as any }))),
            take(1)
        )
        .subscribe(users => {
            const user = users[0];
            if (user && user.key) {
                // Reference to the user's favorites list
                const favRef = this.db.list(`Users/${user.key}/favorites`);
                let favSubscription = favRef.snapshotChanges().pipe(
                    map(changes => 
                        changes.map(c => ({ key: c.payload.key, ...c.payload.val() as any }))
                    )
                )
                .subscribe(favorites => {
                    // Find the point in the favorites list
                    const favPoint = favorites.find(f => f.name === point.name);
                    if (favPoint && favPoint.key) {
                        // Remove the point from the favorites list
                        favRef.remove(favPoint.key)
                            .then()
                            .catch(error => console.error('Error removing favorite:', error));
                        favSubscription.unsubscribe();
                    }
                });
            }
        });
    }
    

    getFavList(email: string): Observable<any> {
        return this.db.list('Users', ref => ref.orderByChild('email').equalTo(email))
            .snapshotChanges()
            .pipe(
                map(actions => actions.map(a => ({ key: a.payload.key, ...a.payload.val() as any }))),
                take(1),
                switchMap(users => {
                    const user = users[0];
                    if (user && user.key) {
                        return this.db.list(`Users/${user.key}/favorites`).valueChanges();
                    } else {
                        return null; // Return an observable of null if no user is found
                    }
                })
            );
    }
}

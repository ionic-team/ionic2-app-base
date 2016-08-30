import {Component} from "@angular/core";
import {NavController} from 'ionic-angular';

@Component({
  templateUrl: './home.html'
})
export class HomePage {
  constructor(private _navController: NavController) {
  }

  /*
    pushPage(){
      this._navController.push(SomeImportedPage, { userId: "12345"});
    }
  */
}

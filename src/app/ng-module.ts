import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MyApp } from './app';

import { HomePage } from '../pages/home/home';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp
  ]
})
export class AppNgModule {}

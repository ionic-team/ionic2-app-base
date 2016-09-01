import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppNgModuleNgFactory } from './ng-module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppNgModuleNgFactory);

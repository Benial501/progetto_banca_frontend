import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';
import { Home } from './componenti/home/home';
import { Deposito } from './componenti/deposito/deposito';
import { Prelievo } from './componenti/prelievo/prelievo';
import { Saldo } from './componenti/saldo/saldo';
import { ListaMovimenti } from './componenti/lista-movimenti/lista-movimenti';
import { ConvFiat } from './componenti/conv-fiat/conv-fiat';
import { ConvCripto } from './componenti/conv-cripto/conv-cripto';
import { Transazioni } from './componenti/transazioni/transazioni';
import { Login } from './componenti/login/login';
import { Registrazione } from './componenti/registrazione/registrazione';
import { ErrorPageComponent } from './componenti/error-page/error-page';
import { SuccessPageComponent } from './componenti/success-page/success-page';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'registrazione', component: Registrazione },
  { path: 'error', component: ErrorPageComponent },
  { path: 'success', component: SuccessPageComponent, canActivate: [authGuard] },

  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'deposito', component: Deposito, canActivate: [authGuard] },
  { path: 'prelievo', component: Prelievo, canActivate: [authGuard] },
  { path: 'saldo', component: Saldo, canActivate: [authGuard] },
  { path: 'lista-movimenti', component: ListaMovimenti, canActivate: [authGuard] },
  { path: 'conv-fiat', component: ConvFiat, canActivate: [authGuard] },
  { path: 'conv-cripto', component: ConvCripto, canActivate: [authGuard] },
  {
    path: 'transazioni/:id',
    component: Transazioni,
    canActivate: [authGuard],
    runGuardsAndResolvers: 'pathParamsChange',
  },
  { path: 'transazioni', redirectTo: 'lista-movimenti', pathMatch: 'full' },

  { path: '**', redirectTo: '' }
];

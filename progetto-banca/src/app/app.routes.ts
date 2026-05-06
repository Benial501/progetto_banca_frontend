import { Routes } from '@angular/router';

import { Home } from './componenti/home/home';
import { Deposito } from './componenti/deposito/deposito';
import { Prelievo } from './componenti/prelievo/prelievo';
import { Saldo } from './componenti/saldo/saldo';
import { ListaMovimenti } from './componenti/lista-movimenti/lista-movimenti';
import { ConvFiat } from './componenti/conv-fiat/conv-fiat';
import { ConvCripto } from './componenti/conv-cripto/conv-cripto';

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'deposito', component: Deposito },
  { path: 'prelievo', component: Prelievo },
  { path: 'saldo', component: Saldo },
  { path: 'lista-movimenti', component: ListaMovimenti },
  { path: 'conv-fiat', component: ConvFiat },
  { path: 'conv-cripto', component: ConvCripto }
];
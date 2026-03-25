import { Routes } from '@angular/router';
import { ClienteList } from './components/cliente-list/cliente-list';
import { ClienteForm } from './components/cliente-form/cliente-form';

export const routes: Routes = [
  {path:'lista', component: ClienteList},
  {path:'formulario', component: ClienteForm}
];

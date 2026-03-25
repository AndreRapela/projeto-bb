import { Component, signal } from '@angular/core';
import { ClienteForm } from './components/cliente-form/cliente-form';
import { ClienteList } from './components/cliente-list/cliente-list';
import { Cliente } from './models/cliente';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ClienteList, ClienteForm,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  showList = signal(true);
  clienteEmEdicao = signal<Cliente | null>(null);

  toggleView() {
    this.showList.update((value) => !value);
  }

  abrirFormulario() {
    this.clienteEmEdicao.set(null);
    this.showList.set(false);
  }

  abrirFormularioEdicao(cliente: Cliente) {
    this.clienteEmEdicao.set(cliente);
    this.showList.set(false);
  }

  salvarCliente() {
    this.clienteEmEdicao.set(null);
    this.showList.set(true);
  }

  cancelarFormulario() {
    this.clienteEmEdicao.set(null);
    this.showList.set(true);
  }
  
}


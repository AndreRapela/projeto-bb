import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cliente-list',
  imports: [],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteList {
  private readonly clienteService = inject(ClienteService);

  clientes = toSignal(this.clienteService.getClientes(), { initialValue: [] as Cliente[] });
  onAdd = output<void>();
  onEdit = output<Cliente>();

  selectedCliente = signal<Cliente | null>(null);

  selectRow(cliente: Cliente) {
    this.selectedCliente.set(cliente);
  }

  incluir() {
    this.onAdd.emit();
  }

  alterar() {
    const cliente = this.selectedCliente();
    if (!cliente) {
      return;
    }
    this.onEdit.emit(cliente);
  }

  excluir() {
    const cliente = this.selectedCliente();
    if (!cliente) {
      return;
    }
    this.clienteService.removerCliente(cliente);
    this.selectedCliente.set(null);
  }
}

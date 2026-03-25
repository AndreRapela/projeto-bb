import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  imports: [FormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteForm {
  private readonly clienteService = inject(ClienteService);

  cliente = input<Cliente | null>(null);

  novoCliente: Cliente = this.createEmptyCliente();
  private editingClienteId: number | undefined;
  buscandoEndereco = signal(false);
  mensagemCep = signal<string | null>(null);

  onCancel = output<void>();
  onSave = output<void>();

  constructor() {
    effect(() => {
      const clienteSelecionado = this.cliente();
      if (clienteSelecionado) {
        this.editingClienteId = clienteSelecionado.id;
        this.novoCliente = {
          nome: clienteSelecionado.nome,
          cpf: clienteSelecionado.cpf,
          telefone: clienteSelecionado.telefone,
          cep: clienteSelecionado.cep,
          endereco: clienteSelecionado.endereco,
          numero: clienteSelecionado.numero,
          complemento: clienteSelecionado.complemento,
        };
        return;
      }

      this.editingClienteId = undefined;
      this.novoCliente = this.createEmptyCliente();
    });
  }

  private createEmptyCliente(): Cliente {
    return {
      nome: '',
      cpf: '',
      telefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
    };
  }

  salvar() {
    if (this.editingClienteId !== undefined) {
      this.clienteService.atualizarCliente({ ...this.novoCliente, id: this.editingClienteId });
    } else {
      this.clienteService.adicionarCliente(this.novoCliente);
    }
    this.novoCliente = this.createEmptyCliente();
    this.editingClienteId = undefined;
    this.onSave.emit();
  }

  buscarEndereco() {
    const cep = this.novoCliente.cep;
    const cepNormalizado = cep.replace(/\D/g, '');

    if (cepNormalizado.length !== 8) {
      this.mensagemCep.set('Informe um CEP valido com 8 digitos.');
      return;
    }

    this.buscandoEndereco.set(true);
    this.mensagemCep.set(null);

    this.clienteService.buscarEnderecoPorCep(cep).subscribe((endereco) => {
      this.buscandoEndereco.set(false);

      if (!endereco) {
        this.novoCliente.endereco = '';
        this.mensagemCep.set('Nao foi possivel localizar o endereco para este CEP.');
        return;
      }

      this.novoCliente.endereco = endereco;
      this.mensagemCep.set('Endereco preenchido automaticamente.');
    });
  }

  aplicarMascaraCep(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 8);

    if (apenasDigitos.length <= 5) {
      this.novoCliente.cep = apenasDigitos;
      return;
    }

    this.novoCliente.cep = `${apenasDigitos.slice(0, 5)}-${apenasDigitos.slice(5)}`;
  }

  cancelar() {
    this.onCancel.emit();
  }
}

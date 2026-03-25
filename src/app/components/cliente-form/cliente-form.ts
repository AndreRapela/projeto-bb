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
  mensagemFormulario = signal<string | null>(null);
  tipoMensagemFormulario = signal<'sucesso' | 'erro' | null>(null);

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
    const nomeValido = this.novoCliente.nome.trim().length > 0;
    const cpfNormalizado = this.novoCliente.cpf.replace(/\D/g, '');
    const telefoneNormalizado = this.novoCliente.telefone.replace(/\D/g, '');
    const cepNormalizado = this.novoCliente.cep.replace(/\D/g, '');
    const numeroValido = this.novoCliente.numero.trim().length > 0;

    if (!nomeValido || !numeroValido || cpfNormalizado.length !== 11 || (telefoneNormalizado.length !== 10 && telefoneNormalizado.length !== 11) || cepNormalizado.length !== 8) {
      this.tipoMensagemFormulario.set('erro');
      this.mensagemFormulario.set('Preencha os campos obrigatorios corretamente antes de salvar.');
      alert('Preencha os campos obrigatorios corretamente antes de salvar.');
      return;
    }

    if (this.editingClienteId !== undefined) {
      this.clienteService.atualizarCliente({ ...this.novoCliente, id: this.editingClienteId });
      this.tipoMensagemFormulario.set('sucesso');
      this.mensagemFormulario.set('Cliente atualizado com sucesso.');
      alert('Cliente atualizado com sucesso.');
    } else {
      this.clienteService.adicionarCliente(this.novoCliente);
      this.tipoMensagemFormulario.set('sucesso');
      this.mensagemFormulario.set('Cliente cadastrado com sucesso.');
      alert('Cliente cadastrado com sucesso.');
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

  aplicarMascaraCpf(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 11);

    if (apenasDigitos.length <= 3) {
      this.novoCliente.cpf = apenasDigitos;
      return;
    }

    if (apenasDigitos.length <= 6) {
      this.novoCliente.cpf = `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3)}`;
      return;
    }

    if (apenasDigitos.length <= 9) {
      this.novoCliente.cpf = `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6)}`;
      return;
    }

    this.novoCliente.cpf = `${apenasDigitos.slice(0, 3)}.${apenasDigitos.slice(3, 6)}.${apenasDigitos.slice(6, 9)}-${apenasDigitos.slice(9)}`;
  }

  aplicarMascaraTelefone(valor: string) {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 11);

    if (apenasDigitos.length <= 2) {
      this.novoCliente.telefone = apenasDigitos;
      return;
    }

    if (apenasDigitos.length <= 7) {
      this.novoCliente.telefone = `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
      return;
    }

    this.novoCliente.telefone = `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7)}`;
  }

  cancelar() {
    this.onCancel.emit();
  }
}

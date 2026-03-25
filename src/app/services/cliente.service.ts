import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { Cliente } from '../models/cliente';

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);

  // private apiUrl = 'http://localhost:8080/clientes';
 
  private clientesList: Cliente[] = [
    {
      id: 1,
      nome: 'Joao Silva',
      cpf: '123.456.789-00',
      telefone: '(81) 99999-1111',
      cep: '50000-000',
      endereco: 'Av. Exemplo - Recife/PE',
      numero: '100',
      complemento: '',
    },
    {
      id: 2,
      nome: 'Maria Oliveira',
      cpf: '987.654.321-00',
      telefone: '(81) 98888-2222',
      cep: '51000-000',
      endereco: 'Rua das Flores - Recife/PE',
      numero: '200',
      complemento: '',
    },
  ];
  private nextId = 3;

  private clientesSubject = new BehaviorSubject<Cliente[]>([...this.clientesList]);


  getClientes(): Observable<Cliente[]> {
    return this.clientesSubject.asObservable();
  }

  adicionarCliente(cliente: Cliente): void {
    const novoCliente: Cliente = { ...cliente, id: this.nextId++ };
    this.clientesList.push(novoCliente);
    this.clientesSubject.next([...this.clientesList]);
  }

  atualizarCliente(clienteAtualizado: Cliente): void {
    this.clientesList = this.clientesList.map((cliente) => {
      if (clienteAtualizado.id !== undefined && cliente.id === clienteAtualizado.id) {
        return { ...clienteAtualizado };
      }
      return cliente;
    });
    this.clientesSubject.next([...this.clientesList]);
  }

  removerCliente(cliente: Cliente): void {
    this.clientesList = this.clientesList.filter(
      (item) => item.id !== cliente.id && item.cpf !== cliente.cpf
    );
    this.clientesSubject.next([...this.clientesList]);
  }

  buscarEnderecoPorCep(cep: string): Observable<string | null> {
    const cepNormalizado = cep.replace(/\D/g, '');
    if (cepNormalizado.length !== 8) {
      return of(null);
    }

    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepNormalizado}/json/`).pipe(
      map((resposta) => {
        if (resposta.erro) {
          return null;
        }

        const partes = [resposta.logradouro, resposta.bairro, resposta.localidade, resposta.uf]
          .filter((item) => Boolean(item && item.trim().length > 0));

        if (partes.length === 0) {
          return null;
        }

        return partes.join(' - ');
      }),
      catchError(() => of(null))
    );
  }


  //   adicionarCliente(cliente: Cliente): void {
  //   this.http.post<Cliente>(this.apiUrl, cliente).pipe(
  //     tap(() => this.carregarClientes()) // recarrega a lista após salvar
  //   ).subscribe();
  // }

  // removerCliente(cliente: Cliente): void {
  //   this.http.delete(`${this.apiUrl}/${cliente.id}`).pipe(
  //     tap(() => this.carregarClientes()) // recarrega a lista após deletar
  //   ).subscribe();
  // }

}

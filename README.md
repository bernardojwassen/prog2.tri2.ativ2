# Gerenciador de Tarefas (Todo List) com Bun, SQLite e TypeScript

Este projeto é uma aplicação de lista de tarefas (Todo List) desenvolvida em TypeScript utilizando o ambiente de execução **Bun** e o banco de dados **SQLite**. O código demonstra conceitos avançados de Programação Orientada a Objetos (POO), persistência de dados e otimização de performance através de um cache em memória.

---

## Explicação do Código

O código foi desenhado seguindo o padrão de projeto **Active Record**, onde a própria classe que representa o dado (`Item`) também é responsável por salvar, atualizar e deletar esse dado no banco de dados.

### 1. Banco de Dados e Prepared Statements
Logo no início, a conexão com o banco SQLite é estabelecida e a tabela é criada. Para garantir segurança e performance, o código utiliza **Prepared Statements** (Consultas Preparadas):

```typescript
import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

// Criação da tabela se ela não existir
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  );
`);

// Prepared Statements para reutilização e segurança
const queryInsert = db.prepare("INSERT INTO items (title) VALUES (?)");
const querySelectAll = db.prepare("SELECT * ["...]
const querySelectOne = db.prepare("SELECT * FROM items WHERE id = ? LIMIT 1");
const queryUpdate = db.prepare("UPDATE items SET title = ? WHERE id = ?");
const queryDelete = db.prepare("DELETE FROM items WHERE id = ?");
```

### 2. A Classe Item (O Modelo de Dados e Cache)
Esta classe gerencia individualmente cada tarefa. Ela possui um modificador de acesso private no construtor para obrigar o uso dos métodos estáticos, além de um mecanismo de Cache em Memória:

```typescript
class Item {
  // Cache estático para evitar consultas repetidas ao banco
  private static cache: Map<number, Item> = new Map();
  private _id: number;
  private _title: string;

  private constructor(id: number, title: string) {
    this._id = id;
    this._title = title;
  }

  // Método estático para criar e salvar um novo item
  static create(title: string): Item {
    const resp = queryInsert.run(title);
    const id = resp.lastInsertRowid as number;
    const instance = new Item(id, title);
    Item.cache.set(id, instance); // Guarda no cache
    return instance;
  }

  // Método estático para carregar um item do banco ou do cache
  static load(id: number): Item {
    if (Item.cache.has(id)) return Item.cache.get(id)!; // Retorna do cache se existir

    const resp = querySelectOne.get(id) as ModelTitle;
    if (!resp) throw new Error(`Impossível carregar o Item de id ${id}`);

    const instance = new Item(resp.id, resp.title);
    Item.cache.set(id, instance);
    return instance;
  }

  static loadAll(): Item[] {
    const rows = querySelectAll.all() as ModelTitle[];
    return rows.map((row) => {
      if (Item.cache.has(row.id)) {
        const cached = Item.cache.get(row.id)!;
        cached._title = row.title; 
        return cached;
      }
      const instance = new Item(row.id, row.title);
      Item.cache.set(row.id, instance);
      return instance;
    });
  }

  remove(): void {
    queryDelete.run(this._id);
    Item.cache.delete(this._id);
  }
}

get id(): number { return this._id; }
  get title(): string { return this._title; }

  set title(newTitle: string) {
    queryUpdate.run(newTitle, this._id); // Atualiza o Banco de Dados
    this._title = newTitle;              // Atualiza a Memória
  }
```

### 3. A Classe TodoList (A Gerenciadora)
Esta classe funciona como a interface principal para manipular o conjunto de tarefas no dia a dia da aplicação.

```typescript
class TodoList {
  private items: Item[];

  constructor() {
    this.items = Item.loadAll(); // Inicializa trazendo tudo do banco
  }

  getItems(): Item[] { return this.items; }

  addItem(title: string): Item {
    const item = Item.create(title);
    this.items.push(item);
    return item;
  }

  removeItems(id: number): void {
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index].remove();  // Remove do banco e do cache
      this.items.splice(index, 1); // Remove do array local
    }
  }

  updateItems(id: number, newTitle: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.title = newTitle; // Dispara o 'set title' da classe Item
    }
  }
}
```

### 4. Fluxo de Execução do Teste
O final do arquivo executa um cenário real para testar todas as funcionalidades:

```typescript
// Testa se o cache de memória está funcionando (retorna true)
const itemA = Item.create("Testando cache");
const itemB = Item.load(itemA.id);
console.log("Mesma referência de memória?:", itemA === itemB); 

// Instancia a lista e adiciona novos itens
const lista = new TodoList();
const item1 = lista.addItem("Grêmio campeão");
const item2 = lista.addItem("Brasil hexacampeão");
const item3 = lista.addItem("Neymar melhor do mundo");
console.table(lista.getItems());

// Modifica os dados (deleta o primeiro e atualiza o terceiro)
lista.removeItems(item1.id);
lista.updateItems(item3.id, "Neymar é o melhor do mundo");
console.table(lista.getItems());
```

## Como Executar o Projeto
Como o projeto utiliza o Bun, o processo de configuração e execução é extremamente simples e rápido.

### Pré-requisitos
Certifique-se de ter o Bun instalado em seu computador. Se não tiver, instale rodando o comando abaixo no terminal:

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
```

### Passo a passo para rodar 

- 1. Abra o terminal na pasta onde está o seu arquivo de código.
- 2. Inicie o projeto Bun (caso ainda não tenha iniciado):
```bash
  bun init -y
```
- 3. Salve o código:
Certifique-se de que todo o código está salvo em um arquivo chamado index.ts.
- 4. Execute a aplicação:

```bash
bun run index.ts
```

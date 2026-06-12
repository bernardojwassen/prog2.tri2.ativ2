import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  );
`);

const queryInsert = db.prepare("INSERT INTO items (title) VALUES (?)");
const querySelectAll = db.prepare("SELECT * FROM items");
const querySelectOne = db.prepare("SELECT * FROM items WHERE id = ? LIMIT 1");
const queryUpdate = db.prepare("UPDATE items SET title = ? WHERE id = ?");
const queryDelete = db.prepare("DELETE FROM items WHERE id = ?");

type ModelTitle = { id: number; title: string };

class Item {
  private static cache: Map<number, Item> = new Map();
  private _id: number;
  private _title: string;

  private constructor(id: number, title: string) {
    this._id = id;
    this._title = title;
  }

  static create(title: string): Item {
    const resp = queryInsert.run(title);
    const id = resp.lastInsertRowid as number;
    const instance = new Item(id, title);
    Item.cache.set(id, instance);
    return instance;
  }

  static load(id: number): Item {
    if (Item.cache.has(id)) return Item.cache.get(id)!;

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

  get id(): number {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(newTitle: string) {
    queryUpdate.run(newTitle, this._id);
    this._title = newTitle;
  }
}

class TodoList {
  private items: Item[];

  constructor() {
    this.items = Item.loadAll();
  }

  getItems(): Item[] {
    return this.items;
  }

  addItem(title: string): Item {
    const item = Item.create(title);
    this.items.push(item);
    return item;
  }

  removeItems(id: number): void {
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index].remove(); 
      this.items.splice(index, 1); 
    }
  }

  updateItems(id: number, newTitle: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.title = newTitle; 
    }
  }
}

const itemA = Item.create("Testando cache");
const itemB = Item.load(itemA.id);
console.log("Mesma referência de memória?:", itemA === itemB); 

console.log("\nEstado Primário da Lista");
const lista = new TodoList();

const item1 = lista.addItem("Grêmio campeão");
const item2 = lista.addItem("Brasil hexacampeão");
const item3 = lista.addItem("Neymar melhor do mundo");

console.table(lista.getItems());

console.log("\n Após Modificações se remover o primeiro e atualizar o terceiro");
lista.removeItems(item1.id);
lista.updateItems(item3.id, "Neymar é o melhor do mundo");

console.table(lista.getItems());
import type { ItemProps, ItemPropsWithId } from './Item'
import { Database } from 'bun:sqlite'

const db = new Database('database.sqlite', { strict: true })

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  )
`)

class Item {
  public static all = () =>
    db.query('SELECT * FROM items').all() as ItemPropsWithId[]

  public static one = (id: number) =>
    db
      .query('SELECT * FROM items WHERE id = $id LIMIT 1')
      .get({ id }) as ItemPropsWithId | null

  public static insert = (props: ItemProps) =>
    db
      .query('INSERT INTO items (title) VALUES ($title)')
      .run({ title: props.title })
      .lastInsertRowid as number

  public static update = (id: number, props: ItemProps) =>
    db
      .query('UPDATE items SET title = $title WHERE id = $id')
      .run({ id, title: props.title })
      .changes

  public static delete = (id: number) =>
    db
      .query('DELETE FROM items WHERE id = $id')
      .run({ id }).changes
}

class TodoList {
  addItem(title: string): number {
    return Item.insert({ title })
  }

  removeItem(id: number): number {
    return Item.delete(id)
  }

  updateItem(id: number, title: string): number {
    return Item.update(id, { title })
  }

  getItems(): ItemPropsWithId[] {
    return Item.all()
  }

  getItem(id: number): ItemPropsWithId | null {
    return Item.one(id)
  }
}

// Exemplo de uso
const lista = new TodoList()

//lista.addItem('ficar quieto')
//lista.addItem('prestar atenção')
//lista.addItem('aprender typescript')

//console.log('Todos os itens:')
//console.log(lista.getItems())

//console.log('Item 1:')
//console.log(lista.getItem(1))

//lista.updateItem(1, 'ficar em silêncio')

//console.log('Após atualização:')
//console.log(lista.getItems())

//lista.removeItem(2)

//console.log('Após remoção:')
//console.log(lista.getItems())

export { Item, TodoList }
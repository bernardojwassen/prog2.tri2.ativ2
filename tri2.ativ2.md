# Atividade 2 - Laboratório de Programação

## Objetivo

- Treinar a capacidade de interpretação de código
- Treinar a capacidade de implementação de funcionalidades
- Treinar a capacidade de ler e adaptar código de terceiros
- Treinar a capacidade de usar o `git` e o `github` para controle de versão e entrega de atividades

## Descrição

Na pasta `tri2.ativ1` existe o projeto parcial que fizemos em sala de aula, onde estamos adicionando a capacidade de nosso sistema salvar informações em um  banco de dados `sqlite`, o objetivo é ler esse código, entender seu funcionamento e reescrever o métodos do `ToDo List` para usar o banco de dados ao invés de um arquivo `json`.

Altere e teste as funções:

- `addItem` para adicionar um item no banco de dados
- `getItems` para retornar os itens do banco de dados
- `deleteItem` para deletar um item do banco de dados
- `updateItem` para atualizar um item do banco de dados

## Resultado esperado

No repositório `prog2.tri2.ativ2` deve conter o código atualizado e funcionando, onde as rotas do `ToDo List` estão usando o banco de dados para salvar as informações, e não mais um arquivo `json`. O arquivo `README.md` deve conter uma explicação de como o código funciona e como as funções foram implementadas, além de um passo a passo de como rodar o projeto e testar as rotas do `ToDo List`.
# Balcão de Ofertas Eclipseworks

1. `$ npm install`
2. Criar arquivo '.env' com conexão a banco de dados MongoDB

```
PORT=80
DB_URL=mongodb+srv://[user]:[password]@[host]
DB_NAME='balcao-ofertas'
DB_SEED='1'
```

3. `$ npm run start`
4. O script seed foi automaticamente executado e os dados criados armazenados no arquivo 'src/database/seedInfo.json'
5. Com a aplicação executada localmente, a documentação da API estará disponível em http://localhost:80/api-docs/
6. Todas as rotas contam com um parâmetro de query 'userId' que serve como identificação do usuário que está fazendo a requisição
7. Para execuções futuras, alterar o parâmetro DB_SEED no '.env' para '0'
8. Para executar os testes unitários: `$ npm run test`
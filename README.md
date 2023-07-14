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
7. Para evitar a execução do script seed em execuções futuras, alterar o parâmetro DB_SEED no '.env' para '0'
8. Para executar os testes unitários com exibição de cobertura: `$ npm run test:cov`

## Próximos passos

- Desacoplamento de queries ao banco de dados do módulo de serviços, utilizando métodos estáticos customizados dos schemas
- Desacoplar implementação das regras de negócio através de classes "auxiliares" externas, utilizando padrões como Strategy
- Utilizar simulação do banco de dados nos testes unitários
- Criação de testes de integração
- Dockerização da API e banco de dados, facilitando a escalabilidade e implementação de novos microsserviços complementares
- Uso de serviços de mensageria como Kafka ou RabbitMQ para comunicação entre microsserviços sem depender de estrutura request-response
- Implementação de fluxo de CI/CD, com execução de testes em PR e Merge
- Deploy em cloud AWS, Azure etc. (dependendo da infraestrutura disponível da empresa ou requisitos do cliente)
- Forte ênfase na implementação de serviços de segurança de informação, como encriptação, rate limiting, throttling etc. de forma a manter a privacidade dos usuários e segurança das transações financeiras
- Funcionalidade de transferir quantias de moedas entre diferentes carteiras de usuário
- Implementar propriedade de status nas ofertas, de forma a representar por exemplo que uma oferta está no "carrinho" de algum usuário e não ser exibida para outro
- Separação de ofertas ativas e expiradas no banco de dados, de forma a otimizar as queries
- Implementação de microsserviço para análise de dados e exibição para usuário, como histórico de vendas e preços, flutuação de demanda para moedas específicas etc.
- Implementação de microsserviço de backoffice, com adição e configuração de moedas, perfis de uso, faturamento do serviço etc.
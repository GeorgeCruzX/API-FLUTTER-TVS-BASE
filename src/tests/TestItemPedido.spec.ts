const request = require("supertest");
import { ItemDoPedido } from "../models/ItemDoPedido";
import { app } from "../server"; // Certifique-se de que o caminho está correto

describe("Teste da Rota incluirItemDoPedido", () => {
  let pedidoNovoId: number;

  it("Deve incluir um novo item do pedido com sucesso", async () => {
    const novoItem = {
        id_pedido: 1,
        id_produto: 3,
        qtdade: 3
    };

    const response = await request(app).post("/incluirItemDoPedido").send(novoItem);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.id_pedido).toBe(novoItem.id_pedido);
    expect(response.body.id_produto).toBe(novoItem.id_produto);
    expect(response.body.qtdade).toBe(novoItem.qtdade);
    
    pedidoNovoId = response.body.id; // Armazena o ID do pedido recém-criado para limpeza posterior
  });

  it("Deve retornar erro ao tentar incluir um item para um pedido inválido", async () => {
    const novoItem = {
        id_pedido: 99999,
        id_produto: 3,
        qtdade: 3
    };

    const response = await request(app).post("/incluirItemDoPedido").send(novoItem);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", 'Pedido ou Produto não encontrado');
  }); 

  it("Deve retornar erro ao tentar incluir um item para um produto inválido", async () => {
    const novoItem = {
        id_pedido: 1,
        id_produto: 9999,
        qtdade: 3
    };

    const response = await request(app).post("/incluirItemDoPedido").send(novoItem);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", 'Pedido ou Produto não encontrado');
  }); 

  afterAll(async () => {
    if (pedidoNovoId) {
      await ItemDoPedido.destroy({ where: { id: pedidoNovoId } });
    }
  });
});

describe("Teste da Rota getItemDoPedidoById", () => {
  it("Deve retornar o item correto quando o id é valido", async () => {
    const idItem = 1;
    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(200);
    expect(response.body.itemDoPedido).toHaveProperty("id", idItem);
  });

  it("Deve retornar o cliente correto", async () => {
    const idItem = 1;
    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(200);
    expect(response.body.itemDoPedido.cliente);
  });
  it("Deve retornar o produto correto", async () => {
    const idItem = 1;
    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(200);
    expect(response.body.itemDoPedido.produto);
  });
  it("Deve retornar o pedido correto", async () => {
    const idItem = 1;
    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(200);
    expect(response.body.itemDoPedido.pedido);
  });

  it("Deve retornar um status 404 quando o Id do item nao existe", async () => {
    const idItem = 999;

    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", 'Item do Pedido não encontrado');
  });

  it("Deve retornar um status 400 quando o Id do item não for um número", async () => {
    const idItem = "abc";

    const response = await request(app).get(`/itensDoPedido/${idItem}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", 'Id não é um número' );
  });
  it("Deve retornar a lista de itens dentro de um tempo aceitavel", async () => {
    const start = Date.now();
    const idItem = 1;
    const response = await request(app).get(`/itensDoPedido/${idItem}`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200); // Verifica se a resposta é retornada em menos de 200ms
  });
});

describe("Teste da Rota listar Item do pedido", () => {
  it("Deve retornar uma lista de itens", async () => {
    const response = await request(app).get("/itensDoPedido");

    expect(response.status).toBe(200);
    expect(response.body.itensDoPedido).toBeInstanceOf(Array);
  });

  it("Deve retornar a lista de itens dentro de um tempo aceitavel", async () => {
    const start = Date.now();
    const response = await request(app).get("/itensDoPedido");
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100); // Verifica se a resposta é retornada em menos de 500ms
  });
  
});

describe("Teste da Rota excluirItemDoPedido", () => {
  beforeAll(async () => {
    await ItemDoPedido.create({
      id:99,
      id_pedido: 1,
      id_produto: 3,
      qtdade: 3
  });
  });

  afterAll(async () => {
    await ItemDoPedido.destroy({ where: { id: 99 } });
  });

  it("Deve excluir um cliente existente", async () => {
    const response = await request(app).delete("/excluirItemDoPedido/99");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", 'Item do Pedido excluído com sucesso');

    const clienteExcluido = await ItemDoPedido.findByPk(99);
    expect(clienteExcluido).toBeNull(); 
  });
});
const request = require("supertest");
import { Pedido } from "../models/Pedido";
import { app } from "../server"; // Certifique-se de que o caminho está correto

describe("Teste da Rota incluirPedido", () => {
  let pedidoNovoId: number;

  it("Deve incluir um novo pedido com sucesso", async () => {
    const novoPedido = {
        data: "2024-08-01T07:11:40.000Z",
        id_cliente: 1
    };

    const response = await request(app).post("/incluirPedido").send(novoPedido);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.data).toBe(novoPedido.data);
    expect(response.body.id_cliente).toBe(novoPedido.id_cliente);

    pedidoNovoId = response.body.id; // Armazena o ID do pedido recém-criado para limpeza posterior
  });
  //"Erro ao incluir pedido"
  it("Deve retornar erro ao tentar incluir um pedido para um cliente inválido", async () => {
    const novoPedido = {
        data: "2024-08-01T07:11:40.000Z",
        id_cliente: 99999
    };

    // Tenta incluir um cliente com CPF já existente
    const response = await request(app).post("/incluirPedido").send(novoPedido);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Erro ao incluir pedido");
  });

  afterAll(async () => {
    if (pedidoNovoId) {
      await Pedido.destroy({ where: { id: pedidoNovoId } });
    }
  });
});

describe("Teste da Rota getPedidoById", () => {
    it("Deve retornar o pedido correto quando o id é valido", async () => {
      const idPedido = 1; // Supondo que este seja um Id válido existente no seu banco de dados
      const response = await request(app).get(`/pedidos/${idPedido}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", idPedido);
    });
  
    it("Deve retornar um status 404 quando o Id do pedido nao existe", async () => {
      const idPedido = 999;
  
      const response = await request(app).get(`/pedidos/${idPedido}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Pedido não encontrado");
    });
  });

  describe("Teste da Rota listarPedidos", () => {
    it("Deve retornar uma lista de pedidos", async () => {
      const response = await request(app).get("/Pedidos");
  
      expect(response.status).toBe(200);
      expect(response.body.pedidos).toBeInstanceOf(Array);
    });
  
    it("Deve retornar a lista de pedidos dentro de um tempo aceitavel", async () => {
      const start = Date.now();
      const response = await request(app).get("/Pedidos");
      const duration = Date.now() - start;
  
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // Verifica se a resposta é retornada em menos de 500ms
    });
  });

  describe("Teste da Rota excluirPedido", () => {
    beforeAll(async () => {
      await Pedido.create({ id: 99,data: "2024-08-01T07:11:40.000Z",   id_cliente: 1 });
    });
  
    afterAll(async () => {
      // Limpa o banco de dados após os testes
      await Pedido.destroy({ where: { id: 99 } });
    });
  
    it("Deve excluir um pedido existente", async () => {
      const response = await request(app).delete("/excluirPedido/99");
  
      // Verifica se a resposta da API está correta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Pedido excluído com sucesso");
  
      const clienteExcluido = await Pedido.findByPk(99);
      expect(clienteExcluido).toBeNull(); 
    });
  });

  describe("Teste da Rota atualizarPedido", () => {
    let pedidoId: number;
    let pedidoExistenteId: number;
  
    beforeAll(async () => {
      // Cria um pedido para testes
      const pedido = await Pedido.create({
        data: "2024-08-01T07:11:40.000Z",
        id_cliente: 1
      });
      pedidoExistenteId = pedido.id;
  
      const pedidoParaAtualizar = await Pedido.create({
        data: "2024-08-20T07:11:40.000Z",
        id_cliente: 1
      });
      pedidoId = pedidoParaAtualizar.id;
    });
  
    it("Deve atualizar um pedido com sucesso", async () => {
      const pedidoAtualizado = {
        data: "2024-08-19T07:11:40.000Z",
        id_cliente: 1
      };
  
      const response = await request(app).put(`/atualizarPedido/${pedidoId}`).send(pedidoAtualizado);
  
      expect(response.status).toBe(200);
      expect(response.body.data).toBe(pedidoAtualizado.data);
      expect(response.body.id_cliente).toBe(pedidoAtualizado.id_cliente);
    });
  
    it("Deve retornar erro ao tentar atualizar pedido com um cliente inválido", async () => {
      const pedidoAtualizado = {
        data: "2024-08-19T07:11:40.000Z",
        id_cliente: 9999
      };
  
      const response = await request(app).put(`/atualizarPedido/${pedidoId}`).send(pedidoAtualizado);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Erro ao atualizar pedido" );
    });
  
    it("Deve retornar erro ao tentar atualizar pedido inexistente", async () => {
      const pedidoInexistenteId = 999999;
      const pedidoAtualizado = {
        data: "2024-08-19T07:11:40.000Z",
        id_cliente: 1
      };
  
      const response = await request(app).put(`/atualizarPedido/${pedidoInexistenteId}`).send(pedidoAtualizado);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Pedido não encontrado" );
    });
  
    afterAll(async () => {
      // Limpeza dos pedidos criados
      await Pedido.destroy({ where: { id: [pedidoId, pedidoExistenteId] } });
    });
  });
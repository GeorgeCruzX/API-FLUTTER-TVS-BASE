const request = require("supertest");
import { Produto } from "../models/Produto";
import { app } from "../server"; // Certifique-se de que o caminho está correto

describe("Teste da Rota incluirProduto", () => {
  let produtoNovoId: number;

  it("Deve incluir um novo produto com sucesso", async () => {
    const novoProduto = {
        descricao: "Produto de teste"
    };

    const response = await request(app).post("/incluirProduto").send(novoProduto);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.descricao).toBe(novoProduto.descricao);

    produtoNovoId = response.body.id; // Armazena o ID do cliente recém-criado para limpeza posterior
  });

  afterAll(async () => {
    if (produtoNovoId) {
      await Produto.destroy({ where: { id: produtoNovoId } });
    }
  });
});

describe("Teste da Rota getProdutoById", () => {
    it("Deve retornar o produto correto quando o id é valido", async () => {
      const idProduto = 3; // Supondo que este seja um Id válido existente no seu banco de dados
      const response = await request(app).get(`/produtos/${idProduto}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", idProduto);
    });
  
    it("Deve retornar um status 404 quando o Id do produto nao existe", async () => {
      const idProduto = 999;
  
      const response = await request(app).get(`/produtos/${idProduto}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Produto não encontrado");
    });
  });

  describe("Teste da Rota listarProdutos", () => {
    it("Deve retornar uma lista de produtos", async () => {
      const response = await request(app).get("/produtos");
  
      expect(response.status).toBe(200);
      expect(response.body.produtos).toBeInstanceOf(Array);
    });
  
    it("Deve retornar a lista de produtos dentro de um tempo aceitavel", async () => {
      const start = Date.now();
      const response = await request(app).get("/produtos");
      const duration = Date.now() - start;
  
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // Verifica se a resposta é retornada em menos de 500ms
    });
  });

  describe("Teste da Rota excluirProduto", () => {
    beforeAll(async () => {
      await Produto.create({ id: 99, descricao: "descricao" });
    });
  
    afterAll(async () => {
      // Limpa o banco de dados após os testes
      await Produto.destroy({ where: { id: 99 } });
    });
  
    it("Deve excluir um produto existente", async () => {
      const response = await request(app).delete("/excluirProduto/99");
  
      // Verifica se a resposta da API está correta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Produto excluído com sucesso");
  
      const clienteExcluido = await Produto.findByPk(99);
      expect(clienteExcluido).toBeNull(); 
    });
  });

  describe("Teste da Rota atualizarProduto", () => {
    let produtoId: number;
    let produtoExistenteId: number;
  
    beforeAll(async () => {
      const produto = await Produto.create({
        descricao: "descricao",
      });
      produtoExistenteId = produto.id;
  
      // Cria outro cliente para ser atualizado
      const produtoParaAtualizar = await Produto.create({
        descricao: "nova descricao",
      });
      produtoId = produtoParaAtualizar.id;
    });
  
    it("Deve atualizar um cliente com sucesso", async () => {
      const produtoAtualizado = {
        descricao: "produto Atualizado",
      };
  
      const response = await request(app).put(`/atualizarProduto/${produtoId}`).send(produtoAtualizado);
  
      expect(response.status).toBe(200);
      expect(response.body.descricao).toBe(produtoAtualizado.descricao);
    });
  
    it("Deve retornar erro ao tentar atualizar cliente inexistente", async () => {
      const produtoInexistenteId = 999999;
      const produtoAtualizado = {
        descricao: "descricao",
      };
  
      const response = await request(app).put(`/atualizarProduto/${produtoInexistenteId}`).send(produtoAtualizado);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Produto não encontrado");
    });
  
    afterAll(async () => {
      // Limpeza dos clientes criados
      await Produto.destroy({ where: { id: [produtoId, produtoExistenteId] } });
    });
  });
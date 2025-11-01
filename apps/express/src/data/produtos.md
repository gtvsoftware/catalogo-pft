# 🌿 **Documento Final — Cadastro de Plantas e Flores (CRM Comercial)**

## 1. Objetivo

Criar um módulo de cadastro de **plantas e flores** com os seguintes recursos:

* Registro de **Produto Base** (espécie ou grupo comercial);
* Criação de **Conjuntos Comerciais** (variedade + embalagem + pote + hastes + altura + cor + código veiling + nível comercial);
* Controle de **preço sugerido** com histórico semanal;
* Upload de **imagens** por conjunto ou produto base;
* Indexação automática no **Typesense** para busca rápida e precisa;
* Agilidade no **cadastro comercial**, com parser de entrada rápida (ex: “Orquídea Phalaenopsis 1 haste Pote 06”).

---

## 2. Modelo de Dados

### 2.1 Produto Base

Representa a **espécie ou grupo principal**.

| Campo               | Tipo                     | Descrição                                          |
| ------------------- | ------------------------ | -------------------------------------------------- |
| `id`                | string (UUID)            | Identificador único do produto                     |
| `produto_base`      | string                   | Nome comercial principal (Ex: Zantedeschia)        |
| `tipo_produto`      | enum(`planta`, `flor`)   | Categoria principal                                |
| `descricao`         | string                   | Observações gerais sobre a espécie                 |
| `status`            | enum(`ativo`, `inativo`) | Controla se é permitido novo cadastro de conjuntos |
| `galeria_principal` | array[{url, principal}]  | Imagens genéricas do produto base                  |
| `created_at`        | datetime                 | Data de criação                                    |
| `updated_at`        | datetime                 | Última atualização                                 |

**Exemplo JSON Produto Base:**

```json
{
  "id": "zantedeschia",
  "produto_base": "Zantedeschia",
  "tipo_produto": "planta",
  "descricao": "Zantedeschia é uma planta ornamental com flores elegantes. Variedades podem ter cores e tamanhos diferentes.",
  "status": "ativo",
  "galeria_principal": [
    { "url": "https://cdn.site.com/zantedeschia-principal.jpg", "principal": true }
  ],
  "created_at": "2025-10-31T12:00:00Z",
  "updated_at": "2025-10-31T12:00:00Z"
}
```

---

### 2.2 Conjunto Comercial

Cada produto base pode ter **vários conjuntos comerciais**, representando combinações **vendáveis**.

| Campo                  | Tipo                                        | Descrição                                                                |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `id`                   | string                                      | Identificador único do conjunto                                          |
| `produto_id`           | string                                      | FK para Produto Base                                                     |
| `variedade`            | string                                      | Nome da variedade (Ex: Airbrush, Phalaenopsis)                           |
| `nivel_comercial`      | string (opcional)                           | Ex: Premium, Standard                                                    |
| `tipo_embalagem`       | enum(`pote`, `maco`, `bandeja`, `terrario`) | Tipo físico de venda                                                     |
| `numero_pote`          | string (opcional)                           | Ex: 06, 12, 14; obrigatório se embalagem = pote                          |
| `numero_hastes`        | int (opcional)                              | Número de hastes; usado para pote se aplicável                           |
| `altura_cm`            | int (opcional)                              | Altura da planta em centímetros                                          |
| `cor`                  | string (opcional)                           | Cor predominante ou bicolor                                              |
| `codigo_veiling`       | string (opcional)                           | Código Veiling (ex: 21834.999.000.00.00)                                 |
| `descricao_comercial`  | string                                      | Texto completo para exibição (Ex: “Zantedeschia Airbrush 40 cm Bicolor”) |
| `preco_venda_sugerido` | decimal                                     | Preço sugerido atual                                                     |
| `historico_precos`     | array[{data, preco}]                        | Registro de preços anteriores                                            |
| `imagens`              | array[{url, principal: boolean}]            | Galeria de imagens do conjunto                                           |
| `ativo`                | boolean                                     | Disponível para venda                                                    |
| `created_at`           | datetime                                    | Data de criação                                                          |
| `updated_at`           | datetime                                    | Última atualização                                                       |

**Exemplo JSON Conjunto Comercial:**

```json
{
  "id": "zantedeschia-airbrush-40cm-bicolor",
  "produto_id": "zantedeschia",
  "variedade": "Airbrush",
  "nivel_comercial": null,
  "tipo_produto": "planta",
  "tipo_embalagem": "pote",
  "numero_pote": null,
  "numero_hastes": null,
  "altura_cm": 40,
  "cor": "Bicolor",
  "codigo_veiling": "21834.999.000.00.00",
  "descricao_comercial": "Zantedeschia Airbrush 40 cm Bicolor",
  "preco_venda_sugerido": 0,
  "historico_precos": [],
  "imagens": [
    { "url": "https://cdn.site.com/zantedeschia-airbrush-40cm-bicolor.jpg", "principal": true }
  ],
  "ativo": true,
  "created_at": "2025-10-31T12:00:00Z",
  "updated_at": "2025-10-31T12:00:00Z"
}
```

---

## 3. Regras de Negócio

1. **ID interno** sempre gerado automaticamente pelo CRM.
2. **Descrição comercial** gerada automaticamente concatenando:

   ```
   [produto_base] [variedade] [numero_hastes + " haste(s)"] [tipo_embalagem] [numero_pote] [altura_cm cm] [cor]
   ```
3. **Tipo de embalagem** define campos obrigatórios:

   * Pote → exige `numero_pote` e, se aplicável, `numero_hastes`
   * Maço/Bandeja/Terrário → não exige pote/hastes
4. **Altura e cor** extraídas de textos (ex: “040 CM”, “Bicolor”).
5. **Código Veiling** opcional, mas único por conjunto.
6. **Histórico de preços** atualizado semanalmente; cada alteração cria um registro.
7. **Galeria de imagens** pode ser por produto base ou por conjunto.
8. **Busca Typesense** indexa: `produto_base`, `variedade`, `descricao_comercial`, `numero_pote`, `numero_hastes`, `altura_cm`, `cor`, `codigo_veiling`.

---

## 4. Parsing Automático de Texto

Exemplos:

| Texto                                 | Produto Base | Variedade       | Hastes | Pote | Altura | Cor     | Tipo Embalagem | Código Veiling      |
| ------------------------------------- | ------------ | --------------- | ------ | ---- | ------ | ------- | -------------- | ------------------- |
| Orquídea Phalaenopsis 1 haste Pote 06 | Orquídea     | Phalaenopsis    | 1      | 06   | null   | null    | Pote           | null                |
| Zantedeschia Airbrush 040 CM Bicolor  | Zantedeschia | Airbrush        | null   | null | 40     | Bicolor | Pote (default) | 21834.999.000.00.00 |
| Calathea Variada Premium Pote 12      | Calathea     | Variada Premium | null   | 12   | null   | null    | Pote           | null                |

---

## 5. UI / Cadastro Comercial (ShadCN + Tailwind)

* **Formulário dinâmico:** campos de pote/hastes aparecem apenas quando aplicáveis.
* **Modo rápido:** entrada de texto única que preenche os campos automaticamente.
* **Galeria e histórico inline:** upload de imagens e registro de preços.
* **Botões:** Salvar / Cancelar, validação automática de campos obrigatórios.

---

## 6. Resumo de Conceitos

| Conceito            | Significado                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| Produto Base        | Espécie ou grupo (ex: Zantedeschia)                                             |
| Conjunto Comercial  | Combinação vendável (variedade + pote + hastes + altura + cor + código veiling) |
| Variedade           | Nome botânico ou comercial (ex: Phalaenopsis, Airbrush)                         |
| Nível Comercial     | Premium, Standard, Exportação (opcional)                                        |
| Embalagem           | Pote, Maço, Bandeja, Terrário                                                   |
| Descrição Comercial | Texto completo amigável para busca                                              |
| Histórico de Preço  | Registro de alterações semanais                                                 |
| Código Veiling      | Código único do conjunto (opcional)                                             |
| Galeria             | Imagens por conjunto ou produto base                                            |

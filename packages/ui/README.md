
<img src="https://megtv2.blob.core.windows.net/public/brand/company_logo.png" alt="Logo Terra Viva" width="200"/>

# @terraviva/ui

Biblioteca interna de componentes de UI do Grupo Terra Viva. Seu principal objetivo é promover consistência visual, acelerar o desenvolvimento das interfaces e garantir um alto padrão de acessibilidade nas aplicações da plataforma AgroWeb e outros projetos da empresa.

Construída com **React**, **TypeScript**, estilizada com **Tailwind CSS** e utilizando **Radix UI** como base para muitos de seus primitivos, `@terraviva/ui` adota uma arquitetura inspirada em ShadCN. Os componentes são documentados e visualizáveis através do **Storybook**.

## Índice

* [Contexto e Objetivos](#contexto-e-objetivos)
* [Principais Características](#principais-características)
* [Storybook: Catálogo de Componentes](#storybook-catálogo-de-componentes)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [Como Começar (Usando a Biblioteca)](#como-começar-usando-a-biblioteca)
    * [Instalação](#instalação)
    * [Uso Básico](#uso-básico)
    * [Configuração do Tailwind CSS no Projeto Consumidor](#configuração-do-tailwind-css-no-projeto-consumidor)
* [Desenvolvimento (Contribuindo para a Biblioteca)](#desenvolvimento-contribuindo-para-a-biblioteca)
    * [Pré-requisitos](#pré-requisitos)
    * [Configuração do Ambiente Local](#configuração-do-ambiente-local)
    * [Adicionando Novos Componentes](#adicionando-novos-componentes)
* [Scripts Principais](#scripts-principais)
* [Linting e Formatting](#linting-e-formatting)
* [Diretrizes de Contribuição Interna](#diretrizes-de-contribuição-interna)
* [Licença](#licença)

## Contexto e Objetivos

`@terraviva/ui` visa ser a fonte única da verdade para os elementos de interface utilizados nos projetos do Grupo Terra Viva. Ao centralizar os componentes, buscamos:

* **Consistência Visual:** Garantir que todas as aplicações tenham uma identidade visual coesa.
* **Reusabilidade:** Evitar a duplicação de código e esforço no desenvolvimento de UI.
* **Acessibilidade (a11y):** Construir componentes acessíveis desde o início, aproveitando a base sólida do Radix UI.
* **Manutenibilidade:** Facilitar atualizações e correções de UI de forma centralizada.
* **Produtividade:** Permitir que as equipes de desenvolvimento foquem na lógica de negócios, utilizando componentes prontos e testados.

## Principais Características

* **React & TypeScript:** Tipagem forte para maior segurança e melhor DX.
* **Radix UI Primitives:** Base robusta e acessível para os componentes.
* **Tailwind CSS:** Estilização utilitária para flexibilidade e customização.
* **Arquitetura ShadCN-like:** Componentes modulares e facilmente integráveis.
    * Uso de `class-variance-authority` para variantes de estilo.
    * `tailwind-merge` para gerenciamento inteligente de classes CSS.
* **Tematização:** Suporte a temas (incluindo dark mode via `next-themes` e addon do Storybook).
* **Formulários:** Integração com `react-hook-form` e `zod` para validação.
* **Ampla Gama de Componentes:** Incluindo desde botões básicos até tabelas de dados, gráficos (`recharts`) e seletores de data complexos (veja a seção `exports` no `package.json` para a lista completa).

## Storybook: Catálogo de Componentes

O Storybook é a principal ferramenta para explorar, visualizar e interagir com os componentes da `@terraviva/ui`. Ele fornece um ambiente isolado para cada componente, mostrando suas diferentes variantes, estados e documentação de uso.

* **Para executar o Storybook localmente:**
    ```bash
    pnpm storybook
    ```
    Isso geralmente o disponibilizará em `http://localhost:6006`.

## Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

```
├── .storybook/ # Configurações do Storybook
├── src/
│ ├── @types/ # Definições de tipos globais ou específicos
│ ├── components/ # Código fonte dos componentes
│ │ ├── examples/ # Exemplos de uso mais complexos (se houver)
│ │ ├── theme/ # Configurações de tema, variáveis CSS, etc.
│ │ ├── typography/# Componentes ou estilos de tipografia
│ │ └── ui/ # Diretório principal dos componentes da UI
│ ├── hooks/ # Hooks customizados reutilizáveis
│ ├── schema/ # Esquemas Zod ou outros validadores
│ ├── stories/ # Arquivos de histórias (.stories.tsx) para o Storybook
│ ├── styles/ # Estilos globais (ex: globals.css)
│ └── utils/ # Funções utilitárias (ex: cn para classnames)
├── .gitignore
├── components.json # (Estilo ShadCN) Lista de componentes da UI
├── package.json # Dependências e scripts
├── postcss.config.js # Configuração do PostCSS (usado pelo Tailwind)
├── tailwind.config.ts # Configuração do Tailwind CSS
└── tsconfig.json # Configuração do TypeScript
```

## Como Começar (Usando a Biblioteca)

### Instalação

Esta biblioteca é privada e destinada ao uso interno no Grupo Terra Viva. Para utilizá-la em seus projetos, você provavelmente precisará configurá-lo para acessar o registry privado da empresa (ex: Nexus, Artifactory, GitHub Packages) ou instalá-la a partir de um caminho local/monorepo.

```bash
pnpm add @terraviva/ui
```

### Uso Básico

Os componentes são exportados individualmente, permitindo que você importe apenas o que precisa. Consulte a seção `exports` no `package.json` para ver todos os caminhos de importação disponíveis.

```ts
import { Button } from '@terraviva/ui/button';
import { Input } from '@terraviva/ui/input';
import { cn } from '@terraviva/ui/cn'; // Utilitário para classnames

function MyFormComponent() {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="name">Nome:</label>
        <Input id="name" type="text" placeholder="Seu nome" />
      </div>
      <Button type="submit">Enviar</Button>
    </form>
  );
}
```


Entendido! Você forneceu detalhes muito mais precisos sobre como os projetos consumidores devem configurar o Tailwind CSS para usar a biblioteca `@terraviva/ui`, especialmente no contexto de um monorepo ou usando submódulos e workspaces.

Vou reescrever essa seção do README da `@terraviva/ui` com as suas instruções, corrigindo a numeração para um fluxo lógico e garantindo a clareza.

Aqui está a seção revisada:

----------

### Configuração do Tailwind CSS no Projeto Consumidor

Para que os estilos dos componentes da `@terraviva/ui` funcionem corretamente, o projeto que a consome precisa ter o Tailwind CSS configurado adequadamente e referenciar os arquivos da biblioteca. Siga estes passos:

1.  **Integre a Biblioteca `@terraviva/ui` ao seu Projeto :**
    
    a. Adicione @terraviva/ui como um submódulo Git:
    
    Navegue até o diretório raiz do seu projeto frontend e execute:
    
    ```bash
    git submodule add -b main https://github.com/gtvsoftware/ui.git src/packages/ui # O caminho 'src/packages/ui' é um exemplo, ajuste conforme a estrutura do seu monorepo.
    ```
    
    b. Declare `@terraviva/ui` no package.json do seu projeto frontend:
    
    Utilize a sintaxe de workspace para referenciar a biblioteca localmente:
    
    ```json
     // package.json do seu projeto frontend 
		{ 
		     "dependencies":{  
			     "@terraviva/ui": "workspace:^", 
			     // ... outras dependencias 
			  }
		}
     ```
    
    Após adicionar, execute `pnpm install` na raiz do monorepo para vincular os pacotes.
    
2.  **Instale as Dependências de Build e Estilo no Projeto Consumidor :**
    
    Se ainda não as tiver, instale as versões necessárias de autoprefixer, postcss, tailwindcss e typescript:
        
    ```bash
    pnpm install -D autoprefixer@^10.4.21 postcss@^7.0.39 tailwindcss@^3.4.17 typescript@^5.8.3
    # Use -D para salvar como devDependencies
    ```
    
3.  **Configure o tailwind.config.ts do Projeto Consumidor :**
    
    Importe a configuração base da @terraviva/ui e ajuste os caminhos na propriedade content para que o Tailwind processe as classes da biblioteca e do seu projeto.
      
    ```ts
    import baseConfig from '@terraviva/ui/tailwind.config'
    import type { Config } from 'tailwindcss'

    export default {
    darkMode: ['class'],
    content: [
        './src/**/*.{ts,tsx}',
        '../../packages/ui/src/**/*.{ts,tsx}',
        '../../packages/auth/src/**/*.{ts,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    presets: [baseConfig as any],
    plugins: [require('tailwindcss-animate')],
    theme: {
        extend: {
        borderRadius: {
            lg: 'var(--radius)',
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)'
        },
        colors: {}
        }
    }
    } satisfies Config
    ```
    
4.  **Configure o postcss.config.cjs (ou .js) do Projeto Consumidor:**
    
    Para garantir que o PostCSS processe os estilos corretamente, você pode referenciar diretamente a configuração PostCSS da biblioteca @terraviva/ui.
    
    ```js
    // postcss.config.cjs do seu projeto consumidor
    // @ts-expect-error - No types for postcss
    module.exports = require('@terraviva/ui/postcss');
    ```
    
    _Verifique se o caminho `@terraviva/ui/postcss` corresponde a um arquivo `postcss.config.js` exportado ou acessível pela biblioteca._
    
5.  **Importe os Estilos Base no Layout do Projeto Consumidor:**
    
    No seu arquivo de layout principal (ex: src/app/layout.tsx ou src/app/root-layout.tsx):
      
    ```jsx
	import  '@terraviva/ui/globals.css'
    ```
    


_Consulte sempre a documentação mais atualizada da `@terraviva/ui` ou o Tech Lead responsável para obter as instruções de integração mais precisas e quaisquer passos adicionais específicos do seu ambiente de desenvolvimento._

## Desenvolvimento (Contribuindo para a Biblioteca)

### Pré-requisitos

-   Node.js (versão LTS recomendada, ex: v18.x ou v20.x)
-   pnpm
-   Git

### Configuração do Ambiente Local

1.  **Clone o repositório:**
   
    ```bash
    git clone https://github.com/gtvsoftware/lib-ui.git
    cd lib-ui
    ```
    
2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

### Adicionando Novos Componentes

1.  **Crie o arquivo do componente:**
    -   Local: `src/components/ui/nome-do-componente.tsx`
    -   Siga os padrões de codificação e utilize TypeScript.
2.  **Crie a história no Storybook:**
    -   Local: `src/stories/nome-do-componente.stories.tsx`
    -   Documente as props, variantes e casos de uso.
3.  **Exporte o componente:**
    -   Adicione uma entrada no campo `exports` do `package.json` para o novo componente:        
        ```json
        // package.json
        "exports": {
          // ... outras exportações
          "./nome-do-componente": "./src/components/ui/nome-do-componente.tsx"
        }
        ```
        
4.  **Garanta que o linter e os formatadores passem.**

## Scripts Principais

-   `pnpm storybook` (ou `yarn storybook` / `npm run storybook`): Inicia o Storybook em modo de desenvolvimento.
-   `pnpm build-storybook` (ou `yarn build-storybook` / `npm run build-storybook`): Gera a build estática do Storybook para deploy.
-   `pnpm lint` (se houver script configurado para BiomeJS ou ESLint/Prettier): Executa o linter.

## Linting e Formatting

-   **BiomeJS** é utilizado para linting e formatação, garantindo a consistência do código.
-   Configure seu editor para usar o Biome ou execute os comandos via CLI.   

## Diretrizes de Contribuição Interna

-   Siga o fluxo de branch definido para o Grupo Terra Viva.
-   Crie Pull Requests (PRs) para a branch `dev` (ou a principal de integração).
-   Adicione uma descrição clara no PR, com screenshots ou GIFs do Storybook para novos componentes ou alterações visuais.
-   Garanta que o Storybook funcione corretamente e os linters passem.

## Licença

Este projeto é de uso exclusivo para desenvolvimento interno do Grupo Terra Viva (terraviva.agr.br).

Todos os direitos são reservados e sua redistribuição ou uso externo estão proibidos sem autorização expressa do Grupo Terra Viva.

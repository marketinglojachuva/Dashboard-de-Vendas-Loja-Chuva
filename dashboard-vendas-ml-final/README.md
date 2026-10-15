# Dashboard de Vendas - Mercado Livre

Um dashboard interativo para análise de vendas do Mercado Livre com importação de planilhas Excel e histórico persistente.

## 🚀 Funcionalidades

- ✅ **Importação de Excel** - Upload de arquivos .xlsx com processamento client-side
- ✅ **Histórico Persistente** - Todos os arquivos importados são salvos no navegador (IndexedDB)
- ✅ **Sem Backend** - 100% funcionamento no navegador
- ✅ **Responsive** - Funciona em desktop, tablet e mobile
- ✅ **Análise de Dados** - Estatísticas automáticas de vendas

## 📋 Requisitos

- Node.js 16+ 
- npm ou pnpm

## 🛠️ Instalação

```bash
# Clonar repositório (ou extrair ZIP)
git clone https://github.com/seu-usuario/dashboard-vendas-ml.git
cd dashboard-vendas-ml

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor abrirá automaticamente em `http://localhost:5173/`

### Configurar o Supabase

Crie um arquivo `.env.local` a partir de `.env.example` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores públicos do projeto Supabase. Depois, execute o SQL em `supabase/migrations/20261015_create_historico_importacoes_ml.sql` no SQL Editor do Supabase.

Quando as variáveis estiverem configuradas, cada planilha processada será salva automaticamente na tabela `historico_importacoes_ml`. Sem configuração ou durante uma indisponibilidade do Supabase, a aplicação mantém o histórico no IndexedDB e informa o usuário na interface.

## 📖 Como Usar

### Importar Planilha

1. Clique no botão **"Importar Excel"** (azul)
2. Selecione um arquivo `.xlsx` ou arraste para a área
3. Os dados serão processados e salvos automaticamente
4. Uma notificação confirmará o sucesso

### Acessar Histórico

1. Clique em **"Histórico"** (cinza)
2. Veja todas as importações anteriores
3. Clique em **"Detalhes"** para visualizar os dados
4. Clique em **"Carregar"** para restaurar dados antigos
5. Clique em **"X"** para deletar uma importação

## 🏗️ Estrutura do Projeto

```
.
├── index.html              # Arquivo HTML principal
├── package.json            # Dependências e scripts
├── vite.config.ts          # Configuração do Vite
├── tsconfig.json           # Configuração do TypeScript
├── README.md               # Este arquivo
├── .gitignore              # Arquivos ignorados pelo Git
└── src/
    ├── main.tsx            # Ponto de entrada React
    ├── App.tsx             # Componente principal
    ├── index.css           # Estilos globais
    ├── components/
    │   └── ExcelImportDialog.tsx    # Componente de importação
    ├── pages/
    │   ├── Home.tsx        # Página inicial
    │   └── ImportHistory.tsx # Página de histórico
    └── hooks/
        └── useImportHistory.ts # Hook para gerenciar IndexedDB
```

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build local
npm run preview
```

## 📦 Dependências Principais

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilos
- **SheetJS (xlsx)** - Leitura de Excel
- **Supabase JS** - Persistência remota do histórico de importações
- **Wouter** - Roteamento leve
- **Recharts** - Gráficos
- **Sonner** - Notificações
- **date-fns** - Manipulação de datas

## 🌐 Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. **Fazer push para GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/dashboard-vendas-ml.git
   git push -u origin main
   ```

2. **Conectar no Vercel:**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Selecione seu repositório
   - Clique em "Deploy"

### Opção 2: Deploy Direto

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔍 Troubleshooting

### Erro: "Cannot find module 'xlsx'"
```bash
npm install xlsx date-fns
npm run dev
```

### Erro: "Port 5173 already in use"
```bash
npm run dev -- --port 3000
```

### Dados não aparecem após importação
- Verifique se o arquivo Excel tem dados válidos
- Abra DevTools (F12) e verifique o console
- Tente em navegador diferente

## 📝 Formato do Arquivo Excel

O arquivo deve ter colunas com nomes como:
- `Pedido` ou `Order`
- `Producto` ou `Produto` ou `Product`
- `Unidades` ou `Quantidade` ou `Quantity`
- `Valor` ou `Total` ou `Price`

Exemplo:
| Pedido | Producto | Unidades | Valor |
|--------|----------|----------|-------|
| 12345  | Produto A | 2        | 150.50 |
| 12346  | Produto B | 1        | 200.00 |

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

MIT

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ usando React + Vite**

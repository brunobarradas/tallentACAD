# TallentAcad — Plataforma B-Learning

Plataforma multi-tenant de formação B-Learning para empresas.

## Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Base de dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Stripe
- **Ficheiros**: Cloudflare R2
- **Hosting**: Vercel

## Instalação

### 1. Clonar e instalar dependências
```bash
git clone https://github.com/SEU_USER/tallentacad.git
cd tallentacad
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```
Preencher o ficheiro `.env.local` com as tuas credenciais do Supabase, Stripe e Cloudflare.

### 3. Criar as tabelas no Supabase
- Abrir o Supabase Dashboard
- Ir a **SQL Editor**
- Copiar e executar o conteúdo de `src/lib/schema.sql`

### 4. Correr em desenvolvimento
```bash
npm run dev
```
Abrir [http://localhost:3000](http://localhost:3000)

## Estrutura de pastas

```
src/
├── app/
│   ├── [tenant]/          # Área pública de cada empresa
│   │   ├── page.tsx       # Lista de cursos do tenant
│   │   └── [course]/
│   │       └── page.tsx   # Detalhe do curso + lições
│   ├── admin/             # Painel de gestão (a construir)
│   ├── api/               # API Routes
│   ├── layout.tsx
│   ├── page.tsx           # Landing page
│   └── globals.css
├── components/            # Componentes reutilizáveis
├── lib/
│   ├── supabase.ts        # Clientes Supabase
│   └── schema.sql         # Schema da base de dados
├── middleware/            # Middleware multi-tenant
└── types/                 # Tipos TypeScript
```

## URLs da plataforma

| URL | Descrição |
|-----|-----------|
| `tallentacad.pt` | Landing page |
| `tallentacad.pt/empresaxpto` | Página da empresa com cursos |
| `tallentacad.pt/empresaxpto/curso-excel` | Página de um curso |
| `tallentacad.pt/admin` | Painel de administração |

## Planos de subscrição (Stripe)

| Plano | Cursos | Alunos | Preço |
|-------|--------|--------|-------|
| Starter | 3 | 50 | A definir |
| Pro | 10 | 200 | A definir |
| Enterprise | Ilimitado | Ilimitado | A definir |

## Próximos passos
- [ ] Painel de administração para empresas
- [ ] Sistema de autenticação de formandos
- [ ] Integração Stripe (pagamentos e subscrições)
- [ ] Upload de ficheiros para Cloudflare R2
- [ ] Player de vídeo
- [ ] Sistema de quizzes
- [ ] Certificados de conclusão
- [ ] Versão em inglês (i18n)

# 石坂グループのWebアプリケーション専用のAPI

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
cp .env.example .env
```

### 2. PostgreSQL を起動(Docker)

```bash
pnpm docker:up
```

### 3. Prisma のマイグレーションとシード

```bash
pnpm prisma:migrate 
pnpm prisma:seed      
```

### 4. 起動

```bash
pnpm start:dev
```

- API: <http://localhost:8080/api/v1>
- Swagger: <http://localhost:8080/docs>
- Health: <http://localhost:8080/api/v1/health>

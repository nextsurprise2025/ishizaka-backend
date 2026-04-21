# バックエンド — NestJS + Prisma + PostgreSQL

本番運用を想定した NestJS API のボイラープレートです。

## 技術スタック

- **フレームワーク:** NestJS 10（Express）
- **ORM:** Prisma 5
- **データベース:** PostgreSQL 16（Docker Compose 経由）
- **認証:** JWT（アクセス + リフレッシュ）+ Passport
- **バリデーション:** class-validator + Joi（環境変数）
- **API ドキュメント:** Swagger（OpenAPI）`/docs`
- **ロギング:** Pino（開発環境では pretty 表示)
- **セキュリティ:** Helmet、CORS、レートリミット(Throttler)、compression
- **コード品質:** ESLint、Prettier、Husky + lint-staged
- **テスト:** Jest + Supertest

## フォルダ構成

```
backend/
├── prisma/
│   ├── schema.prisma         # DB スキーマ
│   └── seed.ts               # DB シーダー
├── src/
│   ├── common/               # 共通: decorators, guards, filters, interceptors, dto
│   ├── config/               # app/db 設定 + Joi バリデーション + swagger
│   ├── modules/
│   │   ├── auth/             # JWT ログイン/リフレッシュ/ログアウト + passport 戦略
│   │   ├── users/            # ユーザー CRUD + DTO/エンティティ
│   │   └── health/           # /health エンドポイント(DB + メモリ)
│   ├── prisma/               # PrismaService + モジュール
│   ├── app.module.ts
│   └── main.ts
├── test/                     # E2E テスト
├── docker-compose.yml        # PostgreSQL + pgAdmin
├── Dockerfile
├── .env.example
└── package.json
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
cp .env.example .env
```

`.env` を必要に応じて編集してください(特に `JWT_ACCESS_SECRET` と `JWT_REFRESH_SECRET`)。

### 2. PostgreSQL を起動(Docker)

```bash
pnpm docker:up
```

pgAdmin の UI: <http://localhost:5050>(admin@admin.com / admin)。

### 3. Prisma のマイグレーションとシード

```bash
pnpm prisma:migrate      # 初回マイグレーションを作成
pnpm prisma:seed         # admin@example.com / Admin@123 を投入
```

### 4. 起動

```bash
pnpm start:dev
```

- API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/docs>
- Health: <http://localhost:3001/api/v1/health>

## スクリプト一覧

| スクリプト | 説明 |
| --- | --- |
| `start:dev` | ウォッチモードで起動 |
| `build` | TypeScript を `dist/` にコンパイル |
| `start:prod` | コンパイル済み `dist/main.js` を実行 |
| `lint` | Lint + 自動修正 |
| `format` | Prettier で整形 |
| `test` | ユニットテスト |
| `test:e2e` | E2E テスト |
| `prisma:migrate` | 開発環境でマイグレーションを実行 |
| `prisma:studio` | Prisma Studio UI を開く |
| `prisma:seed` | DB にシードデータを投入 |
| `docker:up / down` | Postgres コンテナの起動/停止 |

## 認証フロー

1. `POST /api/v1/auth/register` → `user`、`accessToken`、`refreshToken` を返却。
2. `POST /api/v1/auth/login` → 同上。
3. 保護されたルートには `Authorization: Bearer <accessToken>` を送信。
4. アクセストークンが失効したら `POST /api/v1/auth/refresh` に `{ refreshToken }` を送ってローテーション。
5. `POST /api/v1/auth/logout` で保存済みリフレッシュハッシュを無効化。

リフレッシュトークンは **bcrypt でハッシュ化** し、ユーザー単位で永続化しています(`users.refreshToken`)。

## 規約

- すべてのコントローラは **機能モジュール単位** に `src/modules/<name>/` へ配置。
- DTO は `class-validator` と `@nestjs/swagger` のデコレータを併用。
- グローバル `HttpExceptionFilter` が統一されたエラー形式を返却。
- グローバル `TransformInterceptor` が成功レスポンスを `{ success, statusCode, data, timestamp }` にラップ。
- グローバル `ThrottlerGuard` — 必要に応じて `@SkipThrottle()` で除外可能。
- ルートを公開する場合は `@Public()`、それ以外は `JwtAuthGuard` を使用。
- ロールベースのアクセス制御には `@Roles(Role.ADMIN)` + `RolesGuard` を使用。
- 設定は `ConfigService`(`registerAs` により型安全化)経由で取得。

## 新しいモジュールの追加

```bash
npx nest g module modules/posts
npx nest g controller modules/posts
npx nest g service modules/posts
```

その後、DTO を `modules/posts/dto/` に作成し、モジュールを `app.module.ts` に登録してください。

## 本番運用

```bash
docker build -t backend:latest .
docker run -p 3001:3001 --env-file .env backend:latest
```

`NODE_ENV=production` を設定、ドキュメントを非公開にしたい場合は `SWAGGER_ENABLED=false` を指定してください。

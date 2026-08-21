# Guitar Chords

キー → メジャー/マイナー → テンションの 3 ステップで選ぶだけで、ギターのコードダイアグラムを表示するウェブアプリ。

全体設計は [DESIGN.md](./DESIGN.md) を参照。

## 開発

```bash
npm install
npm run dev        # 開発サーバ
npm test           # ドメインロジックのテスト
npm run build      # dist/ に静的ファイルを出力
npm run preview    # ビルド結果の確認
```

## デプロイ（Cloudflare Pages）

バックエンドを持たない完全な静的サイトなので、Cloudflare Pages にそのまま載せられる。

**Git 連携で自動デプロイする場合**（推奨）

Cloudflare ダッシュボード → Workers & Pages → Create → Pages → Connect to Git でこのリポジトリを選び、

| 項目 | 値 |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `.node-version`（22）を自動で参照 |

以降は push するたびに本番／プレビューデプロイが走る。

**手元から手動でデプロイする場合**

```bash
npm run build
npx wrangler pages deploy dist --project-name guitar-chord
```

補足:

- `public/_headers` が Cloudflare Pages のヘッダ設定として反映される（ハッシュ付きアセットの長期キャッシュなど）
- Pages はサイトルート配信なので `vite.config.ts` の `base` は `/` のまま
- Pages は常に HTTPS なので、Phase 3 で入れる音声入力（Web Speech API）の要件も満たす

## 実装状況

- [x] Phase 0: プロジェクト雛形・テスト・デプロイ設定
- [x] Phase 1: コード選択 UI とダイアグラム表示
- [ ] Phase 2: Web Audio API による音の確認
- [ ] Phase 3: 音声入力（「いーまいなー」→ Em）
- [ ] Phase 4: 表示の作り込み

## コードフォームの持ち方

全コードを手打ちせず、**可動シェイプ + 開放形テーブル**から生成している。

- `src/domain/voicing/shapes.ts` — 6弦ルート（E フォーム）／5弦ルート（A フォーム）をルート相対のオフセットで定義
- `src/domain/voicing/openChords.ts` — 開放弦を使う定番フォーム（生成結果より押さえやすいので優先表示）
- `src/domain/voicing/generate.ts` — 上記を合成し、押さえやすい順に並べて重複を除去

`src/domain/voicing/generate.test.ts` が全 `root × quality × tension` の組み合わせについて、
「構成音以外を鳴らしていないか」「ルートと性格音を含むか」「表示幅に収まるか」「運指が破綻していないか」を検証している。

## 既知の簡略化

- 音名の表記は異名同音をまとめている（例: B♭m7♭5 の ♭5 は理論上 F♭ だが `E` と表示）
- テンションは `7 / M7 / 6 / sus4 / m7 / m7♭5` に絞っている（9th 系・dim・aug は未対応）

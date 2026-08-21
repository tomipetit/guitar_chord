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
| Framework preset | None（プリセットは使わず下の 2 つを直接入力する） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `.node-version`（22）を自動で参照 |

VitePress プリセットは選ばないこと（Build command が `npm run docs:build`、出力先が `.vitepress/dist` になり失敗する）。

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
- [x] Phase 1: コード選択 UI とダイアグラム表示（スマホではコード指定エリアを開閉式にして表示領域を確保）
- [x] Phase 2: Web Audio API による音の確認（ストローク / アルペジオ、弦の個別タップ）
- [x] Phase 3: 音声入力（「いーまいなー」→ Em）
- [x] Phase 4: 表示の作り込み（フォームの並び順、ダイアグラム、レスポンシブ）
- [x] Phase 5: PWA 化（オフライン動作）、カポ対応、お気に入り
- [ ] 左利き反転、ダーク/ライト切替

## コードフォームの持ち方

全コードを手打ちせず、**可動シェイプ + 開放形テーブル**から生成している。

- `src/domain/voicing/shapes.ts` — 6弦ルート（E フォーム）／5弦ルート（A フォーム）をルート相対のオフセットで定義
- `src/domain/voicing/openChords.ts` — 開放弦を使う定番フォーム（生成結果より押さえやすいので優先表示）
- `src/domain/voicing/generate.ts` — 上記を合成し、重複を除いて押さえやすい順に並べる

並び順はシェイプの種類ではなく負担そのもので決める（`voicingDifficulty`）。
最低フレット・指の広がり・バレーの有無・開放弦の数から算出するので、
たとえば Em7 なら `開放 → 5弦ルート 7fr → 6弦ルート 12fr` の順になる。

`src/domain/voicing/generate.test.ts` が全 `root × quality × tension` の組み合わせについて、
「構成音以外を鳴らしていないか」「ルートと性格音を含むか」「表示幅に収まるか」「運指が破綻していないか」を検証している。

## 音の鳴らし方

音源ファイルは持たず、**Karplus-Strong 法**で撥弦音をその場で合成している（`src/platform/audio/pluck.ts`）。
ノイズを 1 周期ぶん詰めた遅延線をローパス付きで循環させると、任意のピッチの弦の音が得られる。

- `src/platform/audio/player.ts` — AudioContext の遅延生成（iOS の自動再生制限対策）、
  ストローク / アルペジオの発音スケジュール、フェードアウト付きの停止
- `src/platform/audio/useChordPlayer.ts` — React から使うためのフック
- ダイアグラムの弦をタップすると、その弦の音だけを鳴らせる

`src/platform/audio/pluck.test.ts` が、生成波形が自己相関で狙ったピッチの周期になっていること、
減衰すること、末尾が振幅 0 で終わる（クリックノイズが出ない）ことを検証している。

## 音声入力

マイクボタンから Web Speech API で聞き取り、コード指定として解釈する。

```
（音声）「いーまいなー」 → 【コード】Em
```

- `src/domain/speech/normalize.ts` — NFKC / カタカナ→ひらがな / 記号除去。
  `M7` と `m7` の区別が消えるため小文字化はしない
- `src/domain/speech/dictionary.ts` — 読みの辞書。最長一致で走査するので並び順に依存しない
- `src/domain/speech/parse.ts` — トークン列からコードを組み立て、確信度を付けて返す
- `src/platform/recognition/` — Web Speech API のラッパ（非対応ならマイク自体を出さない）

認識候補は `maxAlternatives = 5` で複数受け取り、同じコードに畳んで確信度順に並べる。
候補が 1 つで確信度が高ければ確認なしで適用し、割れたら下からシートを出して選ばせる。
聞き取った文字列は常に表示するので、誤認識はユーザー側で把握できる。

`src/domain/speech/parse.test.ts` が読みの揺れ・`b` の曖昧性・`M7` / `m7` の区別・
解釈できない発話の扱いを検証している。

## カポ

選ぶのは常に「鳴らしたい実音」。カポを設定すると、押さえる形だけがその ぶんだけ低いコードに変わる。

```
E♭ を選んでカポ 3fr → 「押さえる形は C」と表示し、C のダイアグラムを描く
```

ダイアグラムのフレット番号はカポ基準（市販のコードブックと同じ流儀）で、ナットはカポとして色を変える。
コード名と構成音の表示、そして再生音はいずれも実音のまま。

## オフライン対応（PWA）

ホーム画面に追加でき、一度開けばオフラインでも動く。取得すべきデータが無いアプリなので、
配信物（200KB 弱）を丸ごとキャッシュすれば完結する。

- 画面本体はネットワーク優先 — デプロイした更新が確実に届く
- ハッシュ付きアセットはキャッシュ優先 — 中身が変わればファイル名も変わるので陳腐化しない
- `sw.js` 自身は `_headers` で `no-cache`。ここをキャッシュされると更新が届かなくなる

## コード表示からの直接操作

指定エリアを開かずにコードを変えられる。

- **半音送り** — ダイアグラムを横スワイプ、または左右の `‹` `›` ボタン
- **マイナー切替** — コード名の横のトグル（Step2 の選択と同期）
- どちらもテンションは引き継ぐ（`C7` → 送る → `C♯7`、マイナーへ → `Cm7`）

移調は `transposeSelection` に集約し、カポの読み替えも同じ関数を使っている。

## お気に入り

コード名の横の★で登録し、画面上部のバーからすぐ呼び出せる。保存先は `localStorage`（端末内・24件まで）。

保存するのはコードだけで、カポは含めない。カポは別軸の設定なので、
カポ 3fr で E♭ を登録して後でカポを外しても E♭ のまま表示される。

保存内容は書き換えられる前提で扱う。壊れた JSON・知らない値・重複はすべて読み込み時に落とし、
`localStorage` 自体が使えない環境でも例外を握りつぶしてアプリは動き続ける
（`src/platform/storage/favorites.test.ts` で検証）。

## 既知の簡略化

- 音名の表記は異名同音をまとめている（例: B♭m7♭5 の ♭5 は理論上 F♭ だが `E` と表示）
- テンションは `7 / M7 / 6 / sus4 / m7 / m7♭5` に絞っている（9th 系・dim・aug は未対応）
- ダイアグラムの弦タップはポインタ操作専用（キーボードからは再生ボタンでコード全体を鳴らす）

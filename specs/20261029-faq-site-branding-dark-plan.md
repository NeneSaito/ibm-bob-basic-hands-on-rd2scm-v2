# 実装計画書: FAQサイト ブランド要素追加・ダークテーマ対応

## 基本情報

* 仕様書: 20261029-faq-site-branding-dark-spec.md
* 作成日時: 2026-10-29T14:49:25+09:00
* 更新日時: 2026-10-29T14:51:23+09:00
* 作成者:
* ステータス: Approved

## 変更ファイル一覧

| ファイル       | 変更種別 | 変更概要                                                         |
| -------------- | -------- | ---------------------------------------------------------------- |
| `style.css`    | 修正     | 配色変数の変更、ダークテーマ変数の追加、ロゴ・トグルのスタイル追加 |
| `index.html`   | 修正     | ヘッダーへのロゴ・トグルボタン追加、テーマ切替JS・初期テーマ適用の追加 |

## 実装手順

1. **`style.css` を修正する**
   * `:root`（ライト）の変数を `bob.svg` の配色に変更
     * `--color-primary: #0f62fe`、`--color-primary-hover: #0043ce`、`--color-primary-light: #edf5ff`
     * `--color-accent: #a56eff`
     * `--color-bg: #f4f4f4`、`--color-border: #e0e0e0`、`--color-text: #262626`
   * ヘッダー背景を `linear-gradient(135deg, #0f62fe 0%, #a56eff 100%)` に変更
   * 検索フォーカス時の `box-shadow` の色を `rgba(15, 98, 254, 0.12)` に変更
   * `html[data-theme="dark"]` で変数を上書き（背景・サーフェス・ボーダー・文字色・プライマリ明度・影）
   * ダークでヘッダー背景が暗くなりすぎないよう、必要に応じてヘッダー用変数（`--header-gradient`）を導入
   * `.header-top`（ロゴとトグルを両端に配置するフレックス行）を追加
   * `.logo-link` / `.logo-link img`（48px、モバイル40px）を追加
   * `.theme-toggle`（円形ボタン、ホバー/フォーカス表示、アイコン切替）を追加
   * 768px以下のメディアクエリにロゴサイズとヘッダー余白を追加
   * 配色変更後に直書きの色（`#fff` 等）が残る箇所を確認し、必要なものだけ変数化

2. **`index.html` を修正する**
   * `<head>` の `<link rel="stylesheet">` の前に、初期テーマを適用するインラインスクリプトを追加（`localStorage` の値を読み、`data-theme` を `<html>` に設定。ちらつき防止）
   * `<header>` の先頭に `.header-top` を追加
     * 左: `<a class="logo-link" href="https://www.ibm.com/products/bob" target="_blank" rel="noopener noreferrer"><img src="bob.svg" alt="IBM Bob" width="48" height="48"></a>`
     * 右: `<button class="theme-toggle" id="theme-toggle" aria-label="...">`（月/太陽のインラインSVGアイコン）
   * 既存の `<h1>` / `<p>` はそのまま維持
   * 既存IIFE内、またはその直後にテーマ切替処理を追加
     * クリックで `data-theme` を `light` / `dark` に切り替え
     * `localStorage` に保存
     * `aria-label` と `aria-pressed` を状態に応じて更新
   * `localStorage` が使えない環境で例外が出ないよう `try/catch` で囲む

3. **動作確認**（検証計画に従う）

## GUI実装

* 対象コンポーネント: `index.html` の `<header>`（ロゴ、トグル）と、全体の配色（`style.css`）
* スタイル: `style.css` のCSS変数で管理し、`html[data-theme="dark"]` で上書き
* 状態管理: `<html>` の `data-theme` 属性と `localStorage`（キー: `theme`、値: `light` / `dark`）
* 画面遷移: ロゴは外部リンク（新しいタブ）。画面内遷移なし
* レスポンシブ対応: 既存の768pxブレークポイントで、ロゴを40pxに縮小

## テストの追加・更新

* テストファイルなし（静的HTMLのため）。ブラウザでの手動確認で代替

## 検証計画

1. `index.html` を開き、ヘッダー左上にロゴ、右上にトグルが表示されることを確認
2. ロゴクリックで https://www.ibm.com/products/bob が新しいタブで開くことを確認
3. ライトテーマで配色が `#0f62fe` / `#a56eff` ベースになっていることを確認
4. トグルでダークに切り替わり、検索バー、カテゴリボタン、アコーディオン（開/閉）、0件メッセージ、フッターが読みやすいことを確認
5. リロードしても選択が維持されることを確認
6. 検索、カテゴリ絞り込み、アコーディオン開閉の既存機能が動作することを確認
7. 375px幅でロゴが40pxになり、レイアウトが崩れないことを確認
8. ダーク背景でロゴが視認できることを確認

## 移行・ロールバック

* `style.css` と `index.html` はコミット前の未追跡ファイルのため、ロールバックは変更箇所を元に戻す形になる。今回の変更前の状態は、必要なら事前にバックアップを取る

## 未解決事項

* なし

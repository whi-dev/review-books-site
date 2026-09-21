# review-books-site

レビューブック（iOS）のランディングサイト。GitHub Pages が `main` のルートをそのまま配信する。

## ビルド

    npm run build   # src/genres.json + src/templates → index.html, <slug>/index.html, sitemap.xml, robots.txt
    npm run check   # 生成物の検証（リンク切れ・必須メタ・sitemap 件数）
    npm test        # render.mjs / build.mjs の単体テスト
    npm run serve   # http://localhost:8080

生成物はコミットする（Actions は使わない）。

## ジャンルを足す

`src/genres.json` に 1 件追加して `npm run build && npm run check`。`screenshot` は `assets/screenshots/` に置く。

## 後から入れる値（src/site.json）

- `campaignPt`: App Store Connect › アナリティクス › キャンペーン › リンクを生成 で得た `pt=` の値。入れると DL ボタンが `?pt=…&ct=site-<slug>&mt=8` 付きになる。
- `searchConsoleToken`: Search Console の meta タグ方式の確認トークン。

## 公開

https://whi-dev.github.io/review-books-site/ — GitHub Pages（`main` ルート）。初回公開 2026-09-21。

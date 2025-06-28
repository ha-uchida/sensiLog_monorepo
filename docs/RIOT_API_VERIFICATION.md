# Riot API Verification Setup

## 検証ファイルの設定

Riot APIの認証には、ウェブサイトのルートに`riot.txt`ファイルを配置する必要があります。

### 手順

1. **検証コードの取得**
   - Riot Developer Portalで提供される検証コードを取得

2. **ファイルの更新**
   - `apps/web/public/riot.txt`ファイルを開く
   - `YOUR_RIOT_VERIFICATION_CODE_HERE`を実際の検証コードに置き換える

3. **デプロイ**
   ```bash
   # ビルドとデプロイ
   pnpm build --filter=web
   git add apps/web/public/riot.txt
   git commit -m "Add Riot API verification file"
   git push
   ```

4. **確認**
   - デプロイ完了後、`https://sensilog-c0dce.web.app/riot.txt`にアクセス
   - 検証コードが正しく表示されることを確認

### ファイルの場所

- ソース: `apps/web/public/riot.txt`
- デプロイ後URL: `https://sensilog-c0dce.web.app/riot.txt`

### 注意事項

- `public`ディレクトリ内のファイルは自動的にルートパスに配信されます
- ファイル名は必ず`riot.txt`（小文字）にしてください
- 検証コードは改行や余分なスペースを含めないでください
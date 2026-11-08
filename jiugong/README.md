# 我的三地世界
- `rules.json`：规则和每次改动（只改这个）。`node jiugong/say.js '{"week":150,"role":"parent","title":"…","set":{"greed":true},"events":[{"type":"plague","world":"coast"}]}'` 追加一条。
- `bash jiugong/go.sh "说明"`：跑模拟（src/sim.js）→ 生成 `result.json` → 提交推送。
- `index.html` / `page.html`：固定的查看页，只读 `result.json`；改画面时才 `python3 jiugong/src/build.py`。
- Artifact：页面不变，只重新发布 `result.json`（Artifact 的 `files`）。

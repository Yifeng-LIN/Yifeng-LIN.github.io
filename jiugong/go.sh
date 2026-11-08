#!/bin/bash
# bash jiugong/go.sh "说明"  ->  跑模拟、提交、推送。之后只需把 result.json 发布到 Artifact。
cd "$(dirname "$0")/.." && node jiugong/run.js && git add jiugong && git commit -q -m "jiugong: ${1:-更新结果}

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TVjaZVPAeCxkMFC2dN7RE8" && for i in 2 4 8 16; do git push -q -u origin claude/ecstatic-faraday-e7tjvq 2>&1 | tail -1 && break || sleep $i; done; git log --oneline -1

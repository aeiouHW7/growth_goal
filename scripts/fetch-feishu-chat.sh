#!/bin/bash
# 从飞书复盘机器人拉取碎碎念
# 用法: bash scripts/fetch-feishu-chat.sh [条数]

COUNT=${1:-20}
lark-cli im +chat-messages-list \
  --chat-id oc_b139aa2e604688ec6566c812dbff09b9 \
  --as user \
  --page-size "$COUNT" \
  --order desc \
  | python3 -c "
import json,sys
data = json.load(sys.stdin)
for m in data['data']['messages']:
    ts = m['create_time'][:16]
    pos = m['message_position']
    sender = m['sender']['name']
    text = m.get('content','')[:120].replace('\n',' | ')
    print(f'[{ts}] #{pos} {sender}: {text}')
"

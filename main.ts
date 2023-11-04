import { Hono } from 'hono'

// アプリケーションの作成
const app = new Hono()

import { z } from 'zod'

const WebHookSchema = z.object({
  events: z.array(z.object({
    type: z.string(),
    replyToken: z.string()
  }))
})
app.post('/webhook', async c => {
  const data: z.infer<typeof WebHookSchema> = c.req.json() // WebHookデータ
  try {
    WebHookSchema.parse()
  } catch (_e) {
    return c.text('Invalid Request', 400)
  }

  const replys: Promise<Response>[] = []
  for (const event of data.events) {
    // イベントでループ
    if (event.type !== 'message') return // メッセージでないイベントは無視

    const { message, replyToken } = event

    if (message.type !== 'text') return // テキストメッセージでないイベントは無視

    const textMessage: string = message.text // ユーザーの発言を取得

    const replyData = {
      replyToken,
      messages: [{
        type: "text",
        text: `あなたはさっき、${textMessage}と言った！`
      }],
    } // リプライするデータを作成
    replys.push(fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + Deno.env.get("line_token"),
      },
      "body": JSON.stringify(replyData),
    })) // リプライ
  }
  await Promise.all(replys) // 全てのリプライ完了を待つ
})

// サーバーを起動
Deno.serve(app.fetch)
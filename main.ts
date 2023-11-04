import { Hono } from 'hono'

// アプリケーションの作成
const app = new Hono()

app.post('/webhook', async c => {
  const data = await c.req.json() // WebHookデータ
  console.log(data)
  const replys: Promise<any>[] = []
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
        "Authorization": "Bearer " + Deno.env.get("LINE_TOKEN"),
      },
      "body": JSON.stringify(replyData),
    }).then(res => res.json())) // リプライ
  }
  console.log(await Promise.all(replys)) // 全てのリプライ完了を待つ
  return c.text("OK!")
})

// サーバーを起動
Deno.serve(app.fetch)
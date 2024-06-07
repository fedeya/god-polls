import { app } from "../app";
import { createPollView } from "../features/create-poll-view";

app.command("/poll", async ({ command, ack, client, body }) => {
  await ack();

  console.log("start poll", command.text, command.channel_id, command.user_id, body.trigger_id)

  await client.views.open({
    trigger_id: body.trigger_id,
    view: createPollView({ initialChannel: command.channel_id })
  })
})


app.action("channel_select", async ({ ack, body, client }) => {
  await ack();

  console.log(body);
});

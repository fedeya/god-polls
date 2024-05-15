import { KnownBlock } from "@slack/bolt";
import { app } from "../app";
import { PollModel } from "../schemas";

const createOptionMessage = (option: number, label?: string | null) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${label}`
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Vote"
        },
        action_id: "vote",
        value: `option${option}`
      }
    },
    {
      type: "context",
      block_id: `option${option}-votes`,
      elements: [
        {
          type: "mrkdwn",
          text: "0 votes",
        }
      ]
      ,
    }] satisfies KnownBlock[]

}

app.view("view_1", async ({ ack, view, client }) => {
  await ack();

  const options = [
    ...createOptionMessage(1, view.state.values.option1.input.value),
    ...createOptionMessage(2, view.state.values.option2.input.value),
  ]

  if (view.state.values.option3.input.value) {
    options.push(...createOptionMessage(3, view.state.values.option3.input.value))
  }

  if (view.state.values.option4.input.value) {
    options.push(...createOptionMessage(4, view.state.values.option4.input.value))
  }

  const message = await client.chat.postMessage({
    channel: view.state.values.channel.input.selected_channel as string,
    text: "New Poll!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${view.state.values.question.input.value}*`
        },
      },
      {
        type: "divider"
      },
      ...options,
    ]
  })

  console.log("creating poll", view.state.values.question.input.value);

  await PollModel.create({
    messageId: message.ts,
    question: view.state.values.question.input.value,
    teamId: view.team_id,
    options: [
      {
        value: "option1",
        text: view.state.values.option1.input.value
      },
      {
        value: "option2",
        text: view.state.values.option2.input.value
      },
      {
        value: "option3",
        text: view.state.values.option3.input.value
      },
      {
        value: "option4",
        text: view.state.values.option4.input.value
      }
    ].filter(Boolean)
  })
});

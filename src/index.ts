import { App, KnownBlock } from '@slack/bolt'
import { readFile } from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import { PollModel, VoteModel } from './schemas';

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  port: +(process.env.PORT || 3000),
  customRoutes: [
    {

      path: "/public/*",
      method: "GET",
      handler: async (req, res) => {
        const filePath = path.resolve(__dirname, `.${req.url}`);

        console.log(filePath);


        try {
          const file = await readFile(filePath);

          res.write(file);

          res.end();
        } catch (error) {
          console.error(error);

          res.statusCode = 404;

          res.end();
        }
      }
    },
    {
      path: "/success",
      method: "GET",
      handler: async (_req, res) => {
        res.setHeader("Content-Type", "text/html");

        const html = await readFile(path.resolve(__dirname, "./index.html"), "utf-8");

        res.write(html);

        res.end();
      }
    }
  ],
  socketMode: true,
});



app.command("/poll", async ({ command, ack, client, respond, body }) => {
  await ack();

  client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "view_1",
      title: {
        type: "plain_text",
        text: "Create a poll"
      },
      blocks: [
        {
          type: "input",
          block_id: "question",
          label: {
            type: "plain_text",
            text: "Poll question"
          },
          element: {
            type: "plain_text_input",
            action_id: "input",
            focus_on_load: true,
            placeholder: {
              type: "plain_text",
              text: "Milanesa con pure o fideos?"
            }
          },
        },


        {
          type: "input",
          block_id: "option1",
          label: {
            type: "plain_text",
            text: "Option 1"
          },
          element: {
            type: "plain_text_input",
            action_id: "input",
            placeholder: {
              type: "plain_text",
              text: "con pure"
            }
          }
        },


        {
          type: "input",
          block_id: "option2",
          label: {
            type: "plain_text",
            text: "Option 2"
          },
          element: {
            type: "plain_text_input",
            action_id: "input",
            placeholder: {
              type: "plain_text",
              text: "con fideos"
            }
          },
        },


        {
          type: "input",
          block_id: "option3",
          label: {
            type: "plain_text",
            text: "Option 3 (optional)"
          },
          element: {
            type: "plain_text_input",
            action_id: "input",
            placeholder: {
              type: "plain_text",
              text: "con papas fritas"
            }
          },
          optional: true,
        },


        {
          type: "input",
          block_id: "option4",
          label: {
            type: "plain_text",
            text: "Option 4 (optional)"
          },
          element: {
            type: "plain_text_input",
            action_id: "input",
            placeholder: {
              type: "plain_text",
              text: "con ensalada :pinched_fingers:"
            }
          },
          optional: true
        },


        {
          "type": "section",
          "block_id": "channel",
          "text": {
            "type": "mrkdwn",
            "text": "Channel to post poll in:"
          },
          "accessory": {
            action_id: "input",
            type: "channels_select",
            initial_channel: command.channel_id,
            placeholder: {
              type: "plain_text",
              text: "Select an item"
            }
          }
        }
      ],
      submit: {
        type: "plain_text",
        text: "Start Poll :zap:"
      }
    },
  })
})


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


app.action("vote", async ({ ack, body, client, action }) => {
  await ack();

  if (action.type !== "button" || body.type !== "block_actions") return;

  let [poolVotes, userVote] = await Promise.all([
    VoteModel.find().where("messageId").equals(body.message?.ts as string).exec(),
    VoteModel.findOne({
      userId: body.user.id,
      messageId: body.message?.ts as string
    }).exec()
  ])



  if (userVote && userVote.optionValue !== action.value) {
    await VoteModel.updateMany({
      userId: body.user.id,
      messageId: body.message?.ts as string
    }, {
      optionValue: action.value as string
    })
  }

  if (!userVote) {
    await VoteModel.create({
      userId: body.user.id,
      optionValue: action.value as string,
      messageId: body.message?.ts as string
    })
  }

  poolVotes = await VoteModel.find().where("messageId").equals(body.message?.ts as string).exec()

  const maxSpaces = 24;

  const newBlocks = body.message?.blocks.map((block: any, _i: number, blocks: any[]) => {
    if (!block.accessory?.value) return block;

    const value = block.accessory?.value;

    // update votes percentage bar
    const optionVotes = poolVotes.filter(vote => vote.optionValue === value);

    const percentage = Math.round((optionVotes.length / poolVotes.length) * 100);

    const spaces = Math.round((percentage / 100) * maxSpaces);

    const spacesString = " ".repeat(spaces);

    block.fields = [
      {
        text: `\`${spacesString}${percentage}%\``,
        type: "mrkdwn"
      }
    ]

    // update votes counter
    const contextBlock = blocks.find(block =>
      block.block_id === `${value}-votes`
    );

    contextBlock.elements[0].text = `${optionVotes.length} votes`;

    return block;
  });

  client.chat.update({
    channel: body.channel?.id as string,
    ts: body.message?.ts as string,
    text: "New Poll!",
    blocks: newBlocks,
  })
});


async function main() {
  await mongoose.connect(process.env.DATABASE_URL as string)

  await app.start(process.env.PORT || 3000)

  console.log("⚡️ Bolt app is running!");

}

main();

import { App, KnownBlock } from '@slack/bolt'

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
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

  await client.chat.postMessage({
    channel: view.state.values.channel.input.selected_channel as string,
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
});


type Vote = {
  userId: string;
  option: string;
  poolId: string;
}

const votes: Vote[] = []

app.action("vote", async ({ ack, body, client, action }) => {
  await ack();

  if (action.type !== "button" || body.type !== "block_actions") return;


  let poolVotes = votes.filter(vote => vote.poolId === body.message?.ts);

  const userVote = poolVotes.find(vote => vote.userId === body.user.id);

  if (userVote && userVote.option !== action.value) {
    votes.splice(votes.indexOf(userVote), 1);

    votes.push({
      userId: body.user.id,
      option: action.value,
      poolId: body.message?.ts as string,
    })
  }

  if (!userVote) {
    votes.push({
      userId: body.user.id,
      option: action.value,
      poolId: body.message?.ts as string,
    })
  }

  poolVotes = votes.filter(vote => vote.poolId === body.message?.ts);


  const maxSpaces = 24;

  const newBlocks = body.message?.blocks.map((block: any, _i: number, blocks: any[]) => {
    if (!block.accessory?.value) return block;

    const value = block.accessory?.value;

    // update votes percentage bar
    const optionVotes = poolVotes.filter(vote => vote.option === value);

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
    blocks: newBlocks,
  })
});


async function main() {

  await app.start(3000)

  console.log("⚡️ Bolt app is running!");

}

main();

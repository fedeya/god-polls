import { app } from "../app";
import { VoteModel } from "../schemas";

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

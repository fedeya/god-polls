import type { KnownBlock } from '@slack/bolt';
import { app } from '../app';
import { PollModel, VoteModel } from '../schemas';

app.action('vote', async ({ ack, body, client, action }) => {
  await ack();

  if (action.type !== 'button' || body.type !== 'block_actions') return;

  let [poolVotes, userVote, poll] = await Promise.all([
    VoteModel.find()
      .where('messageId')
      .equals(body.message?.ts as string)
      .exec(),
    VoteModel.findOne({
      userId: body.user.id,
      messageId: body.message?.ts as string,
    }).exec(),

    PollModel.findOne({
      messageId: body.message?.ts as string,
    }).exec(),
  ]);

  const userProfile =
    poll?.pollMode === 'non-anonymous'
      ? await client.users.profile.get({
          user: body.user.id,
        })
      : null;

  if (userVote && userVote.optionValue !== action.value) {
    await VoteModel.updateOne(
      {
        userId: body.user.id,
        messageId: body.message?.ts as string,
      },
      {
        optionValue: action.value as string,
      }
    );
  }

  if (userVote && userVote.optionValue === action.value) {
    await VoteModel.deleteOne({
      userId: body.user.id,
      messageId: body.message?.ts as string,
    });
  }

  if (!userVote) {
    const userProfileData = userProfile
      ? {
          image: userProfile.profile?.image_72,
          name: userProfile.profile?.real_name,
        }
      : null;

    await VoteModel.create({
      userId: body.user.id,
      userProfile: userProfileData,
      optionValue: action.value as string,
      messageId: body.message?.ts as string,
    });
  }

  poolVotes = await VoteModel.find()
    .where('messageId')
    .equals(body.message?.ts as string)
    .exec();

  const maxSpaces = 24;

  const newBlocks = body.message?.blocks.map(
    (block: KnownBlock, _i: number, blocks: KnownBlock[]) => {
      if (block.type !== 'section') return block;

      if (!block.accessory) return block;

      if (block.accessory && !('value' in block.accessory)) return block;

      const value = block.accessory?.value;

      // update votes percentage bar
      const optionVotes = poolVotes.filter(
        (vote) => vote.optionValue === value
      );

      const percentage =
        Math.round((optionVotes.length / poolVotes.length) * 100) || 0;

      const spaces = Math.round((percentage / 100) * maxSpaces);

      const spacesString = ' '.repeat(spaces);

      block.fields = [
        {
          text: `\`${spacesString}${percentage}%\``,
          type: 'mrkdwn',
        },
      ];

      // update votes counter
      const contextBlock = blocks.find(
        (block) => block.block_id === `${value}-votes`
      );

      if (!contextBlock || contextBlock.type !== 'context') return block;

      if (poll?.pollMode === 'non-anonymous') {
        contextBlock.elements = contextBlock.elements.filter(
          (e) => e.type !== 'image'
        );

        for (const vote of optionVotes) {
          contextBlock.elements.unshift({
            type: 'image',
            image_url: vote.userProfile?.image as string,
            alt_text: vote.userProfile?.name as string,
          });
        }
      }

      const countElement = contextBlock.elements.at(-1);

      if (countElement?.type !== 'mrkdwn') return block;

      countElement.text = `${optionVotes.length} votes`;

      return block;
    }
  );

  await client.chat.update({
    channel: body.channel?.id as string,
    ts: body.message?.ts as string,
    text: 'New Poll!',
    blocks: newBlocks,
  });
});

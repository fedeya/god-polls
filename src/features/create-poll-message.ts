import type { KnownBlock } from '@slack/bolt';

const createOptionMessage = (option: number, label?: string | null) => {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${label}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Vote',
        },
        action_id: 'vote',
        value: `option${option}`,
      },
    },
    {
      type: 'context',
      block_id: `option${option}-votes`,
      elements: [
        {
          type: 'mrkdwn',
          text: '0 votes',
        },
      ],
    },
  ] satisfies KnownBlock[];
};

type CreatePollMessageArgs = {
  channelId: string;
  question: string;
  userId?: string;
  options: (string | null | undefined)[];
};

export const createPollMessage = (args: CreatePollMessageArgs) => {
  const optionBlocks = args.options
    .filter((option) => !!option)
    .flatMap((option, index) => createOptionMessage(index + 1, option));

  const byBlock = args.userId
    ? ([
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Poll created by <@${args.userId}>`,
            },
          ],
        },
      ] satisfies KnownBlock[])
    : [];

  return {
    channel: args.channelId,
    text: 'New Poll!',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${args.question}*`,
        },
      },
      {
        type: 'divider',
      },
      ...optionBlocks,
      ...byBlock,
    ],
  };
};

export type PollMessage = ReturnType<typeof createPollMessage>;

import { KnownBlock } from '@slack/bolt';

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
  options: (string | null | undefined)[];
};

export const createPollMessage = (args: CreatePollMessageArgs) => {
  const optionBlocks = args.options
    .filter((option) => !!option)
    .map((option, index) => createOptionMessage(index + 1, option))
    .flat();

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
    ],
  };
};

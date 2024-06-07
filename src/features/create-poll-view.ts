import type { View } from '@slack/bolt';

type CreatePollViewArgs = {
  initialChannel?: string;
};

export const createPollView = (args: CreatePollViewArgs): View => ({
  type: 'modal',
  callback_id: 'create-poll-view',
  title: {
    type: 'plain_text',
    text: 'Create a poll',
  },
  blocks: [
    {
      type: 'input',
      block_id: 'question',
      label: {
        type: 'plain_text',
        text: 'Poll question',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'input',
        focus_on_load: true,
        placeholder: {
          type: 'plain_text',
          text: 'Milanesa con pure o fideos?',
        },
      },
    },

    {
      type: 'input',
      block_id: 'option1',
      label: {
        type: 'plain_text',
        text: 'Option 1',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'input',
        placeholder: {
          type: 'plain_text',
          text: 'con pure',
        },
      },
    },

    {
      type: 'input',
      block_id: 'option2',
      label: {
        type: 'plain_text',
        text: 'Option 2',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'input',
        placeholder: {
          type: 'plain_text',
          text: 'con fideos',
        },
      },
    },

    {
      type: 'input',
      block_id: 'option3',
      label: {
        type: 'plain_text',
        text: 'Option 3 (optional)',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'input',
        placeholder: {
          type: 'plain_text',
          text: 'con papas fritas',
        },
      },
      optional: true,
    },

    {
      type: 'input',
      block_id: 'option4',
      label: {
        type: 'plain_text',
        text: 'Option 4 (optional)',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'input',
        placeholder: {
          type: 'plain_text',
          text: 'con ensalada :pinched_fingers:',
        },
      },
      optional: true,
    },

    {
      type: 'section',
      block_id: 'channel',
      text: {
        type: 'mrkdwn',
        text: 'Channel to post poll in:',
      },
      accessory: {
        action_id: 'channels_select',
        type: 'channels_select',
        initial_channel: args.initialChannel,
        placeholder: {
          type: 'plain_text',
          text: 'Select an item',
        },
      },
    },
  ],
  submit: {
    type: 'plain_text',
    text: 'Start Poll :zap:',
  },
});

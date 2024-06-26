import { app } from '../app';
import { createPollMessage } from '../features/create-poll-message';
import { PollModel } from '../schemas';
import { isSlackError } from '../utils/is-slack-error';

app.view('create-poll-view', async ({ ack, view, client, body }) => {
  await ack();

  const pollMode = view.state.values.poll_mode.input.selected_option?.value;

  const message = createPollMessage({
    userId: pollMode === 'non-anonymous' ? body.user.id : undefined,
    channelId: view.state.values.channel.channels_select
      .selected_channel as string,
    options: [
      view.state.values.option1.input.value,
      view.state.values.option2.input.value,
      view.state.values.option3.input.value,
      view.state.values.option4.input.value,
    ],
    question: view.state.values.question.input.value as string,
  });

  const messageResponse = await client.chat
    .postMessage(message)
    .catch(async (err) => {
      if (isSlackError(err) && err.data.error === 'not_in_channel') {
        await client.conversations.join({
          channel: view.state.values.channel.channels_select
            .selected_channel as string,
        });

        return await client.chat.postMessage(message);
      }

      throw err;
    });

  if (!messageResponse) {
    console.error('could not create poll message');
    return;
  }

  await PollModel.create({
    messageId: messageResponse.ts,
    question: view.state.values.question.input.value,
    teamId: view.team_id,
    createdBy: pollMode === 'non-anonymous' ? body.user.id : 'anonymous',
    pollMode,
    options: [
      {
        value: 'option1',
        text: view.state.values.option1.input.value,
      },
      {
        value: 'option2',
        text: view.state.values.option2.input.value,
      },
      {
        value: 'option3',
        text: view.state.values.option3.input.value,
      },
      {
        value: 'option4',
        text: view.state.values.option4.input.value,
      },
    ],
  });
});

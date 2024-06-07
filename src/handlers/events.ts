import { app } from '../app';

app.event('app_home_opened', async ({ event, client }) => {
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks: [
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Made with ❤️ by:* Federico Minaya',
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'The Goat',
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '<https://instagram.com/fede_minaya|@fede_minaya>',
            },
          ],
        },
      ],
    },
  });
});

import { App } from '@slack/bolt'
import { InstallationModel } from './schemas';
import { env } from './lib/env';

export const app = new App({
  token: env.TOKEN,
  signingSecret: env.SIGNING_SECRET,
  appToken: env.APP_TOKEN,
  botId: env.BOT_ID,
  port: env.PORT,
  clientId: env.CLIENT_ID,
  clientSecret: env.CLIENT_SECRET,
  scopes: ["commands", "im:read", "im:write", "chat:write", "channels:join", "app_mentions:read"],
  installerOptions: {
    installPath: "/slack/install",
    redirectUriPath: "/slack/oauth_redirect",
    port: env.PORT,
  },
  stateSecret: !env.TOKEN ? "my-secret" : undefined,
  installationStore: {
    async storeInstallation(installation) {

      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // handle storing org-wide app installation
        await InstallationModel.create({
          teamId: installation.enterprise.id,
          installation,
        })

        return;
      }
      if (installation.team !== undefined) {
        // single team app installation
        await InstallationModel.create({
          teamId: installation.team.id,
          installation,
        })

        return;
      }


      throw new Error('Failed saving installation data to installationStore');

    },

    async fetchInstallation(installQuery) {
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // handle org wide app installation lookup
        const data = await InstallationModel.findOne({ teamId: installQuery.enterpriseId })

        if (data) return data.installation
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        const data = await InstallationModel.findOne({ teamId: installQuery.teamId })

        if (data) return data.installation
      }

      throw new Error('Failed fetching installation');
    },

    async deleteInstallation(installQuery) {
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        await InstallationModel.deleteOne({ teamId: installQuery.enterpriseId });

        return;
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        await InstallationModel.deleteOne({ teamId: installQuery.teamId });

        return;
      }
      throw new Error('Failed to delete installation');
    },
  },
  socketMode: true,
});

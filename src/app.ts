import { App } from '@slack/bolt'
import { readFile } from 'fs/promises'
import path from 'path'

export const app = new App({
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

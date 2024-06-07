import mongoose from 'mongoose'
import { app } from './app';
import { env } from './lib/env';

import './commands';
import './views';
import './actions'
import './events'

async function main() {
  await mongoose.connect(env.DATABASE_URL);

  console.log("🚀 Database connected!");

  await app.start(env.PORT)

  console.log("⚡️ Bolt app is running!");
}

main();

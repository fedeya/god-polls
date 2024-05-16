import mongoose from 'mongoose'
import { app } from './app';

import './commands';
import './views';
import './actions'
import './events'

async function main() {
  await mongoose.connect(process.env.DATABASE_URL as string)

  await app.start(process.env.PORT || 3000)

  console.log("⚡️ Bolt app is running!");
}

main();

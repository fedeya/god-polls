import { Installation as SlackInstallation } from '@slack/bolt'
import { Schema, model } from 'mongoose';

interface Vote {
  userId: string;
  optionValue: string;
  messageId: string;
}

const VoteSchema = new Schema<Vote>({
  userId: String,
  optionValue: String,
  messageId: String
})

export const VoteModel = model<Vote>("Vote", VoteSchema)

interface Poll {
  question: string;
  messageId: string;
  options: Option[];
  teamId?: string;
}

interface Option {
  value: string;
  text: string;
}

const OptionSchema = new Schema<Option>({
  value: String,
  text: String
})

const PollSchema = new Schema<Poll>({
  question: String,
  messageId: String,
  teamId: String,
  options: [OptionSchema],
});

export const PollModel = model<Poll>("poll", PollSchema);

interface Installation {
  teamId: string;
  installation: SlackInstallation<"v1" | "v2", boolean>;
}

const InstallationSchema = new Schema<Installation>({
  teamId: String,
  installation: Object
});

export const InstallationModel = model<Installation>("Installation", InstallationSchema);

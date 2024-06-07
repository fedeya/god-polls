import { Installation as SlackInstallation } from '@slack/bolt';
import { Schema, model, InferSchemaType } from 'mongoose';

const VoteSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  optionValue: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
});

export type Vote = InferSchemaType<typeof VoteSchema>;

export const VoteModel = model<Vote>('Vote', VoteSchema);

const OptionSchema = new Schema({
  value: String,
  text: String,
});

export type Option = InferSchemaType<typeof OptionSchema>;

const PollSchema = new Schema({
  question: String,
  messageId: String,
  teamId: String,
  options: [OptionSchema],
});

export type Poll = InferSchemaType<typeof PollSchema>;

export const PollModel = model<Poll>('poll', PollSchema);

const InstallationSchema = new Schema({
  teamId: String,
  installation: Object,
});

export interface Installation
  extends InferSchemaType<typeof InstallationSchema> {
  installation: SlackInstallation<'v1' | 'v2', boolean>;
}

export const InstallationModel = model<Installation>(
  'Installation',
  InstallationSchema
);

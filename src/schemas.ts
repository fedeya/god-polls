import type { Installation as SlackInstallation } from '@slack/bolt';
import { type InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema({
  image: String,
  name: String,
});

const VoteSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  userProfile: userSchema,
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
  createdBy: String,
  options: [OptionSchema],
  pollMode: {
    type: String,
    enum: ['anonymous', 'non-anonymous'],
  },
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

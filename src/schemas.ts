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
  options: [OptionSchema],
});

export const PollModel = model<Poll>("poll", PollSchema);

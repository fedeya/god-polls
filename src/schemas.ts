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

interface Pool {
  question: string;
  messageId: string;
  options: string[];
}

const PoolSchema = new Schema<Pool>({
  question: String,
  messageId: String,
  options: [String],
});

export const PoolModel = model<Pool>("Pool", PoolSchema);

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

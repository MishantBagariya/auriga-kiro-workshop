import { Schema, model, type InferSchemaType } from 'mongoose';

export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: undefined },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // `ret` is typed loosely here because Mongoose infers a strict
      // schema-shaped type for the transform's second argument, which
      // does not include `_id`/`__v` as optional or `id` at all. This
      // transform is the one place those fields are added/removed.
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export type ProjectDoc = InferSchemaType<typeof projectSchema>;

export const Project = model('Project', projectSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    githubUserName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    avatarUrl: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"], // you can expand later
      default: "user",
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getUserByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
  },
});

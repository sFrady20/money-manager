import { relations } from "drizzle-orm/relations";
import { mmUsers, mmAccounts, mmAccountTokens, mmSessions } from "./schema";

export const mmAccountsRelations = relations(mmAccounts, ({ one }) => ({
  mmUser: one(mmUsers, {
    fields: [mmAccounts.userId],
    references: [mmUsers.id],
  }),
}));

export const mmUsersRelations = relations(mmUsers, ({ many }) => ({
  mmAccounts: many(mmAccounts),
  mmAccountTokens: many(mmAccountTokens),
  mmSessions: many(mmSessions),
}));

export const mmAccountTokensRelations = relations(
  mmAccountTokens,
  ({ one }) => ({
    mmUser: one(mmUsers, {
      fields: [mmAccountTokens.userId],
      references: [mmUsers.id],
    }),
  })
);

export const mmSessionsRelations = relations(mmSessions, ({ one }) => ({
  mmUser: one(mmUsers, {
    fields: [mmSessions.userId],
    references: [mmUsers.id],
  }),
}));

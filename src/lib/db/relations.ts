import { relations } from "drizzle-orm/relations";
import { mmUsers, mmAccounts, mmPlaidTokens, mmSessions } from "./schema";

export const mmAccountsRelations = relations(mmAccounts, ({ one }) => ({
  mmUser: one(mmUsers, {
    fields: [mmAccounts.userId],
    references: [mmUsers.id],
  }),
}));

export const mmUsersRelations = relations(mmUsers, ({ many }) => ({
  mmAccounts: many(mmAccounts),
  mmPlaidTokens: many(mmPlaidTokens),
  mmSessions: many(mmSessions),
}));

export const mmPlaidTokensRelations = relations(mmPlaidTokens, ({ one }) => ({
  mmUser: one(mmUsers, {
    fields: [mmPlaidTokens.userId],
    references: [mmUsers.id],
  }),
}));

export const mmSessionsRelations = relations(mmSessions, ({ one }) => ({
  mmUser: one(mmUsers, {
    fields: [mmSessions.userId],
    references: [mmUsers.id],
  }),
}));

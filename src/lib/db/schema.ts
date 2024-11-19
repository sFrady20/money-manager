import {
  pgTable,
  foreignKey,
  uuid,
  text,
  timestamp,
  pgSequence,
  pgEnum,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { AdapterAccountType } from "@auth/core/adapters";

export const poolInvitationStatus = pgEnum("pool_invitation_status", [
  "invited",
  "confirmed",
  "ignored",
  "rejected",
]);
export const sgrdAttendanceStatus = pgEnum("sgrd_attendance_status", [
  "attending",
  "not-attending",
]);
export const sgrdEventInvitePolicy = pgEnum("sgrd_event_invite_policy", [
  "anyone",
  "confirmed",
  "invited",
  "group",
  "organizers",
]);
export const sgrdEventPolicy = pgEnum("sgrd_event_policy", [
  "anyone",
  "confirmed",
  "invited",
  "group",
  "nobody",
]);
export const sgrdEventPrivacy = pgEnum("sgrd_event_privacy", [
  "public",
  "internal",
  "private",
]);
export const sgrdEventRole = pgEnum("sgrd_event_role", [
  "organizer",
  "staff",
  "participant",
  "spectator",
]);
export const sgrdEventStatus = pgEnum("sgrd_event_status", [
  "invited",
  "confirmed",
  "rejected",
  "banned",
]);
export const sgrdFollowReferenceType = pgEnum("sgrd_follow_reference_type", [
  "user",
  "group",
]);
export const sgrdGroupRole = pgEnum("sgrd_group_role", ["member", "manager"]);
export const sgrdGroupType = pgEnum("sgrd_group_type", ["team", "community"]);
export const sgrdInvitationRole = pgEnum("sgrd_invitation_role", [
  "organizer",
  "host",
  "staff",
  "participant",
  "spectator",
]);
export const sgrdInvitationStatus = pgEnum("sgrd_invitation_status", [
  "invited",
  "confirmed",
  "not-going",
  "requested",
  "rejected",
  "disinvited",
  "ignored",
  "uninvited",
]);
export const sgrdPrivacy = pgEnum("sgrd_privacy", [
  "public",
  "internal",
  "private",
]);

export const sgrdInvitationIdSeq = pgSequence("sgrd_invitation_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const sgrdNotificationIdSeq = pgSequence("sgrd_notification_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const sgrdAttendanceIdSeq = pgSequence("sgrd_attendance_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const poolInvitationIdSeq = pgSequence("pool_invitation_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const poolNotificationIdSeq = pgSequence("pool_notification_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const poolMemberIdSeq = pgSequence("pool_member_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const poolSourceIdSeq = pgSequence("pool_source_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrFollowIdSeq = pgSequence("wndr_follow_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrReactionIdSeq = pgSequence("wndr_reaction_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrAttachmentIdSeq = pgSequence("wndr_attachment_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrMessagesIdSeq = pgSequence("wndr_messages_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrNotificationsIdSeq = pgSequence("wndr_notifications_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const wndrBookmarkFoldersIdSeq = pgSequence(
  "wndr_bookmark_folders_id_seq",
  {
    startWith: "1",
    increment: "1",
    minValue: "1",
    maxValue: "2147483647",
    cache: "1",
    cycle: false,
  }
);
export const wndrBookmarksIdSeq = pgSequence("wndr_bookmarks_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const sgrdMembershipIdSeq = pgSequence("sgrd_membership_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});
export const sgrdDelegateIdSeq = pgSequence("sgrd_delegate_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "2147483647",
  cache: "1",
  cycle: false,
});

export const mmAccounts = pgTable(
  "mm_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => mmUsers.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const mmPlaidTokens = pgTable(
  "mm_plaid_tokens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token").notNull(),
    itemId: text("item_id").notNull(),
    institutionId: text("institution_id"),
    environment: text("environment").notNull().default("sandbox"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => {
    return {
      mmPlaidTokensUserIdMmUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [mmUsers.id],
        name: "mm_plaid_tokens_user_id_mm_users_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const mmVerificationTokens = pgTable(
  "mm_verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const mmUsers = pgTable("mm_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const mmSessions = pgTable("mm_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => mmUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

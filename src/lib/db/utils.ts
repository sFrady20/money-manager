import { pgTableCreator } from "drizzle-orm/pg-core";

const prefix = "mm_"; // mm for money-manager

export const pgTable = pgTableCreator((name) => `${prefix}${name}`);

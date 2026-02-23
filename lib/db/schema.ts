import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core"

export const sharedResults = pgTable("shared_results", {
  id: text("id").primaryKey(),
  won: boolean("won").notNull(),
  difficulty: text("difficulty").notNull(),
  time: integer("time").notNull(),
  round: integer("round").notNull(),
  rank: text("rank"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type SharedResult = typeof sharedResults.$inferSelect
export type NewSharedResult = typeof sharedResults.$inferInsert

// After any migration that adds tables, re-run db/grants.sql against Neon (see file for why).
import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, boolean, integer, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { crudPolicy, authenticatedRole, authUid } from 'drizzle-orm/neon';

const ownerId = () => text('user_id').notNull().default(sql`(auth.user_id())`);

export const combos = pgTable(
  'combos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull().default(''),
    layers: jsonb('layers').notNull().default({}),
    season: text('season').notNull().default('Spring/Summer'),
    highHeat: boolean('high_heat').notNull().default(false),
    vibe: text('vibe').notNull().default(''),
    secondaryVibe: text('secondary_vibe').notNull().default(''),
    favorite: boolean('favorite').notNull().default(false),
    rating: integer('rating').notNull().default(0),
    longevity: integer('longevity').notNull().default(0),
    projection: integer('projection').notNull().default(0),
    note: text('note').notNull().default(''),
    history: jsonb('history').notNull().default([]),
    photoKey: text('photo_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('combos_user_id_idx').on(table.userId),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    title: text('title').notNull().default(''),
    body: text('body').notNull().default(''),
    updatedOn: timestamp('updated_on', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('notes_user_id_idx').on(table.userId),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const wishlist = pgTable(
  'wishlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    category: text('category').notNull(),
    note: text('note').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('wishlist_user_category_uq').on(table.userId, table.category),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const scents = pgTable(
  'scents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    layers: jsonb('layers').notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('scents_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const layers = pgTable(
  'layers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    key: text('key').notNull(),
    label: text('label').notNull(),
    shortLabel: text('short_label').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('layers_user_key_uq').on(table.userId, table.key),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const vibes = pgTable(
  'vibes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    logic: text('logic').notNull().default(''),
    weight: text('weight').notNull().default(''),
    secretWord: text('secret_word').notNull().default(''),
    secretText: text('secret_text').notNull().default(''),
    bestFor: text('best_for').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('vibes_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

export const wishCategories = pgTable(
  'wish_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: ownerId(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('wish_categories_user_name_uq').on(table.userId, table.name),
    crudPolicy({ role: authenticatedRole, read: authUid(table.userId), modify: authUid(table.userId) }),
  ]
).enableRLS();

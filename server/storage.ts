import { type User, type InsertUser, type Subscriber, type InsertSubscriber, type ContactSubmission, type InsertContact, type PageView, type InsertPageView, type AnalyticsEvent, type InsertAnalyticsEvent, users, subscribers, contactSubmissions, pageViews, analyticsEvents } from "../shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte } from "drizzle-orm";

export interface AnalyticsSummary {
  totalPageViews: number;
  uniquePaths: number;
  totalSubscribers: number;
  totalContacts: number;
  recentPageViews: PageView[];
  topPages: { path: string; count: number }[];
  recentEvents: AnalyticsEvent[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSubscriber(id: string): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViews(limit?: number): Promise<PageView[]>;
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(limit?: number): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(): Promise<AnalyticsSummary>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSubscriber(id: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber || undefined;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber || undefined;
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  async createContactSubmission(insertContact: InsertContact): Promise<ContactSubmission> {
    const [contact] = await db
      .insert(contactSubmissions)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const [pageView] = await db
      .insert(pageViews)
      .values(insertPageView)
      .returning();
    return pageView;
  }

  async getPageViews(limit: number = 100): Promise<PageView[]> {
    return await db
      .select()
      .from(pageViews)
      .orderBy(desc(pageViews.timestamp))
      .limit(limit);
  }

  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [event] = await db
      .insert(analyticsEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getAnalyticsEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
    return await db
      .select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(limit);
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const allPageViews = await db.select().from(pageViews);
    const allSubscribers = await db.select().from(subscribers);
    const allContacts = await db.select().from(contactSubmissions);
    const recentPageViews = await this.getPageViews(10);
    const recentEvents = await this.getAnalyticsEvents(10);

    const pathCounts = allPageViews.reduce((acc, pv) => {
      acc[pv.path] = (acc[pv.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const uniquePaths = Object.keys(pathCounts).length;

    return {
      totalPageViews: allPageViews.length,
      uniquePaths,
      totalSubscribers: allSubscribers.length,
      totalContacts: allContacts.length,
      recentPageViews,
      topPages,
      recentEvents,
    };
  }
}

// Application status lives in a column the founder adds by running
// supabase-status.sql once. Raw SQL keeps these two helpers independent of
// the drizzle schema, so every other query keeps working before the column
// exists — reads return null and writes throw a recognizable error instead.
export async function getContactStatuses(): Promise<Record<string, string> | null> {
  try {
    const result = await db.execute(sql`select id, status from contact_submissions`);
    const rows = result.rows as { id: string; status: string | null }[];
    return Object.fromEntries(rows.map((r) => [r.id, r.status ?? "new"]));
  } catch {
    return null; // column not created yet
  }
}

export async function setContactStatus(id: string, status: string): Promise<void> {
  await db.execute(sql`update contact_submissions set status = ${status} where id = ${id}`);
}

export const storage = new DatabaseStorage();

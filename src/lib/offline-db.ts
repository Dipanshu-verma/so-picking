import Dexie, { type Table } from "dexie";
import type { CachedSOList, CachedSODetails, CachedSKUMaster } from "@/types/sheets";
import type { PickingProgress } from "@/types/picking";
import type { ErrorQueueItem, SyncQueueItem } from "@/types/errors";

// ─────────────────────────────────────────────
// Database Schema
// ─────────────────────────────────────────────
export class SOPickingDatabase extends Dexie {
  // Tables
  soList!: Table<CachedSOList, string>;
  soDetails!: Table<CachedSODetails, string>;
  skuMaster!: Table<CachedSKUMaster, string>;
  pickingProgress!: Table<PickingProgress, string>;
  errorQueue!: Table<ErrorQueueItem, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("SOPickingApp");

    this.version(1).stores({
      // Key → Index definitions
      soList: "id, cachedAt",
      soDetails: "id, soId, cachedAt",
      skuMaster: "id, cachedAt",
      pickingProgress: "id, soId, lastUpdatedAt",
      errorQueue: "id, soId, syncStatus, createdAt",
      syncQueue: "id, type, syncStatus, createdAt, syncId",
    });
  }
}

// Singleton instance
let db: SOPickingDatabase | null = null;

export function getDB(): SOPickingDatabase {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is not available on the server");
  }
  if (!db) {
    db = new SOPickingDatabase();
  }
  return db;
}

// ─────────────────────────────────────────────
// SO List Operations
// ─────────────────────────────────────────────
export const soListDB = {
  async get() {
    const db = getDB();
    return db.soList.get("so_list");
  },

  async set(data: CachedSOList["data"]) {
    const db = getDB();
    await db.soList.put({
      id: "so_list",
      data,
      cachedAt: Date.now(),
    });
  },

  async clear() {
    const db = getDB();
    await db.soList.delete("so_list");
  },
};

// ─────────────────────────────────────────────
// SO Details Operations
// ─────────────────────────────────────────────
export const soDetailsDB = {
  async get(soId: string) {
    const db = getDB();
    return db.soDetails.get(soId);
  },

  async set(soId: string, data: CachedSODetails["data"]) {
    const db = getDB();
    await db.soDetails.put({
      id: soId,
      soId,
      data,
      cachedAt: Date.now(),
    });
  },

  async clear(soId: string) {
    const db = getDB();
    await db.soDetails.delete(soId);
  },
};

// ─────────────────────────────────────────────
// SKU Master Operations
// ─────────────────────────────────────────────
export const skuMasterDB = {
  async get() {
    const db = getDB();
    return db.skuMaster.get("sku_master");
  },

  async set(data: CachedSKUMaster["data"]) {
    const db = getDB();
    await db.skuMaster.put({
      id: "sku_master",
      data,
      cachedAt: Date.now(),
    });
  },
};

// ─────────────────────────────────────────────
// Picking Progress Operations
// ─────────────────────────────────────────────
export const pickingProgressDB = {
  async get(soId: string) {
    const db = getDB();
    return db.pickingProgress.get(soId);
  },

  async save(progress: PickingProgress) {
    const db = getDB();
    await db.pickingProgress.put({
      ...progress,
      lastUpdatedAt: Date.now(),
    });
  },

  async clear(soId: string) {
    const db = getDB();
    await db.pickingProgress.delete(soId);
  },
};

// ─────────────────────────────────────────────
// Error Queue Operations
// ─────────────────────────────────────────────
export const errorQueueDB = {
  async getBySOId(soId: string) {
    const db = getDB();
    return db.errorQueue.where("soId").equals(soId).toArray();
  },

  async add(item: ErrorQueueItem) {
    const db = getDB();
    await db.errorQueue.put(item);
  },

  async updateSyncStatus(id: string, status: ErrorQueueItem["syncStatus"]) {
    const db = getDB();
    await db.errorQueue.update(id, {
      syncStatus: status,
      lastAttemptAt: Date.now(),
    });
  },

  async getPending() {
    const db = getDB();
    return db.errorQueue.where("syncStatus").equals("PENDING").toArray();
  },

  async clearForSO(soId: string) {
    const db = getDB();
    await db.errorQueue.where("soId").equals(soId).delete();
  },
};

// ─────────────────────────────────────────────
// Sync Queue Operations
// ─────────────────────────────────────────────
export const syncQueueDB = {
  async add(item: SyncQueueItem) {
    const db = getDB();
    await db.syncQueue.put(item);
  },

  async getPending() {
    const db = getDB();
    return db.syncQueue.where("syncStatus").equals("PENDING").toArray();
  },

  async getById(id: string) {
    const db = getDB();
    return db.syncQueue.get(id);
  },

  async updateStatus(
    id: string,
    status: SyncQueueItem["syncStatus"],
    retryCount?: number
  ) {
    const db = getDB();
    const updates: Partial<SyncQueueItem> = {
      syncStatus: status,
      lastAttemptAt: Date.now(),
    };
    if (retryCount !== undefined) {
      updates.retryCount = retryCount;
    }
    await db.syncQueue.update(id, updates);
  },

  async existsBySyncId(syncId: string) {
    const db = getDB();
    const count = await db.syncQueue
      .where("syncId")
      .equals(syncId)
      .and((item) => item.syncStatus === "SUCCESS")
      .count();
    return count > 0;
  },

  async clearCompleted() {
    const db = getDB();
    await db.syncQueue.where("syncStatus").equals("SUCCESS").delete();
  },
};
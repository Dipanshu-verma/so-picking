import { SyncStatus, SOStatus } from "@/constants";
import { syncQueueDB, errorQueueDB } from "@/lib/offline-db";
import { updateSOStatus, submitErrors, checkSyncIdExists, recordSyncId } from "@/lib/google-sheets";
import { SyncOperationType } from "@/types/errors";
import type { SyncQueueItem, UpdateSOStatusPayload, SubmitErrorsPayload } from "@/types/errors";
// ─────────────────────────────────────────────
// Process a single sync queue item
// ─────────────────────────────────────────────
async function processSyncItem(item: SyncQueueItem): Promise<void> {
  // Idempotency check: has this syncId already been processed?
  const alreadyProcessed = await checkSyncIdExists(item.syncId);
  if (alreadyProcessed) {
    console.log(`[SyncManager] SyncId ${item.syncId} already processed. Skipping.`);
    await syncQueueDB.updateStatus(item.id, SyncStatus.SUCCESS);
    return;
  }

  const payload = item.payload;

  switch (payload.type) {
    case SyncOperationType.UPDATE_SO_STATUS: {
      const p = payload as UpdateSOStatusPayload;
      await updateSOStatus(p.rowIndex, p.status as SOStatus);
      break;
    }

    case SyncOperationType.SUBMIT_ERRORS: {
      const p = payload as SubmitErrorsPayload;
      await submitErrors(p.errors);
      break;
    }

    default:
      throw new Error(`Unknown sync operation type: ${(payload as { type: string }).type}`);
  }

  // Record syncId to prevent future duplicates
  await recordSyncId(item.syncId);
  await syncQueueDB.updateStatus(item.id, SyncStatus.SUCCESS);
}

// ─────────────────────────────────────────────
// Process all pending sync queue items
// ─────────────────────────────────────────────
export async function processSyncQueue(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const pendingItems = await syncQueueDB.getPending();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of pendingItems) {
    // Skip if max retries exceeded
    if (item.retryCount >= 3) {
      await syncQueueDB.updateStatus(item.id, SyncStatus.FAILED);
      failed++;
      errors.push(`Item ${item.id} exceeded max retries`);
      continue;
    }

    try {
      await syncQueueDB.updateStatus(item.id, SyncStatus.IN_PROGRESS, item.retryCount);
      await processSyncItem(item);
      success++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[SyncManager] Failed to process item ${item.id}:`, message);

      await syncQueueDB.updateStatus(
        item.id,
        SyncStatus.PENDING, // Reset to PENDING for retry
        item.retryCount + 1
      );

      failed++;
      errors.push(message);
    }
  }

  return { success, failed, errors };
}

// ─────────────────────────────────────────────
// Check if there are pending sync items
// ─────────────────────────────────────────────
export async function hasPendingSync(): Promise<boolean> {
  const pending = await syncQueueDB.getPending();
  return pending.length > 0;
}

// ─────────────────────────────────────────────
// Get sync queue summary
// ─────────────────────────────────────────────
export async function getSyncSummary() {
  const pending = await syncQueueDB.getPending();
  const pendingErrors = await errorQueueDB.getPending();

  return {
    pendingSyncItems: pending.length,
    pendingErrors: pendingErrors.length,
    hasAnythingPending: pending.length > 0 || pendingErrors.length > 0,
  };
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/picking/ProgressBar";
import { ProgressIndicator } from "@/components/picking/ProgressIndicator";
import { PalletScanner } from "@/components/picking/PalletScanner";
import { SKUScreen } from "@/components/picking/SKUScreen";
import { ErrorModal } from "@/components/errors/ErrorModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePickingStore } from "@/store/picking-store";
import { usePickingFlow } from "@/hooks/usePickingFlow";
import { PickingStep } from "@/constants";

export default function PickingPage() {
  const params = useParams();
  const router = useRouter();
  const soId = decodeURIComponent(params.soId as string);

  const activeSO = usePickingStore((s) => s.activeSO);
  const [exitDialogVisible, setExitDialogVisible] = useState(false);

const [hasHydrated, setHasHydrated] = useState(false);

useEffect(() => {
  // Wait for Zustand persist to rehydrate from localStorage
  // before checking activeSO — otherwise we redirect too early
  const unsubscribe = usePickingStore.persist.onFinishHydration(() => {
    setHasHydrated(true);
  });

  // If already hydrated (e.g. navigated normally), set immediately
  if (usePickingStore.persist.hasHydrated()) {
    setHasHydrated(true);
  }

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!hasHydrated) return; // Don't redirect until hydration is confirmed
  if (!activeSO) {
    router.replace(`/so/${encodeURIComponent(soId)}`);
  }
}, [hasHydrated, activeSO, soId, router]);

  const {
    currentLocation,
    currentStep,
    isAllDone,
    palletMismatchVisible,
    handlePalletScan,
    handlePalletMismatchRetry,
    handlePalletMismatchError,
    scannedSKU,
    isSKUValid,
    handleSKUScan,
    handlePicked,
    errorModalVisible,
    errorPreselected,
    handleOpenError,
    handleErrorSubmit,
    handleErrorModalClose,
    stats,
  } = usePickingFlow();

  // Don't render anything while redirect is happening
if (!hasHydrated || !activeSO) return null;

  const handleBack = () => {
    // If all done, just go back — no data loss risk
    if (isAllDone) {
      router.push(`/so/${encodeURIComponent(soId)}`);
      return;
    }
    // Otherwise confirm — progress is saved but warn user
    setExitDialogVisible(true);
  };

  const handleConfirmExit = () => {
    setExitDialogVisible(false);
    router.push(`/so/${encodeURIComponent(soId)}`);
  };

  return (
    <div className="min-h-screen bg-warehouse-bg">
      

      <Header
        title={`Picking · ${soId}`}
        showBack
        onBack={handleBack}
        rightSlot={
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>
              {stats.completed + stats.errors}/{stats.total}
            </span>
          </div>
        }
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-10">
        {/* Progress */}
        <div className="mt-4 mb-6 space-y-3">
          <ProgressBar percent={stats.progressPercent} />
          <ProgressIndicator
            completed={stats.completed + stats.errors}
            total={stats.total}
            errors={stats.errors}
          />
        </div>

        {/* ── ALL DONE screen ─────────────────────────────────── */}
        {isAllDone && (
          <div className="flex flex-col items-center py-10 gap-5 text-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center
                          ${stats.errors > 0 ? "bg-orange-100" : "bg-green-100"}`}
            >
              {stats.errors > 0 ? (
                <AlertCircle
                  className="w-12 h-12 text-orange-500"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2
                  className="w-12 h-12 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {stats.errors > 0 ? "Picking Complete" : "All Picked! 🎉"}
              </h2>
              <p className="text-gray-500 mt-2 text-base">
                {stats.completed} location
                {stats.completed !== 1 ? "s" : ""} picked
                {stats.errors > 0 && `, ${stats.errors} with errors`}.
              </p>
            </div>

            {/* Submit — fully wired in Phase 6 */}
            <button
              onClick={() =>
                router.push(`/so/${encodeURIComponent(soId)}/submit`)
              }
              className="warehouse-button-primary w-full max-w-sm
                         flex items-center justify-center gap-2"
              aria-label="Submit picking results to Google Sheets"
            >
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              Submit to Google Sheets
            </button>

            <button
              onClick={() =>
                router.push(`/so/${encodeURIComponent(soId)}`)
              }
              className="warehouse-button-secondary w-full max-w-sm"
            >
              Back to SO Detail
            </button>
          </div>
        )}

        {/* ── PALLET SCAN step ─────────────────────────────────── */}
        {!isAllDone &&
          currentStep === PickingStep.PALLET_SCAN &&
          currentLocation && (
            <PalletScanner
              location={currentLocation}
              locationIndex={activeSO.currentLocationIndex}
              totalLocations={activeSO.totalLocations}
              onScan={handlePalletScan}
            />
          )}

        {/* ── SKU SCREEN step ──────────────────────────────────── */}
        {!isAllDone &&
          currentStep === PickingStep.SKU_SCREEN &&
          currentLocation && (
            <SKUScreen
              location={currentLocation}
              locationIndex={activeSO.currentLocationIndex}
              totalLocations={activeSO.totalLocations}
              scanSkuRequired={activeSO.scanSku}
              scannedSKU={scannedSKU}
              isSKUValid={isSKUValid}
              onSKUScan={handleSKUScan}
              onPicked={handlePicked}
              onError={handleOpenError}
            />
          )}
      </main>

      {/* ── Pallet Mismatch popup ──────────────────────────────── */}
      {palletMismatchVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     bg-black/50 backdrop-blur-sm px-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Pallet mismatch"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pallet Mismatch
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Scanned barcode does not match the expected pallet. What
                  would you like to do?
                </p>
              </div>
              <div className="w-full grid grid-cols-2 gap-3 mt-2">
                {/* Retry focused by default — per PRD */}
                <button
                  autoFocus
                  onClick={handlePalletMismatchRetry}
                  className="warehouse-button-primary"
                  aria-label="Retry scanning pallet"
                >
                  Retry
                </button>
                <button
                  onClick={handlePalletMismatchError}
                  className="warehouse-button-danger"
                  aria-label="Report as error"
                >
                  Error
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Modal ───────────────────────────────────────── */}
      <ErrorModal
        isOpen={errorModalVisible}
        location={currentLocation?.location ?? ""}
        preSelected={errorPreselected}
        onSubmit={handleErrorSubmit}
        onClose={handleErrorModalClose}
      />

      {/* ── Exit confirm ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={exitDialogVisible}
        title="Leave Picking?"
        message="Your progress is saved locally. You can resume picking from where you left off."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="warning"
        onConfirm={handleConfirmExit}
        onCancel={() => setExitDialogVisible(false)}
      />
    </div>
  );
}
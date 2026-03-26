"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, ClipboardList, Trophy } from "lucide-react";
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
  const unsubscribe = usePickingStore.persist.onFinishHydration(() => {
    setHasHydrated(true);
  });

  if (usePickingStore.persist.hasHydrated()) {
    setHasHydrated(true);
  }

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!hasHydrated) return;
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
    flashType,
    stats,
  } = usePickingFlow();

if (!hasHydrated || !activeSO) return null;

  const handleBack = () => {
    if (isAllDone) {
      router.push(`/so/${encodeURIComponent(soId)}`);
      return;
    }
    setExitDialogVisible(true);
  };

  const handleConfirmExit = () => {
    setExitDialogVisible(false);
    router.push(`/so/${encodeURIComponent(soId)}`);
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#f1f5f9" }}>
{/* ── Full screen flash overlay ─────────────────────────── */}
{flashType && (
  <div
    className="fixed inset-0 z-[100] pointer-events-none animate-fade-in"
    style={{
      backgroundColor:
        flashType === "success"
          ? "rgba(34, 197, 94, 0.25)"
          : "rgba(239, 68, 68, 0.25)",
    }}
    aria-hidden="true"
  />
)}
      <Header
        title={`Picking · ${soId}`}
        showBack
        onBack={handleBack}
        rightSlot={
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
                       text-blue-700 border border-blue-200"
            style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums">
              {stats.completed + stats.errors}/{stats.total}
            </span>
          </div>
        }
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-10">

        {/* ── Progress ─────────────────────────────────────────── */}
        <div
          className="mt-4 mb-6 p-4 rounded-2xl space-y-3"
          style={{
            background: "#fff",
            border: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <ProgressBar percent={stats.progressPercent} />
          <ProgressIndicator
            completed={stats.completed + stats.errors}
            total={stats.total}
            errors={stats.errors}
          />
        </div>

        {/* ── ALL DONE screen ─────────────────────────────────── */}
        {isAllDone && (
          <div className="flex flex-col items-center py-8 gap-6 text-center fade-in">
            <div
              className={`w-28 h-28 rounded-3xl flex items-center justify-center bounce-in`}
              style={{
                background: stats.errors > 0
                  ? "linear-gradient(135deg, #fff7ed, #fed7aa)"
                  : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                boxShadow: stats.errors > 0
                  ? "0 8px 32px rgba(249,115,22,0.2)"
                  : "0 8px 32px rgba(22,163,74,0.2)",
              }}
            >
              {stats.errors > 0 ? (
                <AlertCircle className="w-14 h-14 text-orange-500" aria-hidden="true" />
              ) : (
                <Trophy className="w-14 h-14 text-green-500" aria-hidden="true" />
              )}
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.errors > 0 ? "Picking Complete" : "All Picked! 🎉"}
              </h2>
              <p className="text-slate-500 mt-2 text-base leading-relaxed">
                <span className="font-bold text-slate-700">{stats.completed}</span> location
                {stats.completed !== 1 ? "s" : ""} picked
                {stats.errors > 0 && (
                  <>, <span className="font-bold text-orange-600">{stats.errors}</span> with errors</>
                )}.
              </p>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap justify-center">
              <span className="badge badge-success px-4 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {stats.completed} Picked
              </span>
              {stats.errors > 0 && (
                <span className="badge badge-error px-4 py-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {stats.errors} Error{stats.errors !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={() => router.push(`/so/${encodeURIComponent(soId)}/submit`)}
                className="warehouse-button warehouse-button-primary w-full
                           flex items-center justify-center gap-2"
                aria-label="Submit picking results to Google Sheets"
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                Submit to Google Sheets
              </button>

              <button
                onClick={() => router.push(`/so/${encodeURIComponent(soId)}`)}
                className="warehouse-button warehouse-button-secondary w-full"
              >
                Back to SO Detail
              </button>
            </div>
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

      {/* ── Pallet Mismatch Dialog ──────────────────────────────── */}
      {palletMismatchVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Pallet mismatch"
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden bounce-in"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
          >
            <div
              className="px-6 py-5"
              style={{
                background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                borderBottom: "1px solid #fecdd3",
              }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 3px 10px rgba(220,38,38,0.35)",
                  }}
                >
                  <AlertCircle className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pallet Mismatch</h2>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    Scanned barcode does not match the expected pallet. What would you like to do?
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              <button
                autoFocus
                onClick={handlePalletMismatchRetry}
                className="warehouse-button warehouse-button-primary"
                aria-label="Retry scanning pallet"
              >
                Retry
              </button>
              <button
                onClick={handlePalletMismatchError}
                className="warehouse-button warehouse-button-danger"
                aria-label="Report as error"
              >
                Error
              </button>
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
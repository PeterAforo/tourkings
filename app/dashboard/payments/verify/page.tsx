"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { csrfFetch } from "@/lib/fetch-csrf";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const POLL_MS = 2500;
const MAX_POLLS = 36;

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [note, setNote] = useState<string | null>(null);
  const paymentId = searchParams.get("paymentId");
  const transactionId = searchParams.get("transaction_id");
  const pollCount = useRef(0);

  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      setNote("Missing payment reference. Return to your wallet and try again.");
      return;
    }

    let cancelled = false;

    const verifyOnce = async () => {
      const q = transactionId ? `?transaction_id=${encodeURIComponent(transactionId)}` : "";
      const res = await csrfFetch(`/api/payments/${paymentId}/verify${q}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));

      if (cancelled) return;

      if (res.status === 401) {
        setStatus("failed");
        setNote("Please sign in to verify this payment.");
        return;
      }

      if (!res.ok) {
        setStatus("failed");
        setNote(typeof data.error === "string" ? data.error : "Verification request failed.");
        return;
      }

      if (data.status === "SUCCESS") {
        setStatus("success");
        return;
      }

      if (data.status === "FAILED" || data.status === "REFUNDED") {
        setStatus("failed");
        setNote(
          data.status === "REFUNDED"
            ? "This payment was refunded."
            : "The payment could not be completed."
        );
        return;
      }

      if (typeof data.message === "string" && data.pending) {
        setNote(data.message);
      }

      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) {
        setStatus("failed");
        setNote(
          "We could not confirm the payment in time. If money left your account, contact support with your reference; you can also refresh this page."
        );
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) void verifyOnce();
      }, POLL_MS);
    };

    void verifyOnce();

    return () => {
      cancelled = true;
    };
  }, [paymentId, transactionId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-12 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Verifying Payment</h2>
            <p className="text-on-surface-variant">
              {note || "Confirming with your bank and TourKings…"}
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Payment Successful!</h2>
            <p className="text-on-surface-variant mb-8">Your payment has been processed successfully.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="primary" onClick={() => router.push("/dashboard/wallet")}>View Wallet</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/bookings")}>My Bookings</Button>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Could Not Verify</h2>
            <p className="text-on-surface-variant mb-8">{note || "Something went wrong. Please try again from your wallet."}</p>
            <Button variant="primary" onClick={() => router.push("/dashboard/wallet")}>Back to Wallet</Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

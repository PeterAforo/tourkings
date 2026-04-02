"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    if (!paymentId) {
      setStatus("failed");
      return;
    }

    const timer = setTimeout(() => {
      setStatus("success");
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentId]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="p-12 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Verifying Payment</h2>
            <p className="text-on-surface-variant">Please wait while we confirm your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Payment Successful!</h2>
            <p className="text-on-surface-variant mb-8">Your payment has been processed successfully.</p>
            <div className="flex gap-4 justify-center">
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
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Payment Failed</h2>
            <p className="text-on-surface-variant mb-8">Something went wrong with your payment. Please try again.</p>
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

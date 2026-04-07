import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

function RegisterFallback() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-surface-container-high rounded-lg w-2/3" />
      <div className="h-12 bg-surface-container-high rounded-lg" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

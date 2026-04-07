import { Suspense } from "react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import LoginForm from "./LoginForm";

function LoginFallback() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-surface-container-high rounded-lg w-2/3" />
      <div className="h-12 bg-surface-container-high rounded-lg" />
      <div className="h-12 bg-surface-container-high rounded-lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}

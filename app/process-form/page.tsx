"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageLayout } from "@/components/common/Layout/PageLayout";
import { LoadingSpinner } from "@/components/common/Feedback/LoadingSpinner";

function ProcessFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      const authType = searchParams.get("authType");

      // Check if backend JWT token is available
      if (!(session as any).backendToken) {
        console.warn('No backend JWT token found in session');
        router.replace('/login?error=no_backend_token');
        return;
      }

      console.log('Backend JWT token available, processing authentication');

      if (authType === "new") {
        router.replace("/new-user");
      } else {
        router.replace("/dashboard");
      }
    } else if (status === 'unauthenticated') {
        router.replace('/login');
    }
  }, [router, searchParams, session, status]);

  return <LoadingSpinner text="Processing your login..." size="lg" />;
}

function ProcessFormFallback() {
  return <LoadingSpinner text="Processing your login..." size="lg" />;
}

export default function ProcessForm() {
  return (
    <PageLayout>
        <Suspense fallback={<ProcessFormFallback />}>
            <ProcessFormContent />
        </Suspense>
    </PageLayout>
  );
} 
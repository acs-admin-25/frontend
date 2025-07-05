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

      // Extract session_id from NextAuth session
      if ((session as any).sessionId) {
        const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
        const cookieString = `session_id=${(session as any).sessionId}; path=/; samesite=lax${secure}`;
        document.cookie = cookieString;
        console.log('Set session_id cookie from NextAuth session:', (session as any).sessionId);
      } else {
        console.warn('No session_id found in NextAuth session');
      }

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
import AuthLayout from '@/components/common/Layout/AuthLayout';
import React from 'react';

export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
} 
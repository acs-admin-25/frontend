"use client"

import { Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { PageLayout } from "@/components/common/Layout/PageLayout"
import { applyTheme, getCurrentTheme } from "@/lib/theme/simple-theme"
import { PRIVACY_CONTENT } from "./constants/content"

export default function PrivacyPage() {
  useEffect(() => {
    applyTheme(getCurrentTheme());
  }, []);

  return (
    <>
      {/* Top Row: Back Button & Logo */}
      <div className="w-full max-w-5xl md:max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 pt-6 pb-0">
        <Link 
          href="/legal"
          className="inline-flex items-center gap-2 text-[#0e6537] hover:text-[#0a5a2f] transition-colors text-base sm:text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Legal</span>
        </Link>
        <Link href="/">
          <img src="/favicon.ico" alt="ACS Logo" className="w-16 h-16 object-contain cursor-pointer" />
        </Link>
      </div>
      <div className="w-full max-w-5xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {/* Top Bar/Header - matches legal/terms */}
        <div className="bg-[#0e6537] rounded-lg shadow-2xl border border-[#0e6537]/20 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-white" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">{PRIVACY_CONTENT.header.title}</h1>
          </div>
          <p className="text-white/80 text-sm sm:text-base">{PRIVACY_CONTENT.header.subtitle}</p>
        </div>
        {/* Main Content */}
        <div className="bg-[var(--card)] rounded-lg shadow-sm border border-gray-300 p-4 sm:p-6 w-full max-w-5xl md:max-w-7xl mx-auto">
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">{PRIVACY_CONTENT.sections.informationWeCollect.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.informationWeCollect.intro}
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.informationWeCollect.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">{PRIVACY_CONTENT.sections.howWeUseInformation.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.howWeUseInformation.intro}
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.howWeUseInformation.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">{PRIVACY_CONTENT.sections.dataSecurity.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.dataSecurity.content}
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-[var(--foreground)]">{PRIVACY_CONTENT.sections.yourRights.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.yourRights.intro}
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 text-sm sm:text-base">
                {PRIVACY_CONTENT.sections.yourRights.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
        <div className="mt-6 text-center text-xs sm:text-sm text-[var(--text-muted)] w-full max-w-5xl md:max-w-7xl mx-auto">
          {PRIVACY_CONTENT.footer.lastUpdated} {new Date().toLocaleDateString()}
        </div>
        <div className="mb-4 text-center text-xs text-gray-400 w-full max-w-5xl md:max-w-7xl mx-auto">
          {PRIVACY_CONTENT.footer.copyright}
        </div>
      </div>
    </>
  )
}
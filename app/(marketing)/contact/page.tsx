"use client";

import React from "react";
import { motion } from "framer-motion";
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from "./constants";
import { GetInTouchSection, SendMessageSection, FAQSection, CTASection, HeaderSection } from "./components";

export default function ContactPage() {
  const containerVariants = CONTAINER_VARIANTS;
  const itemVariants = ITEM_VARIANTS;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-accent via-accent/50 to-background">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle gradient circles */}
        <div className="absolute -top-[15%] -right-[15%] h-[50%] w-[50%] rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-[60%] -left-[10%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] right-[20%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(var(--secondary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        className="container relative mx-auto px-4 py-8 sm:py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <HeaderSection variants={itemVariants} />
        <div className="mx-auto max-w-6xl">
          {/* Contact Form and Information */}
          <div className="grid gap-4 sm:gap-8 md:grid-cols-12">
            {/* Contact Information */}
            <GetInTouchSection variants={itemVariants} />
            {/* Contact Form */}
            <SendMessageSection variants={itemVariants} />
          </div>
          {/* FAQ Section */}
          <FAQSection variants={itemVariants} />
        </div>
      </motion.div>
    </div>
  );
}


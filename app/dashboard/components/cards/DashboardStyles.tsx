"use client";
import React from 'react';

  // this is dead code


const dashboardStyles = `
    /* Icon Animation */
    @keyframes icon-slide-scale {
      0% { transform: scale(1) translateX(0); color: #166534; }
      60% { transform: scale(1.18) translateX(8px); color: #22c55e; }
      100% { transform: scale(1.12) translateX(6px); color: #16a34a; }
    }
    .icon-animate-hover:hover svg {
      animation: icon-slide-scale 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    .icon-animate-active:active svg {
      transform: scale(0.92) translateX(0);
      transition: transform 0.1s;
    }

    /* Triple Arrow Animation */
    @keyframes arrow-move {
      0% { transform: translateX(0); opacity: 1; }
      60% { transform: translateX(12px); opacity: 1; }
      100% { transform: translateX(20px); opacity: 0; }
    }
    .arrow-animate-hover:hover .arrow-1 {
      animation: arrow-move 0.4s cubic-bezier(0.4,0,0.2,1) 0s forwards;
    }
    .arrow-animate-hover:hover .arrow-2 {
      animation: arrow-move 0.4s cubic-bezier(0.4,0,0.2,1) 0.08s forwards;
    }
    .arrow-animate-hover:hover .arrow-3 {
      animation: arrow-move 0.4s cubic-bezier(0.4,0,0.2,1) 0.16s forwards;
    }
    .arrow-animate-hover .arrow-1,
    .arrow-animate-hover .arrow-2,
    .arrow-animate-hover .arrow-3 {
      transition: transform 0.2s, opacity 0.2s;
    }
    .arrow-animate-hover:not(:hover) .arrow-1,
    .arrow-animate-hover:not(:hover) .arrow-2,
    .arrow-animate-hover:not(:hover) .arrow-3 {
      transform: translateX(0); opacity: 1;
      animation: none;
    }

    /* Flagged Glow Effects */
    @keyframes flagged-review-glow {
      0% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.5), 0 0 10px rgba(234, 179, 8, 0.3); }
      50% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.7), 0 0 20px rgba(234, 179, 8, 0.5); }
      100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.5), 0 0 10px rgba(234, 179, 8, 0.3); }
    }
    @keyframes flagged-completion-glow {
      0% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.2); }
      50% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3); }
      100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.2); }
    }
    .flagged-review {
      animation: flagged-review-glow 2s infinite;
      border: 2px solid #eab308;
      background: linear-gradient(to right, rgba(234, 179, 8, 0.05), rgba(234, 179, 8, 0.02));
    }
    .flagged-review:hover {
      background: linear-gradient(to right, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.04));
    }
    .flagged-completion {
      animation: flagged-completion-glow 2s infinite;
      border: 2px solid #22c55e;
      background: linear-gradient(to right, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
    }
    .flagged-completion:hover {
      background: linear-gradient(to right, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04));
    }

    /* Pulsating effect for busy cards */
    @keyframes pulsate {
      0% { box-shadow: 0 0 0 0 rgba(14, 101, 55, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(14, 101, 55, 0); }
      100% { box-shadow: 0 0 0 0 rgba(14, 101, 55, 0); }
    }
    .thread-busy-card {
      animation: pulsate 2s infinite;
      border: 2px solid #0e6537;
      background-color: rgba(14, 101, 55, 0.05);
    }
`;

export default dashboardStyles; 
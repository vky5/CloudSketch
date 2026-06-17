"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface SettingsPanelShellProps {
  editorWidth: number;
  title: string;
  subtitle?: string;
  meta?: string;
  onClose: () => void;
  headerLeft?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function SettingsPanelShell({
  editorWidth,
  title,
  subtitle,
  meta,
  onClose,
  headerLeft,
  footer,
  children,
}: SettingsPanelShellProps) {
  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] z-[1001] flex flex-col border-l border-slate-800/70 bg-[#0f1219] text-slate-100 shadow-[-8px_0_32px_rgba(0,0,0,0.35)]"
      style={{ right: `${editorWidth}px`, width: "360px" }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/70 px-5 py-4">
        <div className="min-w-0 flex-1">
          {headerLeft}
          <h2 className="truncate text-[15px] font-semibold tracking-tight text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
          )}
          {meta && (
            <p className="mt-2 truncate font-mono text-[10px] text-slate-600">
              {meta}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          title="Close"
          className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-800/70 px-5 py-4">{footer}</div>
      )}
    </div>
  );
}
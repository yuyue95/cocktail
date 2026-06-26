"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { GlassWater, Wine, ArrowLeftRight } from "lucide-react";
import { sendJSON } from "@/lib/fetcher";
import { USER_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Shows the current identity and lets the user flip to the other one. The new
// mode is persisted server-side and pushed into the JWT via session.update().
export default function ModeSwitcher({ mode }: { mode: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [current, setCurrent] = useState(mode);
  const [switching, setSwitching] = useState(false);

  const isBartender = current === USER_MODES.BARTENDER;
  const target = isBartender ? USER_MODES.DRINKER : USER_MODES.BARTENDER;

  async function switchMode() {
    setSwitching(true);
    try {
      await sendJSON("/api/user/mode", "PUT", { mode: target });
      await update({ mode: target });
      setCurrent(target);
      toast.success(
        target === USER_MODES.BARTENDER ? "已切换到卖酒模式" : "已切换到喝酒模式"
      );
      router.refresh();
    } catch {
      toast.error("切换失败");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted">当前身份</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-semibold text-ink">
          {isBartender ? (
            <>
              <Wine className="h-5 w-5 text-accent" /> 卖酒模式
            </>
          ) : (
            <>
              <GlassWater className="h-5 w-5 text-accent" /> 喝酒模式
            </>
          )}
        </span>
        <button
          onClick={switchMode}
          disabled={switching}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-ink transition hover:bg-cream",
            switching && "opacity-50"
          )}
        >
          <ArrowLeftRight className="h-4 w-4" />
          切换为{target === USER_MODES.BARTENDER ? "卖酒" : "喝酒"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {isBartender
          ? "卖酒模式可管理酒单定价、库存进销存与每日营业记账。"
          : "喝酒模式专注于配方探索、品饮日历与材料推荐。"}
      </p>
    </div>
  );
}

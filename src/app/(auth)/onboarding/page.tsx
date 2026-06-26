"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Wine, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { USER_MODES, type UserMode } from "@/lib/constants";

const OPTIONS: {
  mode: UserMode;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: USER_MODES.DRINKER,
    title: "我要喝酒 🍹",
    desc: "探索配方、记录每一杯的口感与心得，管理手头有什么材料、还能调出哪些酒。",
    icon: <GlassWater className="h-7 w-7" />,
  },
  {
    mode: USER_MODES.BARTENDER,
    title: "我要卖酒 🍸",
    desc: "在喝酒功能之上，额外管理酒单定价、库存进销存与每日营业记账。",
    icon: <Wine className="h-7 w-7" />,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [selected, setSelected] = useState<UserMode>(USER_MODES.DRINKER);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const res = await fetch("/api/user/mode", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: selected }),
    });
    if (!res.ok) {
      setLoading(false);
      toast.error("设置失败，请重试");
      return;
    }
    await update({ mode: selected }); // push new mode into the JWT
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-ink">你想怎么用调酒笔记？</h1>
      <p className="mt-1 text-sm text-muted">随时可以在「我的」里切换身份。</p>

      <div className="mt-8 space-y-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setSelected(opt.mode)}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition",
              selected === opt.mode
                ? "border-accent bg-accent-soft"
                : "border-border bg-card hover:border-accent"
            )}
          >
            <span className="mt-0.5 text-accent">{opt.icon}</span>
            <span>
              <span className="block font-semibold text-ink">{opt.title}</span>
              <span className="mt-1 block text-sm text-muted">{opt.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <Button size="lg" className="mt-8 w-full" onClick={confirm} disabled={loading}>
        {loading ? "设置中…" : "进入调酒笔记"}
      </Button>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("邮箱或密码不正确");
      return;
    }
    const callback = params.get("callbackUrl") || "/";
    router.push(callback);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-ink">欢迎回来</h1>
      <p className="mt-1 text-sm text-muted">登录后继续记录你的每一杯。</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">密码</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-accent">
          立即注册
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

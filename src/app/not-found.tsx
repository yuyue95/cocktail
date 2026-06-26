import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl">🍸</p>
      <h1 className="mt-4 text-xl font-bold text-ink">这一页空了</h1>
      <p className="mt-1 text-sm text-muted">你要找的内容不存在或已被移走。</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-cream"
      >
        回到首页
      </Link>
    </div>
  );
}

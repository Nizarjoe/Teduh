import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Masuk admin", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <p className="font-serif text-3xl">Teduh</p>
      <h1 className="mt-6 font-serif text-4xl">Masuk admin</h1>
      <LoginForm nextPath={next ?? "/admin"} />
    </main>
  );
}

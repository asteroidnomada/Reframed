import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { ACCESS_SLUG } from "@/lib/access";

export default async function AccessSignInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== ACCESS_SLUG) notFound();
  return <AuthForm initialMode="sign-in" slug={slug} />;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useTranslation } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError(null);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      values.email,
      { redirectTo: `${window.location.origin}/api/auth/callback?next=/settings` },
    );
    if (authError) {
      setError(t("auth.error.generic"));
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("auth.forgotPassword.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.forgotPassword.success")}</p>
        <Link href="/login" className="inline-block text-sm font-medium text-primary hover:underline">
          {t("auth.forgotPassword.backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.forgotPassword.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.forgotPassword.subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{t("auth.error.invalidEmail")}</p>
          )}
        </div>
        <button type="submit" className={buttonVariants({ className: "w-full" })} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("auth.forgotPassword.submit")}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.forgotPassword.backToSignIn")}
        </Link>
      </p>
    </div>
  );
}

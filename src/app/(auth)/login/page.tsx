"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, magicLinkSchema, type LoginValues, type MagicLinkValues } from "@/lib/validations/auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useTranslation } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { SocialButtons } from "@/components/auth/social-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? t("auth.error.generic") : null,
  );
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const magicForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const onLogin = async (values: LoginValues) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword(values);
    if (authError) {
      setError(t("auth.error.invalidCredentials"));
      return;
    }
    router.push("/");
    router.refresh();
  };

  const onMagicLink = async (values: MagicLinkValues) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (authError) {
      setError(t("auth.error.generic"));
      return;
    }
    setMagicLinkSent(true);
  };

  if (magicLinkSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("auth.signIn.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.magicLink.success")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.signIn.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.signIn.subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {magicLinkMode ? (
        <form onSubmit={magicForm.handleSubmit(onMagicLink)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">{t("auth.email")}</Label>
            <Input
              id="magic-email"
              type="email"
              autoComplete="email"
              {...magicForm.register("email")}
            />
            {magicForm.formState.errors.email && (
              <p className="text-xs text-destructive">{t("auth.error.invalidEmail")}</p>
            )}
          </div>
          <button type="submit" className={buttonVariants({ className: "w-full" })} disabled={magicForm.formState.isSubmitting}>
            {magicForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {t("auth.signIn.sendMagicLink")}
          </button>
          <button
            type="button"
            onClick={() => setMagicLinkMode(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            {t("auth.signIn.submit")}
          </button>
        </form>
      ) : (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-xs text-destructive">{t("auth.error.invalidEmail")}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                {t("auth.signIn.forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-xs text-destructive">{t("auth.error.weakPassword")}</p>
            )}
          </div>
          <button type="submit" className={buttonVariants({ className: "w-full" })} disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {t("auth.signIn.submit")}
          </button>
          <button
            type="button"
            onClick={() => setMagicLinkMode(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            {t("auth.signIn.magicLink")}
          </button>
        </form>
      )}

      <AuthDivider />
      <SocialButtons onError={setError} />

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.signIn.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t("auth.signIn.signUpLink")}
        </Link>
      </p>
    </div>
  );
}

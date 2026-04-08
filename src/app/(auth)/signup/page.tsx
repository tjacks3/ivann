"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useTranslation } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { SocialButtons } from "@/components/auth/social-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";
import { Loader2, Mail } from "lucide-react";

export default function SignUpPage() {
  const { t } = useTranslation();
  const supabase = useSupabase();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    setError(null);

    // Supabase with email confirmation enabled returns a fake user for
    // existing emails (for privacy). Detect this by checking if the
    // returned user has an empty `identities` array — that means the
    // email is already taken.
    const { data, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError(t("auth.error.emailTakenAction"));
      } else if (authError.message.includes("rate limit")) {
        setError(t("auth.error.rateLimited"));
      } else {
        setError(t("auth.error.generic"));
      }
      return;
    }

    // Supabase returns a user with empty identities when email already exists
    if (data.user && data.user.identities?.length === 0) {
      setError(t("auth.error.emailTakenAction"));
      return;
    }

    // If email confirmation is required, Supabase returns a user but no session
    if (data.user && !data.session) {
      setCheckEmail(true);
      return;
    }

    // If no confirmation required (dev mode), go to onboarding
    router.push("/onboarding");
    router.refresh();
  };

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    const email = form.getValues("email");
    if (!email) return;
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (resendError?.message.includes("rate limit")) {
      setError(t("auth.error.rateLimited"));
    } else {
      setResent(true);
    }
  };

  if (checkEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("auth.signUp.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signUp.checkEmail")}</p>
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {resent ? (
          <p className="text-sm font-medium text-primary">{t("auth.signUp.resentSuccess")}</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {resending ? t("auth.signUp.resending") : t("auth.signUp.resend")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("auth.signUp.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.signUp.subtitle")}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          {error === t("auth.error.emailTakenAction") && (
            <div className="mt-2 flex gap-3 text-xs">
              <Link href="/login" className="font-medium underline">
                {t("nav.signIn")}
              </Link>
              <Link href="/forgot-password" className="font-medium underline">
                {t("auth.signIn.forgotPassword")}
              </Link>
            </div>
          )}
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
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{t("auth.error.weakPassword")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
        <button type="submit" className={buttonVariants({ className: "w-full" })} disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("auth.signUp.submit")}
        </button>
      </form>

      <AuthDivider />
      <SocialButtons onError={setError} />

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.signUp.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("auth.signUp.signInLink")}
        </Link>
      </p>
    </div>
  );
}

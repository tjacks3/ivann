import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
      <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium">
        The creator marketplace
      </Badge>

      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Monetize your{" "}
        <span className="text-primary">influence</span>.
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        ivann connects creators with brands for paid collaborations. Build your
        profile, showcase your stats, and start earning.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/register" className={buttonVariants({ size: "lg" })}>
          Get Started
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

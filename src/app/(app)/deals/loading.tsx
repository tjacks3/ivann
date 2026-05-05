import { LoadingState } from "@/components/shared/loading-state";

export default function DealsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <LoadingState variant="skeleton" count={6} />
    </div>
  );
}

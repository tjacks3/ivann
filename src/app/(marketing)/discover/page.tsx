"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CreatorCard } from "@/components/discover/creator-card";
import { DiscoverFiltersPanel } from "@/components/discover/discover-filters";
import { DiscoverSort } from "@/components/discover/discover-sort";
import { FilterDrawer } from "@/components/discover/filter-drawer";
import { Button } from "@/components/ui/button";
import { useDiscover } from "@/hooks/use-discover";
import { useFavoriteIds } from "@/hooks/use-favorites";
import { useUser } from "@/hooks/use-user";
import { useTranslation } from "@/i18n";
import { Compass, Loader2, SearchX } from "lucide-react";

export default function DiscoverPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUser();
  const favoriteIds = useFavoriteIds();
  const isBrand = isAuthenticated && user?.role === "brand";
  const {
    creators,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    filters,
    updateFilters,
    clearFilters,
    loadMore,
    activeFilterCount,
  } = useDiscover();

  return (
    <PageContainer size="wide">
      <SectionHeader
        title={t("discover.title")}
        description={t("discover.subtitle")}
      />

      <div className="mt-6 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20">
            <DiscoverFiltersPanel
              filters={filters}
              onUpdate={updateFilters}
              onClear={clearFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar: mobile filters + sort + count */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile filter drawer */}
              <div className="lg:hidden">
                <FilterDrawer
                  filters={filters}
                  onUpdate={updateFilters}
                  onClear={clearFilters}
                  activeCount={activeFilterCount}
                />
              </div>
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{total}</span> {t("discover.resultsLabel")}
                </p>
              )}
            </div>
            <DiscoverSort
              value={filters.sort ?? "followers"}
              onChange={(sort) => updateFilters({ sort: sort as "followers" | "newest" | "az" })}
            />
          </div>

          {/* Loading state */}
          {isLoading && <LoadingState variant="skeleton" count={6} />}

          {/* No results */}
          {!isLoading && creators.length === 0 && activeFilterCount > 0 && (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title={t("discover.noResults.title")}
              description={t("discover.noResults.description")}
              action={
                <Button variant="outline" onClick={clearFilters}>
                  {t("discover.clearFilters")}
                </Button>
              }
            />
          )}

          {/* Empty state (no creators at all) */}
          {!isLoading && creators.length === 0 && activeFilterCount === 0 && (
            <EmptyState
              icon={<Compass className="size-6" />}
              title={t("discover.empty.title")}
              description={t("discover.empty.description")}
            />
          )}

          {/* Creator grid */}
          {creators.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {creators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    showFavorite={isBrand}
                    isFavorited={favoriteIds.has(creator.id)}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore && <Loader2 className="size-3.5 animate-spin" />}
                    {t("discover.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

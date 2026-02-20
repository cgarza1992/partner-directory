/**
 * Filterable Directory Grid - Vue 3 Application
 *
 * A reusable filterable card grid with:
 * - Multi-select region/category checkbox filters
 * - URL parameter sync (shareable filter states)
 * - Relevance scoring with priority ordering
 * - Load-more pagination
 * - Loading skeleton state
 */

document.addEventListener('DOMContentLoaded', function () {
  Vue.createApp({
    setup() {
      // Initialize selected platform/tab
      const selectedPlatform = Vue.ref('');

      const selectPlatform = (slug) => {
        selectedPlatform.value = slug;
        applyFilters();
      };

      // Initialize reactive filter options from external data
      const regions = Vue.reactive(initialRegions);
      const categories = Vue.reactive(initialCategories);

      // Read initial filter state from URL
      const urlParams = new URLSearchParams(window.location.search);
      const selectedRegions = Vue.ref(urlParams.getAll('region'));
      const selectedCategories = Vue.ref(urlParams.getAll('category'));

      // Pagination
      const pageSize = Vue.ref(12);
      const totalItems = Vue.ref(initialItems.length);

      // Loading state
      const isLoading = Vue.ref(true);
      const isLoadMoreLoading = Vue.ref(false);

      // Initialize items with reactive properties
      const items = Vue.reactive(
        initialItems.map((item) => ({
          ...item,
          active: false,
          regions: Array.isArray(item.regions) ? item.regions : [],
          excerpt: item.excerpt ?? '',
          score: 0,
          categories: item.categories ?? [],
        }))
      );

      // Computed helpers
      const anyActive = Vue.computed(() => items.some((item) => item.active));
      const anyRegions = Vue.computed(() => regions.length > 0);
      const anyCategories = Vue.computed(() => categories.length > 0);

      /**
       * Sync selected filters to URL parameters
       */
      const syncUrlParams = () => {
        const params = new URLSearchParams(window.location.search);

        // Clean stale params
        params.delete('region[]');
        params.delete('category[]');

        if (allRegionsSelected.value) {
          params.set('region', 'all');
        } else if (selectedRegions.value.length > 0) {
          params.set('region', selectedRegions.value.join(','));
        } else {
          params.delete('region');
        }

        if (allCategoriesSelected.value) {
          params.set('category', 'all');
        } else if (selectedCategories.value.length > 0) {
          params.set('category', selectedCategories.value.join(','));
        } else {
          params.delete('category');
        }

        history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
      };

      /**
       * Load more items
       */
      const loadMore = () => {
        isLoadMoreLoading.value = true;
        pageSize.value += 12;
      };

      const hasMore = Vue.computed(() => {
        return items.filter((item) => item.active).length > pageSize.value;
      });

      // Activate initial items on first render
      const activateInitialItems = () => {
        Vue.nextTick(() => {
          const count = Math.min(items.length, pageSize.value);
          for (let i = 0; i < count; i++) {
            items[i].active = true;
          }
        });
      };

      /**
       * Toggle a category filter
       */
      const toggleCategory = (slug) => {
        const index = selectedCategories.value.indexOf(slug);
        if (index > -1) {
          selectedCategories.value.splice(index, 1);
        } else {
          selectedCategories.value.push(slug);
        }
        applyFilters();
        syncUrlParams();
      };

      /**
       * Toggle a region filter
       */
      const toggleRegion = (slug) => {
        const index = selectedRegions.value.indexOf(slug);
        if (index > -1) {
          selectedRegions.value.splice(index, 1);
        } else {
          selectedRegions.value.push(slug);
        }
        applyFilters();
        syncUrlParams();
      };

      const allRegionsSelected = Vue.computed(() => {
        return selectedRegions.value.length === regions.length;
      });

      const allCategoriesSelected = Vue.computed(() => {
        return selectedCategories.value.length === categories.length;
      });

      const toggleAllCategories = () => {
        if (allCategoriesSelected.value) {
          selectedCategories.value = [];
        } else {
          selectedCategories.value = categories.map((c) => c.slug);
        }
        syncUrlParams();
      };

      const toggleAllRegions = () => {
        if (allRegionsSelected.value) {
          selectedRegions.value = [];
        } else {
          selectedRegions.value = regions.map((r) => r.slug);
        }
        syncUrlParams();
      };

      /**
       * Filtered, scored, sorted, and paginated items
       */
      const filteredItems = Vue.computed(() => {
        applyFilters();

        const active = items.filter((item) => item.active);

        console.group('%c[Directory Scoring]', 'color: #6366f1; font-weight: bold');
        console.log(`Active items: ${active.length} / ${items.length}`);
        console.log(`Filters — Regions: [${selectedRegions.value.join(', ')}] | Categories: [${selectedCategories.value.join(', ')}]`);

        const sorted = active.sort((a, b) => {
          const aPriority = a.priority || 0;
          const bPriority = b.priority || 0;
          const aScore = a.score || 0;
          const bScore = b.score || 0;

          // Primary: lower priority number first (sponsored/paid placement)
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          // Tiebreaker: higher relevance score first
          return bScore - aScore;
        });

        const page = sorted.slice(0, pageSize.value);

        console.log(`Displaying: ${page.length} (of ${active.length} active, page size: ${pageSize.value})`);
        console.table(
          page.map((item, i) => ({
            '#': i + 1,
            title: item.title,
            priority: item.priority || 0,
            score: item.score || 0,
            regions: item.regions.join(', '),
            categories: item.categories.map((c) => c.slug).join(', '),
          }))
        );
        console.groupEnd();

        if (!isLoadMoreLoading.value) {
          setTimeout(() => {
            isLoading.value = false;
          }, 2000);
        }

        return page;
      });

      /**
       * Apply filter matching and calculate relevance scores
       */
      const applyFilters = () => {
        const scoreBreakdowns = [];

        items.forEach((item) => {
          const matchedRegions = selectedRegions.value.length > 0
            ? item.regions.filter((r) => selectedRegions.value.includes(r.toLowerCase().trim()))
            : [];

          const matchedCategories = selectedCategories.value.length > 0
            ? item.categories.filter((c) => selectedCategories.value.includes(c.slug.toLowerCase().trim()))
            : [];

          const regionMatch = selectedRegions.value.length === 0 || matchedRegions.length > 0;
          const categoryMatch = selectedCategories.value.length === 0 || matchedCategories.length > 0;

          item.active = regionMatch && categoryMatch;

          // Calculate relevance score
          const regionScore = matchedRegions.length;
          const categoryScore = matchedCategories.length;
          item.score = regionScore + categoryScore;

          if (item.active) {
            scoreBreakdowns.push({
              title: item.title,
              regionScore,
              categoryScore,
              total: item.score,
              matchedRegions: matchedRegions.join(', ') || '(all)',
              matchedCategories: matchedCategories.map((c) => c.slug).join(', ') || '(all)',
            });
          }
        });

        console.group('%c[Filter Scoring Breakdown]', 'color: #10b981; font-weight: bold');
        console.log(`${scoreBreakdowns.length} items matched filters`);
        console.table(scoreBreakdowns);
        console.groupEnd();
      };

      /**
       * Read filter state from URL (for back/forward navigation)
       */
      const readFiltersFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const urlRegions = params.get('region');
        const urlCategories = params.get('category');

        if (urlRegions === 'all') {
          selectedRegions.value = regions.map((r) => r.slug);
        } else if (urlRegions) {
          selectedRegions.value = urlRegions.split(',');
        } else {
          selectedRegions.value = [];
        }

        if (urlCategories === 'all') {
          selectedCategories.value = categories.map((c) => c.slug);
        } else if (urlCategories) {
          selectedCategories.value = urlCategories.split(',');
        } else {
          selectedCategories.value = [];
        }
      };

      // React to filter changes
      Vue.watch([selectedRegions, selectedCategories, selectedPlatform], applyFilters, {
        immediate: true,
      });

      // Handle browser back/forward
      window.addEventListener('popstate', () => readFiltersFromUrl());

      // Initialize
      Vue.onMounted(() => {
        activateInitialItems();
        readFiltersFromUrl();

        // Default to all selected if no URL params
        if (selectedRegions.value.length === 0 && selectedCategories.value.length === 0) {
          toggleAllRegions();
          toggleAllCategories();
        }
      });

      return {
        regions,
        categories,
        isLoading,
        items,
        totalItems,
        selectedRegions,
        selectedCategories,
        selectPlatform,
        selectedPlatform,
        anyRegions,
        anyCategories,
        anyActive,
        loadMore,
        hasMore,
        toggleRegion,
        toggleAllCategories,
        toggleAllRegions,
        allCategoriesSelected,
        allRegionsSelected,
        toggleCategory,
        filteredItems,
      };
    },
  }).mount('#directory-app');
});

/**
 * Filterable Directory Grid - Vue 3 Application
 *
 * A reusable filterable card grid with:
 * - Multi-select region/category checkbox filters
 * - GeoIP-based region detection (simulated via browser locale)
 * - URL parameter sync (shareable filter states)
 * - Relevance scoring with priority ordering
 * - Load-more pagination
 * - Loading skeleton state
 */

document.addEventListener('DOMContentLoaded', function () {
  Vue.createApp({
    setup() {
      const selectedPlatform = Vue.ref('');

      const selectPlatform = (slug) => {
        selectedPlatform.value = slug;
        applyFilters();
      };

      const regions = Vue.reactive(initialRegions);
      const categories = Vue.reactive(initialCategories);

      // Detect region from browser locale (simulates GeoIP)
      const detectRegionFromLocale = () => {
        const lang = (navigator.language || 'en-US').toLowerCase();
        if (/^(en-gb|en-ie|de|fr|es-es|it|nl|pl|sv|da|fi|nb|pt-pt)/.test(lang)) return 'europe';
        if (/^(ja|zh|ko|en-au|en-nz|en-sg|id|th|vi)/.test(lang)) return 'asia-pacific';
        if (/^(pt-br|es-ar|es-co|es-cl|es-pe)/.test(lang)) return 'latin-america';
        return 'north-america';
      };

      const detectedRegionSlug = detectRegionFromLocale();
      const detectedRegion = Vue.computed(() => {
        const found = regions.find(r => r.slug === detectedRegionSlug);
        return found ? found.name : 'North America';
      });

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

      // Copy state
      const copied = Vue.ref(false);

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

      const anyActive = Vue.computed(() => items.some((item) => item.active));
      const anyRegions = Vue.computed(() => regions.length > 0);
      const anyCategories = Vue.computed(() => categories.length > 0);

      // True when the user has narrowed filters below "all"
      const filtersActive = Vue.computed(() => {
        return (
          selectedRegions.value.length > 0 && selectedRegions.value.length < regions.length ||
          selectedCategories.value.length > 0 && selectedCategories.value.length < categories.length
        );
      });

      const matchCount = Vue.computed(() => items.filter(i => i.active).length);

      const syncUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
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

      const copyShareUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          copied.value = true;
          setTimeout(() => { copied.value = false; }, 2000);
        });
      };

      const loadMore = () => {
        isLoadMoreLoading.value = true;
        pageSize.value += 12;
      };

      const hasMore = Vue.computed(() => {
        return items.filter((item) => item.active).length > pageSize.value;
      });

      const activateInitialItems = () => {
        Vue.nextTick(() => {
          const count = Math.min(items.length, pageSize.value);
          for (let i = 0; i < count; i++) {
            items[i].active = true;
          }
        });
      };

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

      const filteredItems = Vue.computed(() => {
        applyFilters();

        const active = items.filter((item) => item.active);

        const sorted = active.sort((a, b) => {
          const aPriority = a.priority || 0;
          const bPriority = b.priority || 0;
          const aScore = a.score || 0;
          const bScore = b.score || 0;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return bScore - aScore;
        });

        const page = sorted.slice(0, pageSize.value);

        if (!isLoadMoreLoading.value) {
          setTimeout(() => { isLoading.value = false; }, 2000);
        }

        return page;
      });

      const applyFilters = () => {
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
          item.score = matchedRegions.length + matchedCategories.length;
        });
      };

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

      Vue.watch([selectedRegions, selectedCategories, selectedPlatform], applyFilters, {
        immediate: true,
      });

      window.addEventListener('popstate', () => readFiltersFromUrl());

      Vue.onMounted(() => {
        activateInitialItems();
        readFiltersFromUrl();

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
        detectedRegion,
        filtersActive,
        matchCount,
        copied,
        copyShareUrl,
      };
    },
  }).mount('#directory-app');
});

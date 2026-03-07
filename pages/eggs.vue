<template>
  <div>
    <h1 class="sr-only">Eggs</h1>

    <AppTopBar :showBack="showFilter" backFallback="/eggs/" :heading="heading">
      <AppSearchBox
        v-show="!showFilter && !showRecentOrPinned && !showEggFinder"
        v-model="eggFilter.nameFilter"
      />
    </AppTopBar>

    <NuxtLink :to="fabFilterTarget" @click.native="toggleFilter">
      <AppFloatingButton :title="fabFilterTitle">
        <FaIcon :icon="fabFilterIcon" />
      </AppFloatingButton>
    </NuxtLink>

    <AppFloatingButton
      v-show="fabDisplayVisible"
      :title="fabDisplayTitle"
      secondary
      @click="toggleDisplay"
    >
      <FaIcon :icon="fabDisplayIcon" />
    </AppFloatingButton>

    <AppFloatingButton
      v-if="fabEggFinderVisible"
      :title="fabEggFinderTitle"
      tertiary
      @click="toggleEggFinder"
    >
      <FaIcon :icon="fabEggFinderIcon" />
    </AppFloatingButton>

    <NuxtChild v-show="!leaving && showFilter" />

    <main v-show="leaving || !showFilter">
      <client-only>
        <Mhst1Banner class="mb-3" />
      </client-only>

      <div
        v-if="showActiveFilters"
        class="fixed z-20 w-full inset-x-0 top-12 mt-1"
      >
        <div
          class="container px-4 flex flex-wrap gap-2 items-center justify-center"
        >
          <AppFilterPill
            v-if="eggFilter.hasActiveSort"
            :caption="eggFilter.activeSort.caption"
            filterTarget="/eggs/filter/"
            :sortOrder="eggFilter.activeSort.order"
          />

          <AppFilterPill
            v-for="filter in eggFilter.activeFilters"
            :key="filter.name"
            :caption="filter.value"
            filterTarget="/eggs/filter/"
            showRemove
            @remove="eggFilter[filter.name] = null"
          />
        </div>
      </div>

      <ul
        v-if="showEggFinder"
        class="mt-1 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        <li v-for="genus in genera" :key="genus">
          <EggGridItem
            :genus="genus"
            class="box box-link px-1 overflow-hidden cursor-pointer"
            @click.native="setGenusFilter(genus)"
          />
        </li>
      </ul>

      <ul
        v-if="!showEggFinder"
        class="space-y-5"
        :class="{ 'mt-8': showActiveFilters }"
      >
        <li v-for="(group, key) in groupedMonsters" :key="key">
          <div
            v-if="eggFilter.isGrouped && !showRecentOrPinned"
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              v-if="eggFilter.sortKey === 'genus'"
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'dna']"
            />

            <FaIcon
              v-if="eggFilter.sortKey === 'habitat'"
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'map-marker-alt']"
            />

            <div class="font-semibold" v-text="key" />
          </div>

          <div
            v-if="mode === 'compact'"
            class="mt-1 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          >
            <NuxtLink
              v-for="monster in group"
              :key="monster.no"
              :to="`/monsters/${monster.slug}/`"
            >
              <EggGridItem
                :monster="monster"
                class="box box-link px-1 overflow-hidden"
              />
            </NuxtLink>
          </div>

          <div
            v-else
            class="mt-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <NuxtLink
              v-for="monster in group"
              :key="monster.no"
              :to="`/monsters/${monster.slug}/`"
            >
              <EggListItem
                :monster="monster"
                :mode="mode"
                class="box box-link px-1 overflow-hidden"
              />
            </NuxtLink>
          </div>
        </li>
      </ul>

      <MonsterNoResults v-if="eggFilter.isEmpty && !showRecentOrPinned">
        No eggs found
      </MonsterNoResults>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapStores } from 'pinia';
import useEggFilter from '~/stores/eggFilter';
import { makeHead } from '~/services/utils';
import { getGenera, monsties } from '~/services/data';

export default {
  name: 'PageEggs',

  provide: {
    useFilterStore: useEggFilter,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.leaving = false;
      vm.$useHistoryStore().lastList = 'eggs';
    });
  },

  beforeRouteLeave(to, from, next) {
    this.leaving = true;
    next();
  },

  data() {
    return {
      genera: getGenera(monsties),
      leaving: false,
      display: null,
      showEggFinder: false,
    };
  },

  head() {
    return makeHead({
      title: 'Monster Buddy - Egg List For Monster Hunter Stories 2',
      description:
        'Visual guide with images for all egg patterns for every hatchable monstie with search, sorting and filtering',
      canonical: 'https://monsterbuddy.app/eggs/',
    });
  },

  computed: {
    ...mapStores(useEggFilter),

    history() {
      return this.$useHistoryStore();
    },

    mode() {
      if (this.display === 'pinned') {
        return 'compact';
      }
      return this.eggFilter.mode;
    },

    showFilter() {
      // workaround for <NuxtChild> not playing nice with <Nuxt keep-alive>
      return this.$route?.path === '/eggs/filter/';
    },

    showActiveFilters() {
      return (
        (this.eggFilter.hasActiveSort || this.eggFilter.hasActiveFilters) &&
        !this.showRecentOrPinned &&
        !this.showEggFinder
      );
    },

    showRecentOrPinned() {
      return this.display === 'recent' || this.display === 'pinned';
    },

    groupedMonsters() {
      if (this.display === 'recent') {
        return {
          all: this.history.recentMonsties,
        };
      }
      if (this.display === 'pinned') {
        return {
          all: this.history.pinnedEggs,
        };
      }
      return this.eggFilter.groupedMonsters;
    },

    heading() {
      if (this.showFilter) {
        return 'View Options';
      }
      if (this.showEggFinder) {
        return 'Egg Finder';
      }
      if (this.display === 'recent') {
        return 'Recent Eggs';
      }
      if (this.display === 'pinned') {
        return 'Bookmarked Eggs';
      }
      return null;
    },

    fabFilterTarget() {
      if (this.showFilter) {
        return '/eggs/';
      }
      return '/eggs/filter/';
    },

    fabFilterTitle() {
      if (this.showFilter) {
        return 'Apply';
      }
      return 'View options';
    },

    fabFilterIcon() {
      if (this.showFilter) {
        return ['fas', 'check'];
      }
      return ['fas', 'sliders-h'];
    },

    displays() {
      let results = ['default'];

      if (this.history.hasRecentMonsties) {
        results.push('recent');
      }

      if (this.history.hasPinnedEggs) {
        results.push('pinned');
      }

      return results;
    },

    nextDisplay() {
      let currentIndex = _.indexOf(this.displays, this.display);
      let nextIndex = (currentIndex + 1) % this.displays.length;

      return this.displays[nextIndex];
    },

    fabDisplayVisible() {
      return !this.showFilter && this.displays.length > 1;
    },

    fabDisplayTitle() {
      switch (this.nextDisplay) {
        case 'default':
          return 'Show all eggs';

        case 'recent':
          return 'Show recent eggs ';

        case 'pinned':
          return 'Show bookmarked eggs';

        default:
          return null;
      }
    },

    fabDisplayIcon() {
      switch (this.nextDisplay) {
        case 'default':
          return ['fas', 'times'];

        case 'recent':
          return ['fas', 'history'];

        case 'pinned':
          return ['fas', 'bookmark'];

        default:
          return null;
      }
    },

    fabEggFinderVisible() {
      return !this.showFilter;
    },

    fabEggFinderTitle() {
      if (this.showEggFinder) {
        return 'Show all eggs';
      }
      return 'Show egg finder';
    },

    fabEggFinderIcon() {
      if (this.showEggFinder) {
        return ['fas', 'times'];
      }
      return ['fas', 'egg'];
    },
  },

  created() {
    this.toggleDisplay();
  },

  methods: {
    toggleFilter() {
      this.display = 'default';
      this.showEggFinder = false;
    },

    toggleDisplay() {
      this.display = this.nextDisplay;
      this.showEggFinder = false;

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    toggleEggFinder() {
      this.showEggFinder = !this.showEggFinder;
      this.display = 'default';

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    setGenusFilter(genus) {
      this.toggleEggFinder();
      this.eggFilter.genusFilter = genus;
    },
  },
};
</script>

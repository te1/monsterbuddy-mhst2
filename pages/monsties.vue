<template>
  <div>
    <h1 class="sr-only">Monsties</h1>

    <AppTopBar
      :showBack="showFilter"
      backFallback="/monsties/"
      :heading="heading"
    >
      <AppSearchBox
        v-show="!showFilter && !showRecentOrPinned"
        v-model="monstieFilter.nameFilter"
      />
    </AppTopBar>

    <NuxtLink :to="fabFilterTarget" @click.native="display = 'default'">
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

    <NuxtChild v-show="!leaving && showFilter" />

    <main v-show="leaving || !showFilter">
      <client-only>
        <Mhst3Banner class="mb-3" />
      </client-only>

      <div
        v-if="showActiveFilters"
        class="fixed z-20 w-full inset-x-0 top-12 mt-1"
      >
        <div
          class="container px-4 flex flex-wrap gap-2 items-center justify-center"
        >
          <AppFilterPill
            v-if="monstieFilter.hasActiveSort"
            :caption="monstieFilter.activeSort.caption"
            filterTarget="/monsties/filter/"
            :sortOrder="monstieFilter.activeSort.order"
          />

          <AppFilterPill
            v-for="filter in monstieFilter.activeFilters"
            :key="filter.name"
            :caption="filter.value"
            filterTarget="/monsties/filter/"
            showRemove
            @remove="monstieFilter[filter.name] = null"
          />
        </div>
      </div>

      <ul class="space-y-5" :class="{ 'mt-8': showActiveFilters }">
        <li v-for="(group, key) in groupedMonsters" :key="key">
          <div
            v-if="monstieFilter.isGrouped && !showRecentOrPinned"
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              v-if="monstieFilter.sortKey === 'genus'"
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'dna']"
            />

            <FaIcon
              v-if="monstieFilter.sortKey === 'habitat'"
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'map-marker-alt']"
            />

            <div class="font-semibold" v-text="key" />
          </div>

          <div
            class="mt-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <NuxtLink
              v-for="monster in group"
              :key="monster.no"
              :to="`/monsters/${monster.slug}/`"
            >
              <MonstieListItem
                :monster="monster"
                :mode="mode"
                class="box box-link px-1 overflow-hidden"
              />
            </NuxtLink>
          </div>
        </li>
      </ul>

      <MonsterNoResults v-if="monstieFilter.isEmpty && !showRecentOrPinned">
        No monsties found
      </MonsterNoResults>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapStores } from 'pinia';
import useMonstieFilter from '~/stores/monstieFilter';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageMonsties',

  provide: {
    useFilterStore: useMonstieFilter,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.leaving = false;
      vm.$useHistoryStore().lastList = 'monsties';
    });
  },

  beforeRouteLeave(to, from, next) {
    this.leaving = true;
    next();
  },

  data() {
    return {
      leaving: false,
      display: null,
    };
  },

  head() {
    return makeHead({
      title: 'Monster Buddy - Monstie List For Monster Hunter Stories 2',
      description:
        'Easily find all monsties in their natural habitats and check on retreat conditions, their attack types and stats',
      canonical: 'https://monsterbuddy.app/monsties/',
    });
  },

  computed: {
    ...mapStores(useMonstieFilter),

    history() {
      return this.$useHistoryStore();
    },

    mode() {
      return this.monstieFilter.mode;
    },

    showFilter() {
      // workaround for <NuxtChild> not playing nice with <Nuxt keep-alive>
      return this.$route?.path === '/monsties/filter/';
    },

    showActiveFilters() {
      return (
        (this.monstieFilter.hasActiveSort ||
          this.monstieFilter.hasActiveFilters) &&
        !this.showRecentOrPinned
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
          all: this.history.pinnedMonsties,
        };
      }
      return this.monstieFilter.groupedMonsters;
    },

    heading() {
      if (this.showFilter) {
        return 'View Options';
      }
      if (this.display === 'recent') {
        return 'Recent Monsties';
      }
      if (this.display === 'pinned') {
        return 'Bookmarked Monsties';
      }
      return null;
    },

    fabFilterTarget() {
      if (this.showFilter) {
        return '/monsties/';
      }
      return '/monsties/filter/';
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

      if (this.history.hasPinnedMonsties) {
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
          return 'Show all monsties';

        case 'recent':
          return 'Show recent monsties ';

        case 'pinned':
          return 'Show bookmarked monsties';

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
  },

  created() {
    this.toggleDisplay();
  },

  methods: {
    toggleDisplay() {
      this.display = this.nextDisplay;

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  },
};
</script>

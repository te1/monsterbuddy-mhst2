<template>
  <div>
    <h1 class="sr-only">Monsters</h1>

    <AppTopBar
      :showBack="showFilter"
      backFallback="/monsters/"
      :heading="heading"
    >
      <AppSearchBox
        v-show="!showFilter && !showRecentOrPinned"
        v-model="monsterFilter.nameFilter"
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
            v-if="monsterFilter.hasActiveSort"
            :caption="monsterFilter.activeSort.caption"
            filterTarget="/monsters/filter/"
            :sortOrder="monsterFilter.activeSort.order"
          />

          <AppFilterPill
            v-for="filter in monsterFilter.activeFilters"
            :key="filter.name"
            :caption="filter.value"
            filterTarget="/monsters/filter/"
            showRemove
            @remove="monsterFilter[filter.name] = null"
          />
        </div>
      </div>

      <ul class="space-y-5" :class="{ 'mt-8': showActiveFilters }">
        <li v-for="(group, key) in groupedMonsters" :key="key">
          <div
            v-if="monsterFilter.isGrouped && !showRecentOrPinned"
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              v-if="monsterFilter.sortKey === 'genus'"
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'dna']"
            />

            <FaIcon
              v-if="monsterFilter.sortKey === 'habitat'"
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
              <MonsterListItem
                :monster="monster"
                :mode="mode"
                class="box box-link px-1 overflow-hidden"
              />
            </NuxtLink>
          </div>
        </li>
      </ul>

      <MonsterNoResults v-if="monsterFilter.isEmpty && !showRecentOrPinned">
        No monsters found
      </MonsterNoResults>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapStores } from 'pinia';
import useMonsterFilter from '~/stores/monsterFilter';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageMonsters',

  provide: {
    useFilterStore: useMonsterFilter,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.leaving = false;
      vm.$useHistoryStore().lastList = 'monsters';
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
      title: 'Monster Buddy - Monster List For Monster Hunter Stories 2',
      description:
        'Quickly check for monster attack patterns, elemental weaknesses and weapon effectiveness on body parts',
      canonical: 'https://mhst2.monsterbuddy.app/monsters/',
    });
  },

  computed: {
    ...mapStores(useMonsterFilter),

    history() {
      return this.$useHistoryStore();
    },

    mode() {
      if (this.display === 'pinned') {
        return 'combat';
      }
      return this.monsterFilter.mode;
    },

    showFilter() {
      // workaround for <NuxtChild> not playing nice with <Nuxt keep-alive>
      return this.$route?.path === '/monsters/filter/';
    },

    showActiveFilters() {
      return (
        (this.monsterFilter.hasActiveSort ||
          this.monsterFilter.hasActiveFilters) &&
        !this.showRecentOrPinned
      );
    },

    showRecentOrPinned() {
      return this.display === 'recent' || this.display === 'pinned';
    },

    groupedMonsters() {
      if (this.display === 'recent') {
        return {
          all: this.history.recentMonsters,
        };
      }
      if (this.display === 'pinned') {
        return {
          all: this.history.pinnedMonsters,
        };
      }
      return this.monsterFilter.groupedMonsters;
    },

    heading() {
      if (this.showFilter) {
        return 'View Options';
      }
      if (this.display === 'recent') {
        return 'Recent Monsters';
      }
      if (this.display === 'pinned') {
        return 'Bookmarked Monsters';
      }
      return null;
    },

    fabFilterTarget() {
      if (this.showFilter) {
        return '/monsters/';
      }
      return '/monsters/filter/';
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

      if (this.history.hasRecentMonsters) {
        results.push('recent');
      }

      if (this.history.hasPinnedMonsters) {
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
          return 'Show all monsters';

        case 'recent':
          return 'Show recent monsters ';

        case 'pinned':
          return 'Show bookmarked monsters';

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

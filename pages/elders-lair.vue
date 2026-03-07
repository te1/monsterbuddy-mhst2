<template>
  <div>
    <h1 class="sr-only">Elder's Lair</h1>

    <AppTopBar
      :showBack="showFilter"
      backFallback="/elders-lair/"
      :heading="heading"
    >
      <AppSearchBox
        v-show="!showFilter"
        v-model="eldersLairFilter.nameFilter"
      />
    </AppTopBar>

    <NuxtLink :to="fabTarget">
      <AppFloatingButton :title="fabTitle">
        <FaIcon :icon="fabIcon" />
      </AppFloatingButton>
    </NuxtLink>

    <NuxtChild v-show="!leaving && showFilter" />

    <main v-show="leaving || !showFilter">
      <div
        v-if="
          eldersLairFilter.hasActiveSort || eldersLairFilter.hasActiveFilters
        "
        class="fixed z-20 w-full inset-x-0 top-12 mt-1"
      >
        <div
          class="container px-4 flex flex-wrap gap-2 items-center justify-center"
        >
          <AppFilterPill
            v-if="eldersLairFilter.hasActiveSort"
            :caption="eldersLairFilter.activeSort.caption"
            filterTarget="/elders-lair/filter/"
            :sortOrder="eldersLairFilter.activeSort.order"
          />

          <AppFilterPill
            v-for="filter in eldersLairFilter.activeFilters"
            :key="filter.name"
            :caption="filter.value"
            filterTarget="/elders-lair/filter/"
            showRemove
            @remove="eldersLairFilter[filter.name] = null"
          />
        </div>
      </div>

      <ul
        class="space-y-5"
        :class="{
          'mt-8':
            eldersLairFilter.hasActiveSort || eldersLairFilter.hasActiveFilters,
        }"
      >
        <li v-for="(group, key) in eldersLairFilter.groupedMonsters" :key="key">
          <div
            v-if="eldersLairFilter.isGrouped"
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'map-marker-alt']"
            />

            <div class="font-semibold mb-1">Elder's Lair - {{ key }}</div>
          </div>

          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <NuxtLink
              v-for="monster in group"
              :key="monster.no"
              :to="`/monsters/${monster.slug}/`"
            >
              <MonsterListItem
                :monster="monster"
                :mode="eldersLairFilter.mode"
                class="box box-link px-1 overflow-hidden"
              />
            </NuxtLink>
          </div>
        </li>
      </ul>

      <MonsterNoResults v-if="eldersLairFilter.isEmpty">
        No monsters found
      </MonsterNoResults>
    </main>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import useEldersLairFilter from '~/stores/eldersLairFilter';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageEldersLair',

  provide: {
    useFilterStore: useEldersLairFilter,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.leaving = false;

      if (to?.query?.floor) {
        vm.eldersLairFilter.eldersLairFilter = to.query.floor;

        // remove query parametrs from URL
        vm.$router.replace(to.path);
      }
    });
  },

  beforeRouteLeave(to, from, next) {
    this.leaving = true;
    next();
  },

  data() {
    return {
      leaving: false,
    };
  },

  head() {
    return makeHead({
      title:
        "Monster Buddy - Elder's Lair Monster List For Monster Hunter Stories 2",
      description:
        "Overview of all the high rank monsters and on which floor to find them in the Elder's Lair and S. Elder's Lair end game zones",
      canonical: 'https://monsterbuddy.app/elders-lair/',
    });
  },

  computed: {
    ...mapStores(useEldersLairFilter),

    showFilter() {
      // workaround for <NuxtChild> not playing nice with <Nuxt keep-alive>
      return this.$route?.path === '/elders-lair/filter/';
    },

    heading() {
      if (this.showFilter) {
        return 'View Options';
      }
      return null;
    },

    fabTarget() {
      if (this.showFilter) {
        return '/elders-lair/';
      }
      return '/elders-lair/filter/';
    },

    fabTitle() {
      if (this.showFilter) {
        return 'Apply';
      }
      return 'View options';
    },

    fabIcon() {
      if (this.showFilter) {
        return ['fas', 'check'];
      }
      return ['fas', 'sliders-h'];
    },
  },
};
</script>

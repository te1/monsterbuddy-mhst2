<template>
  <div v-if="ridingAction">
    <AppTopBar
      :heading="ridingAction.name"
      showBack
      backFallback="/riding-actions/"
    />

    <AppFloatingButton
      v-if="fabVisible"
      :title="fabTitle"
      @click="toggleDisplay"
    >
      <FaIcon :icon="fabIcon" />
    </AppFloatingButton>

    <main>
      <section class="box mb-3 px-4 py-2">
        <h3 class="text-lg font-semibold">
          {{ ridingAction.name }}
        </h3>
        {{ ridingAction.description }}
      </section>

      <div class="flex items-center mb-1">
        <FaIcon
          class="!w-6 text-gray-500 dark:text-cool-400"
          :icon="['fas', 'dna']"
        />

        <div class="font-semibold mb-1">Learnt By</div>
      </div>

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MonsterSmartListItem
          v-for="monster in monsters"
          :key="monster.no"
          :monster="monster"
          :display="display"
        />
      </div>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import {
  ridingActionsBySlug,
  getMonstiesByRidingAction,
} from '~/services/data';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageRidingActionDetails',

  data() {
    return {
      ridingAction: ridingActionsBySlug[this.$route.params.slug],
      display: null,
    };
  },

  head() {
    if (this.ridingAction == null) {
      return;
    }

    let description = `${this.ridingAction.name} is a riding action that `;

    if (this.monsters.length) {
      description += `${this.monsters.length} `;
    }

    description += 'monsties can learn.';

    switch (this.ridingAction.type) {
      case 'utility':
        description += ' It provides general utility.';
        break;

      case 'explore':
        description +=
          ' It helps with exploration and accessing treasure chests in dens.';
        break;

      case 'search':
        description += ' It helps finding monsters, dens or materials.';
    }

    return makeHead({
      title: `Monster Buddy - ${this.ridingAction.name} In Monster Hunter Stories 2`,
      description,
      canonical: `https://mhst2.monsterbuddy.app/riding-actions/${this.ridingAction.slug}/`,
    });
  },

  computed: {
    monsters() {
      return getMonstiesByRidingAction(this.ridingAction.name);
    },

    displays() {
      return ['monstie', 'egg'];
    },

    nextDisplay() {
      let currentIndex = _.indexOf(this.displays, this.display);
      let nextIndex = (currentIndex + 1) % this.displays.length;

      return this.displays[nextIndex];
    },

    fabVisible() {
      return this.displays.length > 1;
    },

    fabTitle() {
      switch (this.nextDisplay) {
        case 'monstie':
          return 'Show monsties ';

        case 'egg':
          return 'Show eggs';

        default:
          return null;
      }
    },

    fabIcon() {
      switch (this.nextDisplay) {
        case 'monstie':
          return ['fas', 'dragon'];

        case 'egg':
          return ['fas', 'egg'];

        default:
          return null;
      }
    },
  },

  created() {
    if (this.ridingAction == null) {
      this.$nuxt.error({
        statusCode: 404,
        message: 'This page could not be found',
      });
    } else {
      this.toggleDisplay();
    }
  },

  methods: {
    toggleDisplay() {
      this.display = this.nextDisplay;
    },
  },
};
</script>

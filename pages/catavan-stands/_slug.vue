<template>
  <div v-if="catavanStand">
    <AppTopBar
      :heading="catavanStand.name"
      showBack
      backFallback="/catavan-stands/"
    />

    <AppFloatingButton
      v-if="fabVisible"
      :title="fabTitle"
      @click="toggleDisplay"
    >
      <FaIcon :icon="fabIcon" />
    </AppFloatingButton>

    <main>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MonsterSmartListItem
          v-for="monster in monsters"
          :key="monster.no"
          :monster="monster"
          :display="display"
          :mode="getMode(monster)"
        />
      </div>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import {
  catavanStandsBySlug,
  getMonstersByCatavanStand,
} from '~/services/data';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageCatavanStandDetails',

  data() {
    return {
      catavanStand: catavanStandsBySlug[this.$route.params.slug],
      display: null,
    };
  },

  head() {
    if (this.catavanStand == null) {
      return;
    }

    let description = `${this.catavanStand.name} is a catavan stand `;

    if (this.catavanStand.zone) {
      description += `in ${this.catavanStand.zone} `;
    }

    description += 'that you can fast travel to.';

    if (this.monsters.length) {
      description += ` It is home to ${this.monsters.length} different monsters.`;
    }

    return makeHead({
      title: `Monster Buddy - ${this.catavanStand.name} In Monster Hunter Stories 2`,
      description,
      canonical: `https://mhst2.monsterbuddy.app/catavan-stands/${this.catavanStand.slug}/`,
    });
  },

  computed: {
    monsters() {
      return getMonstersByCatavanStand(this.catavanStand.name);
    },

    displays() {
      return ['monster', 'monstie', 'egg'];
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
        case 'monster':
          return 'Show monsters';

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
        case 'monster':
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
    if (this.catavanStand == null) {
      this.$nuxt.error({
        statusCode: 404,
        message: 'This page could not be found',
      });
    } else {
      this.toggleDisplay();
    }
  },

  methods: {
    getMode(monster) {
      switch (this.display) {
        case 'monster':
          return 'rarity';

        case 'monstie':
        case 'egg':
          if (monster.hatchable) {
            return 'retreat';
          }
          return 'rarity';

        default:
          return undefined;
      }
    },

    toggleDisplay() {
      this.display = this.nextDisplay;
    },
  },
};
</script>

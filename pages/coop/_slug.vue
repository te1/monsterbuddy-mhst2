<template>
  <div v-if="coopQuest">
    <AppTopBar
      :heading="formatCoopQuest(coopQuest)"
      showBack
      backFallback="/coop/"
    />

    <AppFloatingButton
      v-if="fabVisible"
      :title="fabTitle"
      @click="toggleDisplay"
    >
      <FaIcon :icon="fabIcon" />
    </AppFloatingButton>

    <main>
      <ul class="space-y-5">
        <li v-for="(group, key) in items" :key="key">
          <div
            v-if="isGrouped"
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'map-marker-alt']"
            />

            <div class="font-semibold mb-1" v-text="key" />
          </div>

          <div
            class="mt-1 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <MonsterSmartListItem
              v-for="item in group"
              :key="item.monster.no"
              :monster="item.monster"
              :display="display"
              :mode="mode"
              :ticket="getTicket(item.quest)"
            />
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import { coopQuestsBySlug, getMonstersByCoopQuest } from '~/services/data';
import { makeHead, formatCoopQuest } from '~/services/utils';

export default {
  name: 'PageCoopDetails',

  data() {
    return {
      coopQuest: coopQuestsBySlug[this.$route.params.slug],
      display: null,
    };
  },

  head() {
    if (this.coopQuest == null) {
      return;
    }

    let description = `${this.coopQuest.name} is a `;

    if (this.coopQuest.rarity) {
      description += `${this.coopQuest.rarity} star rarity `;
    }

    if (this.coopQuest.type) {
      description += `${this.coopQuest.type} type `;
    }

    description += `co-op quest`;

    if (this.coopQuest.type === 'explore') {
      description += `. You can find ${this.monsterCount} different monstie eggs inside.`;
    }

    return makeHead({
      title: `Monster Buddy - ${this.coopQuest.name} In Monster Hunter Stories 2`,
      description,
      canonical: `https://mhst2.monsterbuddy.app/coop/${this.coopQuest.slug}/`,
    });
  },

  computed: {
    items() {
      let monsters = getMonstersByCoopQuest(this.coopQuest.name);

      let questLocation;

      let items = _.map(monsters, (monster) => {
        questLocation = _.find(monster.locations, {
          type: 'coopQuest',
          main: this.coopQuest.name,
        });

        return {
          monster,
          quest: questLocation,
        };
      });

      items = _.sortBy(items, (item) => item.quest.finalNest);

      return _.groupBy(items, (item) =>
        item.quest?.finalNest ? 'Final Nest' : 'Normal Nest'
      );
    },

    isGrouped() {
      return this.coopQuest.type === 'explore';
    },

    monsterCount() {
      return _.flatten(_.values(this.items)).length;
    },

    displays() {
      switch (this.coopQuest.type) {
        case 'explore':
          return ['egg', 'monstie'];

        case 'time':
          return ['monster'];

        default:
          return [];
      }
    },

    nextDisplay() {
      let currentIndex = _.indexOf(this.displays, this.display);
      let nextIndex = (currentIndex + 1) % this.displays.length;

      return this.displays[nextIndex];
    },

    mode() {
      switch (this.display) {
        case 'monster':
          return 'combat';

        case 'monstie':
        case 'egg':
          return 'rarity';

        default:
          return undefined;
      }
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
    if (this.coopQuest == null) {
      this.$nuxt.error({
        statusCode: 404,
        message: 'This page could not be found',
      });
    } else {
      this.toggleDisplay();
    }
  },

  methods: {
    formatCoopQuest,

    getTicket(quest) {
      if (quest.srTicket) {
        return 'sr';
      }
      return null;
    },

    toggleDisplay() {
      this.display = this.nextDisplay;
    },
  },
};
</script>

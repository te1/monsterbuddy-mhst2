<template>
  <div v-if="monster">
    <AppTopBar :heading="monster.name" showBack backFallback="/monsters/" />

    <client-only>
      <Mhst3Banner class="mb-3" />
    </client-only>

    <main class="grid gap-3 grid-cols-1 lg:grid-cols-2">
      <MonsterInfoCard class="box px-4 py-2 order-1" :monster="monster" />

      <MonsterCombatCard class="box px-4 py-2 order-2" :monster="monster" />

      <MonstieEggCard
        v-if="monster.hatchable"
        class="box px-1 py-2 order-3"
        :monster="monster"
      />

      <MonsterImageCard
        class="box px-4 py-2 order-4 lg:order-5"
        :monster="monster"
      />

      <MonstieInfoCard
        v-if="monster.hatchable"
        class="box px-4 py-2 order-5 lg:order-4"
        :monster="monster"
      />

      <MonstieStatsCard
        v-if="monster.hatchable"
        class="box px-4 py-2 order-6"
        :monster="monster"
      />

      <MonsterRelatedCard class="box px-4 py-2 order-7" :monster="monster" />
    </main>
  </div>
</template>

<script>
import { monstersBySlug, isDeviant } from '~/services/data';
import { makeHead } from '~/services/utils';

export default {
  name: 'PageMonsterDetails',

  data() {
    return {
      monster: monstersBySlug[this.$route.params.slug],
    };
  },

  head() {
    if (this.monster == null) {
      return;
    }

    let description = `${this.monster.name} is a ${this.monster.rarity} star rarity `;

    if (this.monster.hatchable) {
      description += 'hatchable ';
    }

    if (isDeviant(this.monster)) {
      description += 'Deviant ';
    }

    description += `${this.monster.genus} found in ${this.monster.habitat}.`;

    return makeHead({
      title: `Monster Buddy - ${this.monster.name} In Monster Hunter Stories 2`,
      description,
      canonical: `https://mhst2.monsterbuddy.app/monsters/${this.monster.slug}/`,
      image: `https://mhst2.monsterbuddy.app/images/monsters-small/${this.monster.name}.webp`,
      imageAlt: this.monster.name,
    });
  },

  computed: {
    history() {
      return this.$useHistoryStore();
    },
  },

  created() {
    if (this.monster == null) {
      this.$nuxt.error({
        statusCode: 404,
        message: 'This page could not be found',
      });
    } else {
      this.history.addRecentMonster(this.monster.slug);
    }
  },
};
</script>

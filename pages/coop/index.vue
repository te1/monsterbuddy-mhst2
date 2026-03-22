<template>
  <div>
    <AppTopBar heading="Co-Op Quests" />

    <main>
      <ul class="space-y-8">
        <li v-for="(quests, type) in coopQuests" :key="type">
          <div
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'exclamation']"
            />

            <div class="font-semibold mb-1">
              {{ formatCoopQuestType(type) }}
            </div>
          </div>

          <div class="box mt-1 overflow-hidden">
            <div v-for="(quest, index) in quests" :key="quest.slug">
              <div
                v-if="index > 0"
                class="border-t border-gray-300 dark:border-cool-600"
              />

              <NuxtLink
                :to="`/coop/${quest.slug}/`"
                class="box-link block px-6 py-2 font-semibold"
              >
                <span class="w-48 inline-block">
                  {{ quest.name }}
                </span>
                <span> ★{{ quest.rarity }} </span>
              </NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<script>
import _ from 'lodash';
import { deepFreeze, makeHead, formatCoopQuestType } from '~/services/utils';
import { coopQuests } from '~/services/data';

export default {
  name: 'PageCoop',

  data() {
    return {
      coopQuests: deepFreeze(_.groupBy(coopQuests, 'type')),
    };
  },

  head() {
    return makeHead({
      title:
        'Monster Buddy - Co-Op Quest List (Dens) For Monster Hunter Stories 2',
      description:
        'Overview of co-op missions and list of eggs you can find in the different dens',
      canonical: 'https://mhst2.monsterbuddy.app/coop/',
    });
  },

  methods: {
    formatCoopQuestType,
  },
};
</script>

<template>
  <div>
    <AppTopBar heading="Riding Actions" />

    <main>
      <ul class="space-y-8">
        <li v-for="(actions, type) in ridingActions" :key="type">
          <div
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'exclamation']"
            />

            <div class="font-semibold mb-1">
              {{ formatRidingActionType(type) }}
            </div>
          </div>

          <div class="box mt-1 overflow-hidden">
            <div v-for="(action, index) in actions" :key="action.slug">
              <div
                v-if="index > 0"
                class="border-t border-gray-300 dark:border-cool-600"
              />

              <NuxtLink
                :to="`/riding-actions/${action.slug}/`"
                class="box-link block px-6 py-2 font-semibold"
              >
                {{ action.name }}
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
import { deepFreeze, makeHead, formatRidingActionType } from '~/services/utils';
import { sortedRidingActions } from '~/services/data';

export default {
  name: 'PageRidingActions',

  data() {
    return {
      ridingActions: deepFreeze(_.groupBy(sortedRidingActions, 'type')),
    };
  },

  head() {
    return makeHead({
      title: 'Monster Buddy - Riding Actions In Monster Hunter Stories 2',
      description:
        'Overview of all riding actions and list of monsties that can learn them',
      canonical: 'https://mhst2.monsterbuddy.app/riding-actions/',
    });
  },

  methods: {
    formatRidingActionType,
  },
};
</script>

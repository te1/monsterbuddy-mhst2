<template>
  <div>
    <AppTopBar heading="Catavan Stands" />

    <main>
      <ul class="space-y-8">
        <li v-for="(stands, zone) in catavanStands" :key="zone">
          <div
            class="sticky top-12 z-10 flex items-center -mx-1 px-1 -mt-3 -mb-1 py-1 border-t bg-gray-300 border-gray-300 dark:bg-cool-700 dark:border-cool-700"
          >
            <FaIcon
              class="!w-6 text-gray-500 dark:text-cool-400"
              :icon="['fas', 'map-marker-alt']"
            />

            <div class="font-semibold mb-1">
              {{ zone }}
            </div>
          </div>

          <div class="box mt-1 overflow-hidden">
            <div
              v-for="(catavanStand, index) in stands"
              :key="catavanStand.slug"
            >
              <div
                v-if="index > 0"
                class="border-t border-gray-300 dark:border-cool-600"
              />

              <NuxtLink
                :to="`/catavan-stands/${catavanStand.slug}/`"
                class="box-link block px-6 py-2 font-semibold"
              >
                {{ catavanStand.name }}
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
import { deepFreeze, makeHead } from '~/services/utils';
import { catavanStands } from '~/services/data';

export default {
  name: 'PageCatavanStands',

  data() {
    return {
      catavanStands: deepFreeze(_.groupBy(catavanStands, 'zone')),
    };
  },

  head() {
    return makeHead({
      title:
        'Monster Buddy - Catavan Stand Fast Travel List For Monster Hunter Stories 2',
      description:
        'Overview of catavan stand fast travel locations and list of monsters you will find there',
      canonical: 'https://mhst2.monsterbuddy.app/catavan-stands/',
    });
  },
};
</script>

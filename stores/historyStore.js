import _ from 'lodash';
import { defineStore } from 'pinia';
import useMonsterFilter from './monsterFilter';
import useMonstieFilter from './monstieFilter';
import useEggFilter from './eggFilter';
import {
  monsters,
  monstersBySlug,
  monsties,
  getMonstersByHatchable,
} from '~/services/data';
import storage from '~/services/storage';

const storageKeyRecentMonsterSlugs = 'history.recentMonsterSlugs';
const storageKeyPinnedMonsterSlugs = 'history.pinnedMonsterSlugs';
const storageKeyPinnedMonstieSlugs = 'history.pinnedMonstieSlugs';
const storageKeyPinnedEggSlugs = 'history.pinnedEggSlugs';
const storageKeyMhst1Banner = 'history.mhst1Banner';
const storageKeyMhst3Banner = 'history.mhst3Banner';

function pull(array, item) {
  // _.pull doesn't work with vue 2.x reactivity

  let index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

const useHistoryStore = defineStore({
  id: 'history',

  state() {
    return {
      lastList: null,
      recentMonsterSlugs: [],
      pinnedMonsterSlugs: [],
      pinnedMonstieSlugs: [],
      pinnedEggSlugs: [],
      showMhst1Banner: true,
      showMhst3Banner: true,
    };
  },

  getters: {
    lastListStore() {
      switch (this.lastList) {
        case 'monsters':
          return useMonsterFilter();

        case 'monsties':
          return useMonstieFilter();

        case 'eggs':
          return useEggFilter();

        default:
          return null;
      }
    },

    lastListMode() {
      return this.lastListStore?.mode;
    },

    shouldShowMonstie: (state) => (monster) => {
      return state.lastList === 'monsties' && monster.hatchable;
    },

    shouldShowEgg: (state) => (monster) => {
      return state.lastList === 'eggs' && monster.hatchable;
    },

    lastListModeSmart: (state) => (monster) => {
      let showMonstie = state.shouldShowMonstie(monster);
      let showEgg = state.shouldShowEgg(monster);

      return state.listModeSmart(showMonstie, showEgg);
    },

    listModeSmart:
      (state) =>
      (showMonstie, showEgg, mode = null) => {
        let store;

        if (showMonstie) {
          store = useMonstieFilter();
        } else if (showEgg) {
          store = useEggFilter();
        } else {
          store = useMonsterFilter();
        }

        mode = mode ?? store.mode;

        if (_.includes(store.autoSwitchModes, mode)) {
          return mode;
        }
        return undefined;
      },

    recentMonsters() {
      return _.map(this.recentMonsterSlugs, (slug) => {
        return monstersBySlug[slug];
      });
    },

    hasRecentMonsters() {
      return !!this.recentMonsters.length;
    },

    recentMonsties() {
      return getMonstersByHatchable(true, this.recentMonsters);
    },

    hasRecentMonsties() {
      return !!this.recentMonsties.length;
    },

    pinnedMonsters() {
      return _.filter(monsters, (monster) => {
        return _.includes(this.pinnedMonsterSlugs, monster.slug);
      });
    },

    hasPinnedMonsters() {
      return !!this.pinnedMonsters.length;
    },

    isMonsterPinned: (state) => (slug) => {
      return _.includes(state.pinnedMonsterSlugs, slug);
    },

    pinnedMonsties() {
      return _.filter(monsties, (monster) => {
        return _.includes(this.pinnedMonstieSlugs, monster.slug);
      });
    },

    hasPinnedMonsties() {
      return !!this.pinnedMonsties.length;
    },

    isMonstiePinned: (state) => (slug) => {
      return _.includes(state.pinnedMonstieSlugs, slug);
    },

    pinnedEggs() {
      return _.filter(monsties, (monster) => {
        return _.includes(this.pinnedEggSlugs, monster.slug);
      });
    },

    hasPinnedEggs() {
      return !!this.pinnedEggs.length;
    },

    isEggPinned: (state) => (slug) => {
      return _.includes(state.pinnedEggSlugs, slug);
    },
  },

  actions: {
    loadFromStorage() {
      this.recentMonsterSlugs = storage.get(
        storageKeyRecentMonsterSlugs,
        this.recentMonsterSlugs
      );
      this.pinnedMonsterSlugs = storage.get(
        storageKeyPinnedMonsterSlugs,
        this.pinnedMonsterSlugs
      );
      this.pinnedMonstieSlugs = storage.get(
        storageKeyPinnedMonstieSlugs,
        this.pinnedMonstieSlugs
      );
      this.pinnedEggSlugs = storage.get(
        storageKeyPinnedEggSlugs,
        this.pinnedEggSlugs
      );
      this.showMhst1Banner = storage.get(
        storageKeyMhst1Banner,
        this.showMhst1Banner
      );
      this.showMhst3Banner = storage.get(
        storageKeyMhst3Banner,
        this.showMhst3Banner
      );
    },

    addRecentMonster(slug) {
      const maxRecentItems = 25;

      pull(this.recentMonsterSlugs, slug);

      while (this.recentMonsterSlugs.length >= maxRecentItems) {
        this.recentMonsterSlugs.pop();
      }

      this.recentMonsterSlugs.unshift(slug);

      storage.set(storageKeyRecentMonsterSlugs, this.recentMonsterSlugs);
    },

    togglePinnedMonster(slug) {
      if (this.isMonsterPinned(slug)) {
        pull(this.pinnedMonsterSlugs, slug);
      } else {
        this.pinnedMonsterSlugs.unshift(slug);
      }

      storage.set(storageKeyPinnedMonsterSlugs, this.pinnedMonsterSlugs);
    },

    togglePinnedMonstie(slug) {
      if (this.isMonstiePinned(slug)) {
        pull(this.pinnedMonstieSlugs, slug);
      } else {
        this.pinnedMonstieSlugs.unshift(slug);
      }

      storage.set(storageKeyPinnedMonstieSlugs, this.pinnedMonstieSlugs);
    },

    togglePinnedEgg(slug) {
      if (this.isEggPinned(slug)) {
        pull(this.pinnedEggSlugs, slug);
      } else {
        this.pinnedEggSlugs.unshift(slug);
      }

      storage.set(storageKeyPinnedEggSlugs, this.pinnedEggSlugs);
    },

    hideMhst1Banner() {
      this.showMhst1Banner = false;

      storage.set(storageKeyMhst1Banner, this.showMhst1Banner);
    },

    hideMhst3Banner() {
      this.showMhst3Banner = false;

      storage.set(storageKeyMhst3Banner, this.showMhst3Banner);
    },
  },
});

export default useHistoryStore;

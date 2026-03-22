<template>
  <div
    v-show="show || force"
    class="note flex gap-3 bg-[#fef9c3] dark:bg-[#eab308]/25 px-4 py-3"
  >
    <div class="flex-1">
      <a class="link" href="https://monsterbuddy.app" target="_blank">
        Monster Buddy
      </a>
      has been updated for Monster Hunter Stories 3: Twisted Reflection!
    </div>

    <div v-if="!force" class="-mt-3 -mr-3">
      <AppIconButton
        :icon="['fas', 'times']"
        title="Don't show this anymore"
        class="text-xl"
        @click="hide"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Mhst3Banner',

  props: {
    force: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    history() {
      return this.$useHistoryStore();
    },

    show() {
      return this.history.showMhst3Banner;
    },
  },

  methods: {
    hide() {
      this.history.hideMhst3Banner();
    },
  },
};
</script>

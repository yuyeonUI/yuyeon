<script setup lang="ts">
import PrevSvg from "@/assets/prev.svg";
import VueSvgRaw from '@/assets/vue.svg?raw';
import { ref } from "vue";
import { YIconPageControl } from "yuyeon/components";
// import { useDate } from "yuyeon/composables";

// const dateUtil = useDate();

const month = ref(11);
const year = ref(2023);
const range = ref([]);

function onClickPage(dir: number) {
  const change = month.value + dir;
  if (change > 11) {
    year.value += 1;
    month.value = 0;
  } else if (change < 0) {
    year.value -= 1;
    month.value = 11;
  } else {
    month.value = change;
  }
}
</script>

<template>
  <div class="pa-10 d-flex">
    <div>
      <y-icon :icon="VueSvgRaw"></y-icon>
      <y-icon :icon="YIconPageControl" :size="24"></y-icon>
      <y-icon icon="$pageControl"></y-icon>
      <y-icon
        :icon="{
          alias: '$pageControl',
          iconProps: { type: 'first' },
        }"
      ></y-icon>
      <y-icon :icon="PrevSvg"></y-icon>
      <y-icon icon="$prev"></y-icon>
    </div>
    <div class="mh-2">
      <y-card class="pa-2">
        <y-date-picker></y-date-picker>
      </y-card>
    </div>
    <div class="mh-2">
      <y-card class="pa-2">
        <y-date-picker multiple range></y-date-picker>
      </y-card>
    </div>
    <div v-if="false" class="mh-2">
      <y-card class="pa-2">
        <header class="d-flex pa-2">
          <div class="flex-spacer"></div>
          <y-button variation="text" style="width: 32px">
            <YIconPageControl
              type="prev"
              class="icon-24"
              @click="onClickPage(-1)"
            ></YIconPageControl>
          </y-button>
          <y-button variation="text" style="width: 32px">
            <YIconPageControl
              type="next"
              class="icon-24"
              @click="onClickPage(1)"
            ></YIconPageControl>
          </y-button>
        </header>
        <y-date-calendar
          v-model="range"
          v-model:year="year"
          v-model:month="month"
          color="primary"
          multiple
          range
        ></y-date-calendar>
      </y-card>
    </div>
  </div>
</template>

<style scoped></style>

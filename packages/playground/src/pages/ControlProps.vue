<script setup lang="ts">
import VueSvg from "@/assets/vue.svg?component";
import { ref, shallowRef } from "vue";
import { useTheme } from "yuyeon";

const showDialog = ref(false);

const loadingButton = ref(false);

function onClickLoadingButton() {
  loadingButton.value = true;
  setTimeout(() => {
    loadingButton.value = false;
  }, 5000);
}

const progress0 = ref(40);
const progress0Reverse = shallowRef(false);
const chipsSectionIndeterminate = shallowRef(false);

const dropdownItems = [
  {
    key: "cut",
    text: "잘라내기",
  },
  {
    key: "copy",
    text: "복사하기",
  },
];
const theme = useTheme();
function toggleThemeMode() {
  console.log(theme);
  if (theme) {
    theme.scheme === "auto"
      ? (theme.scheme = "light")
      : theme.scheme === "light"
      ? (theme.scheme = "dark")
      : (theme.scheme = "auto");
  }
}
</script>

<template>
  <div class="pa-4">
    <section class="pv-2" style="height: 200px">
      <y-card class="h-100 contain-paint">
        <y-card-header> BUTTONS </y-card-header>
        <y-card-body class="pt-4">
          <div class="d-flex" style="gap: 4px">
            <y-button loading outlined> 계속 로딩 </y-button>
            <y-button
                @click="onClickLoadingButton"
                :loading="loadingButton"
                outlined
                filled
                color="primary"
            >
              <VueSvg
                  v-if="!loadingButton"
                  class="mr-2"
                  style="width: 20px; height: 20px"
              ></VueSvg>
              새로고침
            </y-button>
            <y-button @click="toggleThemeMode" style="width: 130px">
              THEME: {{ theme.scheme }}
            </y-button>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <section class="py-2">
      <y-card class="pa-2">
        <div class="d-flex pt-2" style="gap: 8px">
          <div style="flex: 0 0 50%">
            <y-field-input theme="dark" variation="outlined"></y-field-input>
          </div>
          <y-field-input></y-field-input>
        </div>
      </y-card>
    </section>
    <section class="pv-2" style="height: 300px">
      <y-card class="h-100 contain-paint">
        <y-progress-bar
          :reverse="progress0Reverse"
          :value="progress0"
        ></y-progress-bar>
        <y-card-header> LAYER BASE </y-card-header>
        <y-card-body class="pt-4">
          <div class="d-flex align-center" style="gap: 8px">
            <y-menu position="bottom" offset="8" height="80">
              <template #base="{ props: menuProps }">
                <y-tooltip position="top">
                  <template #base="{ props: tooltipProps }">
                    <y-button
                      class="mr-2"
                      v-bind="{ ...tooltipProps, ...menuProps }"
                    >
                      MENU
                    </y-button>
                  </template>
                  <span>menu + tooltip</span>
                </y-tooltip>
              </template>
              <y-card>
                <y-card-body> YMenu! </y-card-body>
              </y-card>
            </y-menu>
            <!-- -->
            <y-dialog
              v-model="showDialog"
              :dialog-classes="['playground-dialog--showcase']"
            >
              <template #base>
                <y-button variation="outlined" class="mr-2"> DIALOG </y-button>
              </template>
              <y-card style="width: 400px">
                <div
                  style="
                    width: 40px;
                    height: 40px;
                    position: absolute;
                    top: -20px;
                    left: -20px;
                    background-color: #0c5db9;
                    color: white;
                  "
                >
                  TS
                </div>
                <y-card-header>
                  <div class="y-card-title">당신은 타입스크립트 장인</div>
                </y-card-header>
                <y-card-body class="pv-8">Sure?</y-card-body>
                <y-card-footer style="justify-content: flex-end">
                  <y-button @click="showDialog = false">close</y-button>
                </y-card-footer>
              </y-card>
            </y-dialog>
            <!--  -->
            <y-tooltip :position="'top'">
              <template #base>
                <y-chip>TOOLTIP</y-chip>
              </template>
              <span>어서와 처음이지?</span>
            </y-tooltip>
            <!--  -->
            <y-dropdown
              :items="dropdownItems"
              class="ml-2 elevation-1"
              variation="filled"
              color="primary"
              style="width: 160px"
            >
              드롭다운
            </y-dropdown>
            <!--  -->
            <y-select :items="dropdownItems" offset="8"></y-select>
          </div>
          <div class="mv-3">
            <y-select :items="dropdownItems" variation="outlined"></y-select>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <section class="pv-2" style="height: 200px">
      <y-card class="h-100 contain-paint">
        <y-progress-bar
          reverse
          :indeterminate="chipsSectionIndeterminate"
        ></y-progress-bar>
        <y-card-header> CHIPS </y-card-header>
        <y-card-body class="pt-4">
          <div class="pv-4">
            <y-chip small class="mr-2 font-weight-700">LABEL</y-chip>
            <y-chip :color="'#1489ce'" class="mr-2">CHIP</y-chip>
            <y-chip
              :color="'#1489ce'"
              class="mr-2"
              @click="chipsSectionIndeterminate = !chipsSectionIndeterminate"
              >INDETERMINATE Toggle</y-chip
            >
          </div>
        </y-card-body>
      </y-card>
    </section>
  </div>
</template>

<style lang="scss">
.y-table {
  height: 100%;
}
.playground-dialog--showcase {
  filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.4));
}
</style>

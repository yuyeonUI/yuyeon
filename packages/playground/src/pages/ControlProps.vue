<script setup lang="ts">
import VueSvg from "@/assets/vue.svg?component";
import AlertCircleOutlineSvg from '@/assets/alert-circle-outline.svg?component';

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

const innerMenu = shallowRef(false);

function onCloseMenuIn() {
  return innerMenu.value;
}
</script>

<template>
  <div class="pa-4">
    <y-alert class="mb-4">
      <template #title>
        Alert!!
      </template>
      <template #default>
        Alert Alert Alert Alert!
      </template>
    </y-alert>
    <section class="py-2">
      <y-card>
        <y-card-header>
          ALERTS
        </y-card-header>
        <y-card-body class="pv-4" >
          <div class="d-flex flex-wrap" style="gap: 10px;">
            <y-alert :semantic="'info'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg style="width: 24px; height: 24px"></AlertCircleOutlineSvg>
              </template>
              다음 안내 사항을 따르시기 바랍니다. 달이 떴다고 전화를 주시다니요
              이 밤 너무나 신나고 근사해요
              내 마음에도 생전 처음 보는
              환한 달이 떠오르고
              산 아래 작은 마을이 그려집니다.
              <template #trailing>
                <y-button>닫기</y-button>
              </template>
            </y-alert>
            <y-alert :semantic="'warning'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg style="width: 24px; height: 24px"></AlertCircleOutlineSvg>
              </template>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            </y-alert>
            <y-alert :semantic="'error'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg style="width: 24px; height: 24px"></AlertCircleOutlineSvg>
              </template>
              <template #title>
                Alert!!
              </template>
              자정 넘으면
              낯설음도 뼈아픔도 다 설원인데
              단풍잎 같은 몇 잎의 차장을 달고
              밤열차는 또 어디로 흘러가는지
            </y-alert>
            <y-alert :semantic="'success'" style="width: 40%">
              별 하나에 추억과
              별 하나에 사랑과
              별 하나에 쓸쓸함과
              별 하나에 동경과
              별 하나에 시와
              별 하나에 어머니, 어머니,
            </y-alert>
          </div>
        </y-card-body>
      </y-card>
    </section>
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
        <y-card-header>INPUTS</y-card-header>
        <y-card-body class="pv-4">
          <div class="d-flex gap-2">
            <y-checkbox :label="'체크박스'"></y-checkbox>
            <y-field-input
              label="이름"
              placeholder="이름을 입력하세요"
              required
            ></y-field-input>
            <y-field-input
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
            >
            </y-field-input>
            <y-field-input
                label="ceramic"
                ceramic
                placeholder="ceramic"
                required
            ></y-field-input>
          </div>
          <div class="d-flex pt-8 gap-2">
            <y-field-input label="floating" floating></y-field-input>
            <y-field-input
              label="floating"
              floating
              placeholder="floating with placeholder"
            ></y-field-input>
          </div>
        </y-card-body>
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
            <y-menu
              position="right top"
              offset="8"
              height="80"
              eager
              open-on-hover
              :close-condition="onCloseMenuIn"
              prevent-close-bubble
            >
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
                <y-card-body>
                  <y-menu v-model="innerMenu" height="80">
                    <template #base>
                      <y-button>hello</y-button>
                    </template>
                    <y-card>
                      <div>menu 1</div>
                    </y-card>
                  </y-menu>

                  <y-menu height="80" open-on-hover>
                    <template #base>
                      <y-button>prevent bubble</y-button>
                    </template>
                    <y-card>
                      <div>menu 0</div>
                    </y-card>
                  </y-menu>
                </y-card-body>
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
                <y-card-body class="pv-8">
                  Sure?
                  <y-menu>
                    <template #base>
                      <y-button>hello</y-button>
                    </template>
                    <y-card>
                      <div>menu 1</div>
                    </y-card>
                  </y-menu>
                </y-card-body>
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
            <y-select
              :items="dropdownItems"
              :label="'y-select'"
              offset="8"
            ></y-select>
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
.gap-2 {
  gap: 8px;
}
</style>

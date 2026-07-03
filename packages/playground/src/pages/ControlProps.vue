<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { useTheme } from 'yuyeon';
import AlertCircleOutlineSvg from '@/assets/alert-circle-outline.svg?component';
import VueSvg from '@/assets/vue.svg?component';

const outlinedFieldInput = ref('');
const ipv4 = ref('192.168.1.1');
const displayInput = ref(0);

const loadingButton = ref(false);

function onClickLoadingButton() {
  loadingButton.value = true;
  setTimeout(() => {
    loadingButton.value = false;
  }, 5000);
}


const chipsSectionIndeterminate = shallowRef(false);

const theme = useTheme();

function toggleThemeMode() {
  console.log(theme);
  if (theme) {
    let to = 'light' as 'dark' | 'light' | 'auto';
    switch (theme.scheme.value) {
      case 'dark':
        to = 'auto';
        break;
      case 'light':
        to = 'dark';
        break;
      case 'auto':
      default:
        to = 'light';
    }

    theme.scheme.value = to;
  }
}

const switchInput = shallowRef(false);

const tab = ref();

const textarea = ref('content');
const validSelectValue = ref();
const progress1 = shallowRef(50);

function onClickFieldWrap() {
  console.log('activate my trap');
}
</script>

<template>
  <div class="pa-4">
    <y-alert class="mb-4">
      <template #title> Alert!!</template>
      <template #default> Alert Alert Alert Alert!</template>
    </y-alert>
    <section class="mv-2">
      <y-card class="pa-2">
        <y-card-header>VALIDATION</y-card-header>
        <y-card-body class="pv-4">
          <div class="d-flex gap-2">
            <y-switch v-model="switchInput"></y-switch>
            <y-field-input
              v-model="outlinedFieldInput"
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
              :validators="[(v: string) => !!v || 'REQUIRED']"
            >
            </y-field-input>
            <y-field-input
              v-model="displayInput"
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
              :validators="[(v: string) => !!v || 'REQUIRED']"
              :display-text="(v: string) => `${v}MHz`"
            >
            </y-field-input>
            <y-select
              v-model="validSelectValue"
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
              :items="[
                { text: 'one', value: 1 },
                { text: 'two', value: 2 },
              ]"
              :validators="[(v: string) => !!v || 'REQUIRED']"
            >
            </y-select>
            <y-select
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
              :items="[
                { text: '가지', value: 1 },
                { text: '나무', value: 2 },
              ]"
              :validators="[(v: number) => v === 1 || 'REQUIRED']"
            >
            </y-select>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <!--  Alerts  -->
    <section class="pv-2">
      <y-card>
        <y-card-header> ALERTS</y-card-header>
        <y-card-body class="pv-4">
          <div class="d-flex flex-wrap" style="gap: 10px">
            <y-alert :semantic="'info'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg
                  style="width: 24px; height: 24px"
                ></AlertCircleOutlineSvg>
              </template>
              다음 안내 사항을 따르시기 바랍니다. 달이 떴다고 전화를 주시다니요
              이 밤 너무나 신나고 근사해요 내 마음에도 생전 처음 보는 환한 달이
              떠오르고 산 아래 작은 마을이 그려집니다.
              <template #trailing>
                <y-button>닫기</y-button>
              </template>
            </y-alert>
            <y-alert :semantic="'warning'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg
                  style="width: 24px; height: 24px"
                ></AlertCircleOutlineSvg>
              </template>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </y-alert>
            <y-alert :semantic="'error'" style="width: 40%">
              <template #leading>
                <AlertCircleOutlineSvg
                  style="width: 24px; height: 24px"
                ></AlertCircleOutlineSvg>
              </template>
              <template #title> Alert!!</template>
              자정 넘으면 낯설음도 뼈아픔도 다 설원인데 단풍잎 같은 몇 잎의
              차장을 달고 밤열차는 또 어디로 흘러가는지
            </y-alert>
            <y-alert
              :semantic="'success'"
              variation="outlined"
              style="width: 40%"
            >
              별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함과 별 하나에
              동경과 별 하나에 시와 별 하나에 어머니, 어머니,
            </y-alert>
            <y-alert
              :semantic="'success'"
              variation="filled, outlined"
              color="transparent"
              :text-color="'#03838d'"
              style="width: 40%"
            >
              별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함과 별 하나에
              동경과 별 하나에 시와 별 하나에 어머니, 어머니,
            </y-alert>
            <y-alert :color="'#6f038d'" variation="outlined" style="width: 40%">
              별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함과 별 하나에
              동경과 별 하나에 시와 별 하나에 어머니, 어머니,
            </y-alert>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <!--  Tabs  -->
    <section class="pv-2" style="height: 200px">
      <y-card class="h-100 contain-paint">
        <y-card-header
        >
          <y-tabs
            v-model="tab"
            :items="[
              { text: '첫번째', value: 'first' },
              { text: '두번째', value: 'second' },
            ]"
          ></y-tabs
          >
        </y-card-header>
        <y-card-body class="pt-4">
          <y-tabs
            v-model="tab"
            :items="[
              { text: '첫번째', value: 'first', to: '/first' },
              { text: '두번째', value: 'second', to: '/second' },
            ]"
          ></y-tabs>
          <router-view></router-view>
          <span v-if="$route.path === '/'">
            Tab not selected yet. Consider using vue-router redirect.
          </span>
        </y-card-body>
      </y-card>
    </section>
    <!--  BUTTONS  -->
    <section class="pv-2" style="height: 200px">
      <y-card class="h-100 contain-paint">
        <y-card-header> BUTTONS</y-card-header>
        <y-card-body class="pt-4">
          <div class="d-flex" style="gap: 4px">
            <y-button loading outlined> 계속 로딩</y-button>
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
    <y-button variation="filled" style="width: 20dvw; height: 100px;">styled</y-button>
    <!--  Inputs  -->
    <section class="pv-2">
      <y-card class="pa-2">
        <y-card-header>INPUTS</y-card-header>
        <y-card-body class="pv-4">
          <div class="d-flex gap-2">
            <y-checkbox :label="'체크박스'"></y-checkbox>
            <div
              class="pa-4"
              style="border: 1px solid royalblue"
              @click="onClickFieldWrap"
            >
              <y-field-input
                label="이름"
                placeholder="이름을 입력하세요"
                required
                @click.stop.prevent
              ></y-field-input>
            </div>
            <y-field-input
              v-model="outlinedFieldInput"
              variation="outlined"
              label="label slot"
              placeholder="variation outlined"
            >
              <template #helper-text>
                {{ 'HELPER TEXT text' }}
              </template>
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
          <div class="d-flex pt-8 gap-2">
            <y-textarea
              v-model="textarea"
              :label="'TEXTAREA'"
              rows="10"
            ></y-textarea>
          </div>
          <div class="d-flex pt-8 gap-2">
            <y-ipv4-field v-model="ipv4" variation="outlined" label="IPv4"></y-ipv4-field>
          </div>
        </y-card-body>
      </y-card>
    </section>
    <!--  CHIPS, progress  -->
    <section class="pv-2" style="height: 200px">
      <y-card class="h-100 contain-paint">
        <y-progress-ring :model-value="progress1" :size="64" />
        <y-progress-bar
          :value="progress1"
          reverse
          no-rewind-transition
          :indeterminate="chipsSectionIndeterminate"
        ></y-progress-bar>
        <y-card-header> CHIPS</y-card-header>
        <y-card-body class="pt-4">
          <div class="pv-4">
            <y-chip small class="mr-2 font-weight-700">LABEL</y-chip>
            <y-chip :color="'#1489ce'" class="mr-2">CHIP</y-chip>
            <y-chip
              :color="'#1489ce'"
              class="mr-2"
              @click="chipsSectionIndeterminate = !chipsSectionIndeterminate"
            >INDETERMINATE Toggle
            </y-chip
            >
            <y-badge content="3">
              <y-chip small class="mr-2 font-weight-700">BADGE CHIP</y-chip>
            </y-badge>
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

<script setup lang="ts">
import { mergeProps, ref, shallowRef } from 'vue';

const noBaseMenu = shallowRef(false);
const showDialog = shallowRef(false);
const openDrawer = shallowRef(false);
const progress0 = ref(40);
const progress0Reverse = shallowRef(false);
const defaultSelectV = ref([]);
const innerMenu = shallowRef(false);
const focusTrapTest = shallowRef('');
const parentDialog = shallowRef(false);
const childDialog = shallowRef(false);
const maximizedDialog = shallowRef(false);
const comboboxValue = shallowRef<string | null>(null);
const multipleComboboxValue = shallowRef<string[]>(['apple', 'banana']);
const customChipComboboxValue = shallowRef<string[]>(['grape', 'strawberry']);

const comboboxItems = [
  { value: 'apple', text: '사과' },
  { value: 'banana', text: '바나나' },
  { value: 'grape', text: '포도' },
  { value: 'strawberry', text: '딸기' },
  { value: 'blueberry', text: '블루베리' },
  { value: 'watermelon', text: '수박' },
];

const dropdownItems = [
  {
    key: 'cut',
    text: '잘라내기',
  },
  {
    key: 'copy',
    text: '복사하기',
  },
];

const selectItems = [
  {
    key: '1',
    text: '1',
  },
  {
    key: '2',
    text: '2',
  },
  {
    key: '3',
    text: '3',
  },
  {
    key: '4',
    text: '4',
  },
  {
    key: '5',
    text: '5',
  },
  {
    key: '6',
    text: '6',
  },
  {
    key: '7',
    text: '7',
  },
  {
    key: '8',
    text: '8',
  },
  {
    key: '9',
    text: '9',
  },
  {
    key: '10',
    text: '10',
  },
  {
    key: '11',
    text: '11',
  },
];

function onClickNoBaseMenu() {
  noBaseMenu.value = true;
}

function onClickOpenDrawer() {
  openDrawer.value = true;
}
</script>

<template>
  <div>
    <y-card class="pa-6">
      <section class="pv-2" style="height: 300px">
        <y-card class="h-100 contain-paint">
          <y-progress-bar
            :reverse="progress0Reverse"
            :value="progress0"
          ></y-progress-bar>
          <y-card-header> LAYER BASE</y-card-header>
          <y-card-body class="pt-4">
            <div class="d-flex align-center gap-2 flex-wrap">
              <y-button @click="onClickNoBaseMenu"> NoBase Menu</y-button>
              <y-menu v-model="noBaseMenu" :pivot="[300, 300]">
                <y-card>
                  <y-card-header></y-card-header>
                  <y-card-body> No Base & Pivot point</y-card-body>
                  <y-card-footer></y-card-footer>
                </y-card>
              </y-menu>
              <!-- select blank -->
              <y-select></y-select>
              <!-- drawer -->
              <y-button @click="onClickOpenDrawer()">Drawer</y-button>
              <y-drawer v-model="openDrawer" width="300">
                <y-card>
                  <y-card-header>
                    Drawer Header
                  </y-card-header>
                  <y-card-body>
                    Drawer Content
                  </y-card-body>
                </y-card>
              </y-drawer>
              <!-- dialog in menu -->
              <y-dialog
                v-model="showDialog"
                :dialog-classes="['playground-dialog--showcase']"
              >
                <template #base="{ props }">
                  <y-button variant="outlined" class="mr-2" v-bind="props"> DIALOG</y-button>
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
                        <div>
                          <y-field-input
                            v-model="focusTrapTest"
                            placeholder="No Trap!"
                          ></y-field-input>
                        </div>
                        <div>
                          <y-select :items="[1, 2, 3, 4]">
                            <template #menu>
                              <header>
                                <y-field-input placeholder="search" />
                              </header>
                              <div>
                                <y-list>
                                  <y-list-item v-for="_i in 3" :key="_i">
                                    {{ 'item' + _i }}
                                  </y-list-item>
                                </y-list>
                              </div>
                            </template>
                          </y-select>
                        </div>
                        <div>
                          <y-menu>
                            <template #base>
                              <y-button>
                                menu in menu
                              </y-button>
                            </template>
                            <y-card>
                              <h1>menu!</h1>
                            </y-card>
                          </y-menu>
                        </div>
                      </y-card>
                    </y-menu>
                  </y-card-body>
                  <y-card-footer style="justify-content: flex-end">
                    <y-button @click="showDialog = false">close</y-button>
                  </y-card-footer>
                </y-card>
              </y-dialog>
              <!-- dialog parent -->
              <y-dialog
                v-model="parentDialog"
                :dialog-classes="['playground-dialog--showcase']"
              >
                <template #base>
                  <y-button variant="filled" color="primary" class="mr-2">
                    DIALOG
                  </y-button>
                </template>
                <y-card style="width: 400px">
                  <y-card-body class="pv-8">
                    Sure?
                    <y-menu>
                      <template #base>
                        <y-button>hello</y-button>
                      </template>
                      <y-card>
                        <div>
                          <y-field-input
                            v-model="focusTrapTest"
                            placeholder="No Trap!"
                          ></y-field-input>
                        </div>
                      </y-card>
                    </y-menu>
                    <y-dialog v-model="childDialog">
                      <template #base>
                        <y-button>MORE DIALOG</y-button>
                      </template>
                      <y-card>
                        <y-card-header>
                          <div>DIALOG IN DIALOG</div>
                        </y-card-header>
                        <y-card-footer>
                          <y-button @click="childDialog = false">CLOSE</y-button>
                        </y-card-footer>
                      </y-card>
                    </y-dialog>
                  </y-card-body>
                  <y-card-footer style="justify-content: flex-end">
                    <y-button @click="parentDialog = false">close</y-button>
                  </y-card-footer>
                </y-card>
              </y-dialog>
              <!-- dialog max -->
              <y-dialog
                v-model="maximizedDialog"
                maximized
                :scrim="false"
                offset="56"
              >
                <template #base>
                  <y-button variant="outlined" color="secondary" class="mr-2">
                    MAXIMIZED DIALOG
                  </y-button>
                </template>
                <y-card>
                  <y-card-header>
                    <div class="y-card-title">SETTINGS</div>
                    <div class="flex-spacer"></div>
                    <y-button @click="maximizedDialog = false"> CLOSE</y-button>
                  </y-card-header>
                  <y-card-body class="pv-8">
                    <y-field-input variant="outlined"></y-field-input>
                    <div class="pt-3"></div>
                    <y-checkbox :label="'Show startup'"></y-checkbox>
                    <div style="height: 2000px">a</div>
                  </y-card-body>
                </y-card>
              </y-dialog>
              <!-- tooltip base slot -->
              <y-tooltip :position="'top'">
                <template #base="{ props }">
                  <y-chip v-bind="props">TOOLTIP</y-chip>
                </template>
                <span>어서와 처음이지?</span>
              </y-tooltip>
              <!-- menu with tooltip -->
              <y-menu
                position="right"
                align="top"
                offset="8"
                height="80"
                eager
                open-on-hover
                prevent-close-bubble
              >
                <template #base="{ props: menuProps }">
                  <y-tooltip position="top">
                    <template #base="{ props: tooltipProps }">
                      <y-button
                        class="mr-2"
                        v-bind="mergeProps(tooltipProps, menuProps)"
                      >
                        MENU TOOLTIP
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
              <!-- menu in menu -->
              <y-menu position="right" align="top" offset="8" height="400">
                <template #base="{ props: menuProps }">
                  <y-button class="mr-2" v-bind="{ ...menuProps }">
                    MENU
                  </y-button>
                </template>
                <y-card>
                  <y-card-body class="d-flex flex-column gap-4">
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

                    <y-select :items="[1, 2, 3]"></y-select>
                  </y-card-body>
                </y-card>
              </y-menu>
              <!-- dropdown -->
              <y-dropdown
                :items="dropdownItems"
                class="ml-2 elevation-1"
                variant="filled"
                color="primary"
                :expand-icon="{
                name: '$expand',
                size: 32,
                iconProps: {
                  width: 32,
                  height: 32,
                },
              }"
                style="width: 160px"
              >
                드롭다운
              </y-dropdown>
              <!-- select item slot -->
              <y-select
                v-model="defaultSelectV"
                :items="dropdownItems"
                :label="'y-select'"
                offset="8"
                default-select
                style="max-width: 80px"
              >
                <template #item="{ selected, item, select }">
                  <div class="d-flex align-center">
                    <YIconCheckbox
                      class="mr-2"
                      style="width: 20px; height: 20px"
                      :checked="selected"
                      @click="select"
                    ></YIconCheckbox>
                    {{ item.text }}
                  </div>
                </template>
              </y-select>
              <!-- select with tooltip -->
              <y-tooltip position="top">
                <template #base="{ props: tooltipProps }">
                  <y-select
                    :items="dropdownItems"
                    variant="outlined"
                    style="max-width: 120px"
                    v-bind="tooltipProps"
                  ></y-select>
                </template>
                <span>tooltip + select</span>
              </y-tooltip>
              <!-- menu origin overlap -->
              <y-menu origin="overlap">
                <template #base>
                  <y-button>menu overlap</y-button>
                </template>
                <y-card>
                  <y-card-header> 테스트</y-card-header>
                  <y-list>
                    <y-list-item
                      @click="
                      () => {
                        return true;
                      }
                    "
                    >
                      테스트 아이템
                    </y-list-item>
                  </y-list>
                </y-card>
              </y-menu>
              <!-- select origin overlap -->
              <y-select
                v-model="defaultSelectV"
                :items="selectItems"
                :label="'y-select'"
                origin="overlap"
                default-select
                style="max-width: 140px"
              ></y-select>
            </div>
          </y-card-body>
        </y-card>
      </section>
      <section class="pt-6">
        <y-card>
          <y-card-header>COMBOBOX</y-card-header>
          <y-card-body class="d-flex flex-wrap gap-4">
            <div class="combobox-example">
              <y-combobox
                v-model="comboboxValue"
                :items="comboboxItems"
                label="단일 선택"
                placeholder="과일 검색"
                helper-text="입력하여 검색하고 과일을 선택하세요."
                enable-clear
              />
              <p class="mt-2">선택값: {{ comboboxValue ?? '없음' }}</p>
            </div>
            <div class="combobox-example">
              <y-combobox
                v-model="multipleComboboxValue"
                :items="comboboxItems"
                label="다중 선택 (chip)"
                placeholder="과일 검색"
                helper-text="chip의 × 버튼으로 선택한 과일을 하나씩 삭제할 수 있습니다."
                multiple
                enable-clear
                enable-chip-clear
              />
              <p class="mt-2">선택값: {{ multipleComboboxValue }}</p>
            </div>
            <div class="combobox-example">
              <y-combobox
                v-model="customChipComboboxValue"
                :items="comboboxItems"
                label="chip 슬롯"
                placeholder="과일 검색"
                helper-text="chip 슬롯으로 색상과 내용을 바꿀 수 있습니다."
                multiple
                enable-clear
                enable-chip-clear
              >
                <template
                  #chip="{ index, text, props: chipProps, clearable, clearProps }"
                >
                  <y-chip v-bind="chipProps" color="primary">
                    <span class="combobox-example__chip-text">
                      {{ index + 1 }}. {{ text }}
                    </span>
                    <button v-if="clearable" v-bind="clearProps">
                      <YIconClear />
                    </button>
                  </y-chip>
                </template>
              </y-combobox>
              <p class="mt-2">선택값: {{ customChipComboboxValue }}</p>
            </div>
          </y-card-body>
        </y-card>
      </section>
    </y-card>
  </div>
</template>

<style scoped>
.combobox-example {
  flex: 1 1 260px;
  min-width: 0;
}

.combobox-example__chip-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

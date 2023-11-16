import App from "./App.vue";
import yuyeon from "@/plugins/yuyeon";
import router from "@/router";
import { createApp } from "vue";

createApp(App).use(router).use(yuyeon).mount("#app");

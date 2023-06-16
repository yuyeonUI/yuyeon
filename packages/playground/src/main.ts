import App from "./App.vue";
import yui from "@/plugins/yui";
import router from "@/router";
import { createApp } from "vue";

createApp(App).use(router).use(yui).mount("#app");

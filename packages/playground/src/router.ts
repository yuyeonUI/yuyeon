import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    name: "Main",
    path: "/",
    component: () => import("@/views/ControlProps.vue"),
    children: [
      {
        name: "MainTabFirst",
        path: "first",
        component: () => import("@/views/main/MainTabFirst.vue"),
      },
      {
        name: "MainTabSecond",
        path: "second",
        component: () => import("@/views/main/MainTabSecond.vue"),
      },
    ],
  },
  {
    name: "DataTable",
    path: "/data-table",
    component: () => import("@/views/DataTable.vue"),
  },
  {
    name: "DataTableServer",
    path: "/data-table-server",
    component: () => import("@/views/DataTableServer.vue"),
  },
  {
    name: "TreeView",
    path: "/tree-view",
    component: () => import("@/views/TreeView.vue"),
  },
  {
    name: "DatePicker",
    path: "/date-picker",
    component: () => import("@/views/DatePicker.vue"),
  },
  {
    name: "MaxDialog",
    path: "/max-dialog",
    component: () => import("@/views/MaxDialog.vue"),
  },
  {
    name: "Layer",
    path: "/layer",
    component: () => import("@/views/LayerView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

export default router;

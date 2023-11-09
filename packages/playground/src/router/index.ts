import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    name: 'Main',
    path: '/',
    component: () => import('@/pages/ControlProps.vue'),
    children: [
      {
        name: 'MainTabFirst',
        path: 'first',
        component: () => import('@/pages/main/MainTabFirst.vue'),
      },
      {
        name: 'MainTabSecond',
        path: 'second',
        component: () => import('@/pages/main/MainTabSecond.vue'),
      }
    ]
  },
  {
    name: 'DataTable',
    path: '/data-table',
    component: () => import('@/pages/DataTable.vue'),
  },
  {
    name: 'DataTableServer',
    path: '/data-table-server',
    component: () => import('@/pages/DataTableServer.vue'),
  },
  {
    name: 'TreeView',
    path: '/tree-view',
    component: () => import('@/pages/TreeView.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

export default router;

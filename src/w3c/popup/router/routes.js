export default [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/help',
    component: () => import('../views/Help.vue'),
  },
  {
    path: '/licenses',
    component: () => import('../views/Licenses.vue'),
  },
  {
    path: '/registration',
    component: () => import('../views/Registration.vue'),
  },
  {
    path: '/settings',
    component: () => import('../views/Settings.vue'),
  },
];

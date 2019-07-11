import HomeView from '../views/Home.vue';
import AboutView from '../views/About.vue';
import LicenseView from '../views/Licenses.vue';
import RegistrationView from '../views/Registration.vue';
import SettingsView from '../views/Settings.vue';

export default [
  {
    path: '/',
    component: HomeView,
  },
  {
    path: '/about',
    component: AboutView,
  },
  {
    path: '/licenses',
    component: LicenseView,
  },
  {
    path: '/registration',
    component: RegistrationView,
  },
  {
    path: '/settings',
    component: SettingsView,
  },
];

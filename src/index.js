import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/loginPage.vue';
import SignUpPage from '@/components/signUpPage.vue';
import DashboardPage from './components/dashboardPage.vue';
import AddItem from './components/addItem.vue';
import HomePage from './components/homePage.vue';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/signup', name: 'SignUp', component: SignUpPage },
  { path: '/dashboard', name: 'dashboard', component: DashboardPage },
  { path: '/create-event', name: 'additem', component: AddItem },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

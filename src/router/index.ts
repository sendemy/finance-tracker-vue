import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
	{ path: '/', redirect: '/home' },
	{ path: '/home', component: DashboardView },
	{ path: '/settings', component: SettingsView },
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})

import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'

import Login from '@/pages/Login.vue'
import NotFound from '@/pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/features/dashboard/pages/Dashboard.vue'),
        },
        {
          path: 'donations',
          name: 'donations',
          component: () => import('@/features/donations/pages/DonationList.vue'),
        },
        {
          path: 'donations/create',
          name: 'donation-create',
          component: () => import('@/features/donations/pages/DonationCreate.vue'),
        },
        {
          path: 'donations/:id',
          name: 'donation-update',
          component: () => import('@/features/donations/pages/DonationUpdate.vue'),
        },
        {
          path: 'donors',
          name: 'donors',
          component: () => import('@/features/donors/pages/DonorList.vue'),
        },
        {
          path: 'donors/:donorId',
          name: 'donor-detail',
          component: () => import('@/features/donors/pages/DonorDetail.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

export default router

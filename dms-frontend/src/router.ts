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
        {
          path: 'donation-asset-types',
          name: 'donation-asset-types',
          component: () => import('@/features/donationAssetTypes/pages/DonationAssetTypeList.vue'),
        },
        {
          path: 'donation-asset-types/create',
          name: 'donation-asset-type-create',
          component: () =>
            import('@/features/donationAssetTypes/pages/DonationAssetTypeCreate.vue'),
        },
        {
          path: 'donation-asset-types/:id',
          name: 'donation-asset-type-update',
          component: () =>
            import('@/features/donationAssetTypes/pages/DonationAssetTypeUpdate.vue'),
        },
        {
          path: 'donation-methods',
          name: 'donation-methods',
          component: () => import('@/features/donationMethods/pages/DonationMethodList.vue'),
        },
        {
          path: 'donation-methods/create',
          name: 'donation-method-create',
          component: () => import('@/features/donationMethods/pages/DonationMethodCreate.vue'),
        },
        {
          path: 'donation-methods/:id',
          name: 'donation-method-update',
          component: () => import('@/features/donationMethods/pages/DonationMethodUpdate.vue'),
        },
        {
          path: 'payment-modes',
          name: 'payment-modes',
          component: () => import('@/features/paymentModes/pages/PaymentModeList.vue'),
        },
        {
          path: 'payment-modes/create',
          name: 'payment-mode-create',
          component: () => import('@/features/paymentModes/pages/PaymentModeCreate.vue'),
        },
        {
          path: 'payment-modes/:id',
          name: 'payment-mode-update',
          component: () => import('@/features/paymentModes/pages/PaymentModeUpdate.vue'),
        },
        {
          path: 'donation-types',
          name: 'donation-types',
          component: () => import('@/features/donationTypes/pages/DonationTypeList.vue'),
        },
        {
          path: 'donation-types/create',
          name: 'donation-type-create',
          component: () => import('@/features/donationTypes/pages/DonationTypeCreate.vue'),
        },
        {
          path: 'donation-types/:donationTypeId',
          name: 'donation-type-edit',
          component: () => import('@/features/donationTypes/pages/DonationTypeUpdate.vue'),
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

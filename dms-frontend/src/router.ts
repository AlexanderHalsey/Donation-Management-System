import { createRouter, createWebHistory } from 'vue-router'
import { refreshToken } from './apis/interceptors'

import MainLayout from '@/layouts/MainLayout.vue'

import { Login } from '@/features/auth'
import NotFound from '@/pages/NotFound.vue'

import { useAuthStore } from './stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
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
          path: 'tax-receipts',
          name: 'tax-receipts',
          component: () => import('@/features/taxReceipts/pages/TaxReceiptList.vue'),
        },
        {
          path: 'tax-receipts/annual-create/:year/:organisationId',
          name: 'annual-tax-receipts-create',
          meta: { admin: true },
          component: () => import('@/features/taxReceipts/pages/AnnualTaxReceiptsCreate.vue'),
        },
        {
          path: 'donation-asset-types',
          name: 'donation-asset-types',
          meta: { admin: true },
          component: () => import('@/features/donationAssetTypes/pages/DonationAssetTypeList.vue'),
        },
        {
          path: 'donation-asset-types/create',
          name: 'donation-asset-type-create',
          meta: { admin: true },
          component: () =>
            import('@/features/donationAssetTypes/pages/DonationAssetTypeCreate.vue'),
        },
        {
          path: 'donation-asset-types/:id',
          name: 'donation-asset-type-update',
          meta: { admin: true },
          component: () =>
            import('@/features/donationAssetTypes/pages/DonationAssetTypeUpdate.vue'),
        },
        {
          path: 'donation-methods',
          name: 'donation-methods',
          meta: { admin: true },
          component: () => import('@/features/donationMethods/pages/DonationMethodList.vue'),
        },
        {
          path: 'donation-methods/create',
          name: 'donation-method-create',
          meta: { admin: true },
          component: () => import('@/features/donationMethods/pages/DonationMethodCreate.vue'),
        },
        {
          path: 'donation-methods/:id',
          name: 'donation-method-update',
          meta: { admin: true },
          component: () => import('@/features/donationMethods/pages/DonationMethodUpdate.vue'),
        },
        {
          path: 'payment-modes',
          name: 'payment-modes',
          meta: { admin: true },
          component: () => import('@/features/paymentModes/pages/PaymentModeList.vue'),
        },
        {
          path: 'payment-modes/create',
          name: 'payment-mode-create',
          meta: { admin: true },
          component: () => import('@/features/paymentModes/pages/PaymentModeCreate.vue'),
        },
        {
          path: 'payment-modes/:id',
          name: 'payment-mode-update',
          meta: { admin: true },
          component: () => import('@/features/paymentModes/pages/PaymentModeUpdate.vue'),
        },
        {
          path: 'donation-types',
          name: 'donation-types',
          meta: { admin: true },
          component: () => import('@/features/donationTypes/pages/DonationTypeList.vue'),
        },
        {
          path: 'donation-types/create',
          name: 'donation-type-create',
          meta: { admin: true },
          component: () => import('@/features/donationTypes/pages/DonationTypeCreate.vue'),
        },
        {
          path: 'donation-types/:donationTypeId',
          name: 'donation-type-edit',
          meta: { admin: true },
          component: () => import('@/features/donationTypes/pages/DonationTypeUpdate.vue'),
        },
        {
          path: 'organisations',
          name: 'organisations',
          meta: { admin: true },
          component: () => import('@/features/organisations/pages/OrganisationList.vue'),
        },
        {
          path: 'organisations/create',
          name: 'organisation-create',
          meta: { admin: true },
          component: () => import('@/features/organisations/pages/OrganisationCreate.vue'),
        },
        {
          path: 'organisations/:organisationId',
          name: 'organisation-edit',
          meta: { admin: true },
          component: () => import('@/features/organisations/pages/OrganisationUpdate.vue'),
        },
      ],
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/pages/Forbidden.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthEnabled) {
    if (to.name === 'login') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    if (!authStore.token) {
      await refreshToken()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some((record) => record.meta.admin)

    if (!!authStore.token && to.name === 'login') {
      next({ name: 'dashboard' })
    } else if (requiresAdmin && authStore.userRole !== 'admin') {
      next({ name: 'forbidden' })
    } else if (!requiresAuth || !!authStore.token) {
      next()
    } else {
      next({ name: 'login' })
    }
  }
})

export default router

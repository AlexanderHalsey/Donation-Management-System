<template>
  <QCard class="absolute-center" style="width: 400px">
    <QCardSection>
      <DMSTitle style="padding-left: 110px" />
      <form>
        <Input
          v-model="username"
          name="username"
          label="Nom d'utilisateur"
          :error="errors.username"
          class="q-mb-md"
          data-cy="username-input"
        />
        <Input
          v-model="password"
          label="Mot de passe"
          name="password"
          type="password"
          :error="errors.password"
          data-cy="password-input"
        />
        <div class="q-mt-md text-center">
          <Btn color="primary" @click="onSubmit" type="submit" data-cy="login-button"
            >Connexion</Btn
          >
        </div>
      </form>
    </QCardSection>
  </QCard>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Btn from '@/components/ui/Btn.vue'
import Input from '@/components/ui/Input.vue'

import DMSTitle from '@/layouts/components/DMSTitle.vue'

import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '../schemas'

import { login } from '@/apis/dms-api'

import type { LoginFormData } from '../types'

const authStore = useAuthStore()
const router = useRouter()

const { defineField, errors, handleSubmit, setFieldError } = useForm<LoginFormData>({
  validationSchema: toTypedSchema(loginSchema),
})

const [username] = defineField('username')
const [password] = defineField('password')

const onSubmit = handleSubmit(async ({ username, password }) => {
  try {
    const response = await login({ username, password })
    authStore.setToken(response.accessToken)
    await router.push({ path: '/' })
  } catch (error) {
    console.error('Login failed:', error)
    setFieldError('username', 'Nom d’utilisateur ou mot de passe incorrect')
    setFieldError('password', 'Nom d’utilisateur ou mot de passe incorrect')
  }
})
</script>

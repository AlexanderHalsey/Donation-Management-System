import { UserCreateInput } from '@generated/prisma/models'

export const buildMockAdminCreateInput = (): UserCreateInput => ({
  username: 'admin',
  passwordHash: '$2a$12$ANl5SF3ijkGOO4NqWg3R.eCJBwJqOjs5JIRqtCOcM8tnxla2JJoD2',
  role: 'ADMIN',
})

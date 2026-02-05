import { UserRole } from '@shared/models'

export interface JwtPayload {
  sub: string
  username: string
  role: UserRole
}

export interface PaymentModeDto {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  isDisabled: boolean
}

export interface PaymentModeRequest {
  name: string
}

export interface PaymentModeResponse {
  paymentMode: PaymentModeDto
}

export interface PaymentModeListResponse {
  paymentModes: PaymentModeDto[]
}

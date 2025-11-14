export interface PaymentModeRef {
  id: string
  name: string
}

export interface PaymentMode extends PaymentModeRef {
  createdAt: Date
  updatedAt: Date
}

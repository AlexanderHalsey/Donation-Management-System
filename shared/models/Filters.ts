export interface UuidFilter {
  in?: string[]
}

export interface DateTimeFilter {
  lte?: Date
  gte?: Date
}

export interface FloatFilter {
  equals?: number
  lte?: number
  gte?: number
}

export interface BoolFilter {
  equals?: boolean
}

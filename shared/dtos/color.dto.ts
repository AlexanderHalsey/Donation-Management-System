export class ColorDto {
  id: string
  hexcode: string
}

export class GetColorsResponse {
  colors: ColorDto[]
}

export class GetColorResponse {
  color: ColorDto
}

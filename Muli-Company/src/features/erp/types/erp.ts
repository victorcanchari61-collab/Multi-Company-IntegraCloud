export interface UnitOfMeasure {
  id: string
  name: string
  abbreviation: string
  isActive: boolean
}

export interface UnitOfMeasureRequest {
  name: string
  abbreviation: string
}

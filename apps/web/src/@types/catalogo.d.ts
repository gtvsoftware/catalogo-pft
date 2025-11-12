declare type catalogoFormType = {
  id: string
  slug?: string
  title: string
  seller?: {
    name: string
    picture: string
    id: string
  }
  phoneContact?: string
  availabilityStart?: string
  availabilityEnd?: string
  sharedWith?: Array<{
    id: string
    name: string | null
    picture: string | null
  }>
  cover?: {
    enabled: boolean
    title: string
    subtitle: string
    showTitle: boolean
    showSubtitle: boolean
    showLogo: boolean
    backgroundType: 'color' | 'image'
    backgroundColor: string
    backgroundImage: string
    alignment: 'center' | 'left'
    overlayOpacity: number
  }
  sections: sectionFormType[]
}

declare type sectionFormType = {
  id: string
  title: string
  items: itemFormType[]
}

declare type itemFormType = {
  id: string
  name: string
  image: string
  price?: string
  description?: string
  discountPrice?: string
  additionalImages?: string[]
}

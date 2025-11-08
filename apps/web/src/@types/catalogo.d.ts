declare type catalogoFormType = {
  id: string
  slug?: string
  banner?: string
  title: string
  caption?: string
  cover?: {
    enabled: boolean
    title: string
    subtitle: string
    showTitle: boolean
    showSubtitle: boolean
    backgroundType: 'color' | 'image'
    backgroundColor: string
    backgroundImage: string
    alignment: 'center' | 'left'
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
}

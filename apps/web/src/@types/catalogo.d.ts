declare type catalogoFormType = {
  id: string
  banner?: string
  title: string
  caption?: string
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

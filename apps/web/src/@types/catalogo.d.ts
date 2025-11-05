declare type catalogoFormType = {
  banner?: string
  title: string
  sections: sectionFormType[]
}

declare type sectionFormType = {
  id: string
  title: string
  items: itemFormType[]
}

declare type itemFormType = {
  id: string
  image: string
  name: string
  price: string
  discountPrice?: string
}

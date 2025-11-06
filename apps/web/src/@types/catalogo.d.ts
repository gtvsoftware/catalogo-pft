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
  commercialName?: string
  group?: string
  serie?: string
  color?: string
  pot?: string
  height?: string
  price: string
  discountPrice?: string
}

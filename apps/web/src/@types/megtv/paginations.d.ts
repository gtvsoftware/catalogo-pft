declare interface IPagination {
  from: number
  to: number
  per_page: number
  total: number
  current_page: number
  prev_page: number | null
  next_page: number
  last_page: number
}

declare interface IPaginationMeta {
  total: number
  lastPage: number
  currentPage: number
  perPage: number
  prev: number | null
  next: number
}

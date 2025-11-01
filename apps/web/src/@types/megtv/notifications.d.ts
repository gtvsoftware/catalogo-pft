declare interface INotification {
  content: string
  createdAt: string
  read: true
  recipient_id: string
  subject: string
  title: string
  updatedAt: string
  __v: number
  _id: string
  actions: {
    web: {
      read: {
        label: string
        url: string
        color: string
        icon: string
        api: null
      }
    }
  }
}

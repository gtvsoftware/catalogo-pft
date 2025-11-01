import axios from 'axios'

export const wp_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WORDPRESS_API_URL
})

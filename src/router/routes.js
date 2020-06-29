
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/category/:fire_id', component: () => import('pages/Category.vue') },
      { path: '/addcategory', component: () => import('pages/AddCategory.vue') },
      { path: '/addphoto/:fire_id', component: () => import('pages/AddPhoto.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes

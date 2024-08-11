import router from '@/router'
import setting from '@/setting'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import pinia from '@/store'
import useUserStore from '@/store/modules/user'
import useMenuStore from '@/store/modules/menu'

nprogress.configure({ showSpinner: false })

const whiteRoute: string[] = ['/redirect']
const userStore = useUserStore(pinia)
const menuStore = useMenuStore(pinia)

/**
 * 全局前置守卫
 */
router.beforeEach(async (to, from, next) => {
  document.title = (to.meta.title || '') + ` | ${setting.title}`
  nprogress.start()

  const token: string = userStore.accessToken as string
  const initMenu: boolean = menuStore.initMenu as boolean
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (initMenu) {
        to.matched.length === 0 ? (from.name ? next({ name: from.name }) : next('/404')) : next()
      } else {
        try {
          await menuStore.listPermission()
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.logout()
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    if (whiteRoute.includes(to.path) || to.path == '/login') {
      next()
    } else if (Object.keys(to.query).length > 0) {
      next({ path: '/login', query: { redirect: '/home' } })
    } else {
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})
// 全局后置守卫

router.afterEach(() => {
  nprogress.done()
})

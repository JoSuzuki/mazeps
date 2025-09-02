import type { RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'

let flatRouteConfig = await flatRoutes()
let regex = /^routes\/_[^.]*\./
let routesWithOtherLayout = flatRouteConfig.filter((route) =>
  regex.test(route.id as string),
)
let routesWithBaseLayout = flatRouteConfig.filter(
  (route) =>
    !regex.test(route.id as string) && route.id !== 'routes/_base-layout',
)
let baseLayout = flatRouteConfig.find(
  (route) => route.id === 'routes/_base-layout',
)!

export default [
  {
    ...baseLayout,
    children: [...routesWithBaseLayout],
  },
  ...routesWithOtherLayout,
] satisfies RouteConfig

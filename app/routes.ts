import type { RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'

let flatRouteConfig = await flatRoutes()
let routesWithOtherLayout = flatRouteConfig.filter((_route) => {})
let routesWithBaseLayout = flatRouteConfig.filter(
  (route) => route.id !== 'routes/_base-layout',
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

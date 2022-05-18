function applyToRouter(mw, router, routes) {
  if (!routes) {
    router.use(mw);
  } else {
    routes.forEach(routeConfig => {
      const { method, route } = typeof routeConfig === 'string'
        ? { method: 'use', route: routeConfig }
        : routeConfig;
      router[method](route, mw);
    });
  }
}

module.exports = applyToRouter;
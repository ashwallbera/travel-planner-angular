'use strict';

/**
 * CommonJS entry for Azure App Service on Windows (iisnode cannot load ESM as the
 * primary script). Imports the Angular SSR bundle at dist/travel-planner-angular/server/server.mjs
 *
 * @see https://techcommunity.microsoft.com/blog/appsonazureblog/supporting-es6-import-on-windows-app-service-node-jsiisnode/3639037
 */

import('./dist/travel-planner-angular/server/server.mjs').catch((err) => {
  console.error(err);
  process.exit(1);
});

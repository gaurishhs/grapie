import { GrapieServer } from "./server";
import { loadConfiguration } from "./config";
import type { Config, GrapieCache } from "@/types";
import { fdir } from "fdir";

export class Grapie {
  config: Config;
  server: GrapieServer;
  constructor() {
    this.config = loadConfiguration();
    this.server = new GrapieServer(this.config);
    this.loadAPIRoutes = this.loadAPIRoutes.bind(this);
    this.loadAPIRoutes();
    this.server.listen(this.config.port || 3000);
  }

  /**
   * Read the API directory and load all routes
   */
  loadAPIRoutes() {
    // Get the paths of all files in the API directory
    const paths = new fdir()
      .withFullPaths()
      .withBasePath()
      .filter((path) => {
        return path.endsWith(".ts") || path.endsWith(".js");
      })
      .crawl(this.config.rootDir + "/api")
      .sync() as string[];
    // If there are no paths, return
    if (!paths.length) return;
    // Loop through the paths and add the handler
    for (const path of paths) {
      const handler = require(path).handler;
      if (!handler) return;
      // Remove the root directory and the file extension
      const route = path
        .replace(this.config.rootDir + "/api", "")
        .replace(".ts", "")
        .replace(".js", "");
      const indexRegex = /\/index$/;
      if (indexRegex.test(route)) {
        const newRoute = route.replace(indexRegex, "");
        this.server.addHandler("get", newRoute, handler);
        continue;
      }
      this.server.addHandler("get", route, handler);
    }
  }
}

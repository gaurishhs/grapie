import { GrapieServer } from "./server";
import { loadConfiguration } from "./config";
import type { Config } from "@/types";

export class Grapie {
  /* The configuration for the server */
  config: Config;
  /* The server */
  server: GrapieServer;
  /**
   * Create a new Grapie instance
   */
  constructor() {
    this.config = loadConfiguration();
    this.server = new GrapieServer(this.config);
    this.server.listen(this.config.port || 3000);
    // Call the onInit hook
    if (this.config.plugins) {
      for (const plugin of this.config.plugins) {
        var onInit = plugin(this.config).onInit;
        if (onInit) {
          onInit(this)
        }
      }
    }
  }
}
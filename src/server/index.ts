import type { Config, RouteCallback } from "@/types";
import type { Server } from "bun";
import { FileSystemRouter } from "bun";
import type { Plugin } from "@/../plugin";

export class GrapieServer {
    /* The router */
    private router: FileSystemRouter
    /* A not found handler, Which can be customized as well. */
    public notFoundHandler: RouteCallback = () => {
        return new Response("Not Found", {
            status: 404
        })
    };
    /* The Bun server */
    protected server: Server | null = null;
    /**
     * Create a new Grapie server
     * @param {Config} config - The configuration for the server
     * @param {Plugin[]} plugins - The plugins to use
     */
    constructor (
        /* The configuration for the server */
        private config: Config, 
        /* The plugins to use */
        private plugins?: Plugin[]
    ) {
        this.router = new FileSystemRouter({
            dir: config.rootDir,
            style: 'nextjs'
        })
        // Initialize the plugins
        if (this.plugins) {
            for (const plugin of this.plugins) {
                var onInit = plugin(this.config).server?.onInit;
                if (onInit) {
                    onInit(this)
                }
            }
        }
    }

    /**
     * Handle requests
     * @param {Request} req - The request from the Bun server 
     * @returns {Response | Promise<Response>} The response from the server
     */
    handle(req: Request): Response | Promise<Response> {
        if (this.plugins) { 
            for (const plugin of this.plugins) {
                var onRequest = plugin(this.config).server?.onRequest;
                if (onRequest) {
                    onRequest(req)
                }
            }
        }
        const route = this.router.match(req.url)

        if (!route) return this.notFoundHandler(req, {})

        const { default: handler } = require(route.filePath);
        return handler(req, route.params)
    }
    /**
     * Start the server
     * @param {number} port - The port to listen on 
     */
    listen(port: number) {
        var configByPlugins = {};
        if (this.plugins) {
            for (const plugin of this.plugins) {
                var config = plugin(this.config).server?.config;
                if (config) {
                    configByPlugins = { ...configByPlugins, ...config }
                }
            }
        }
        this.server = Bun.serve({
            ...this.config.serverConfig,
            ...configByPlugins,
            port,
            fetch: this.handle.bind(this),
        })
    } 
}
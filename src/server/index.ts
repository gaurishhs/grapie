import type { Config, RouteCallback } from "@/types";
import type { Server } from "bun";
import { Router } from "./router";
import { getPath } from "./utils";
import type { Plugin } from "@/../plugin";

export class GrapieServer {
    private router = new Router();
    server: Server | null = null;
    constructor (private config: Config, private plugins?: Plugin[]) {
        if (this.plugins) {
            for (const plugin of this.plugins) {
                const onInit = plugin(this.config).server?.onInit;
                if (onInit) {
                    onInit(this)
                }
            }
        }
    }

    public addHandler(method: string, path: string, handler: RouteCallback) {
        path = path.startsWith('/') ? path : (`/${path}`)
        this.router.register(path)[method] = {
            handler,
        }
    }

    public addNotFoundHandler(handler: RouteCallback) {
        this.router.register('/*').get = {
            handler,
        }
    }

    get(path: string, handler: RouteCallback) {
        this.addHandler('get', path, handler)
    }

    post(path: string, handler: RouteCallback) {
        this.addHandler('post', path, handler)
    }

    put(path: string, handler: RouteCallback) {
        this.addHandler('put', path, handler)
    }

    delete(path: string, handler: RouteCallback) {
        this.addHandler('delete', path, handler)
    }

    patch(path: string, handler: RouteCallback) {
        this.addHandler('patch', path, handler)
    }

    custom(path: string, method: string, handler: RouteCallback) {
        this.addHandler(method, path, handler)
    }

    handle(req: Request): Response | Promise<Response> {
        if (this.plugins) { 
            for (const plugin of this.plugins) {
                const onRequest = plugin(this.config).server?.onRequest;
                if (onRequest) {
                    onRequest(req)
                }
            }
        }
        console.log(getPath(req.url))
        const route = this.router.find(getPath(req.url))

        if (!route) {
            return new Response('Not Found', { status: 404 })
        }

        const handler = route.store[req.method.toLowerCase()].handler

        if (!handler) {
            return new Response('Method Not Allowed', { status: 405 })
        }

        return handler(req, route.params)
    }

    listen(port: number) {
        var configByPlugins = {};
        if (this.plugins) {
            for (const plugin of this.plugins) {
                const config = plugin(this.config).server?.config;
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
import { Plugin } from "@/../plugin";
import { Serve } from "bun";

export interface RouterOptions {
	storeFactory?: () => any
}

export interface FindResult {
	store: any
	params: Record<string, any>
}

export interface ParametricNode {
	paramName: string
	store: any
	staticChild: any
}

export interface Node {
	pathPart: string
	store: any
	staticChildren: Map<any, any> | null
	parametricChild: ParametricNode | null
	wildcardStore: any
}

export type Params = Record<string, any>
export type RouteCallback = (req: Request, params: Params) => Response | Promise<Response>
export type APIRoute = (req: Request, params: Params) => Response | Promise<Response>

export interface Config {
	/* Configure Bun Server */
    serverConfig?: Partial<Serve>;
	/* Use a custom host for the server */
    host?: string;
	/**
	 * Use a custom diectory for the application
	 * 
	 * @default process.cwd()
	 */
	rootDir: string;
	/* Use a custom port for the server */
    port?: number;
	/* Environment to run the server in */
	development?: boolean
	/* Plugins to use */
	plugins?: Plugin[]
}

export type GrapieCache = {
	api: Record<string, any>
}

export interface TemplateOptions {
	lang?: string;
	body?: string;
}
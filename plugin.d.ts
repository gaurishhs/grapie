import type { GrapieServer } from "@/server";
import { Config } from "@/types";
import type { Serve } from "bun";

export type PluginConfig = {
    name: string;
    server?: {
        config?: Partial<Serve>;
        onRequest?: (req: Request) => void;
        onInit?: (server: GrapieServer) => void;
    }
}

export type Plugin = (config: Config) => PluginConfig;
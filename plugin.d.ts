import { Grapie } from "@/Grapie";
import type { GrapieServer } from "@/server";
import { Config } from "@/types";
import type { Serve } from "bun";

export type PluginConfig = {
    name: string;
    server?: {
        config?: Partial<Serve>;
        onRequest?: (req: Request | string) => void;
        onInit?: (server: GrapieServer) => void;
    }
    onInit?: (grapie: Grapie) => void;
}

export type Plugin = (config: Config) => PluginConfig;
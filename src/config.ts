import fs from "fs";
import { resolve } from "path";
import { Config } from "@/types";

// Supported config files
const SUPPORTED_CONFIG_FILES = ["grapie.config.js", "grapie.config.ts"];

/**
 * Get the path to the user's config file
 * @param {string} root - The root directory to search for the config file
 * @returns {string | undefined}
 */
const getUserConfigPath = (root: string): string | null => {
    const configPath = SUPPORTED_CONFIG_FILES
        .map((file) => resolve(root, file))
        .find(fs.existsSync);
    return configPath || null;
};

/**
 * Load the user's config
 * @param {string?} root - The root directory to search for the config file 
 * @returns 
 */
export const loadConfiguration = (root?: string): Config => {
    if (!root || root == ".") root = process.cwd();
    const configPath = getUserConfigPath(root);

    if (!configPath) {
        throw new Error(
            `No configuration file found. Supported file formats: ${SUPPORTED_CONFIG_FILES.join(
                ", "
            )}`
        );
    }

    // Dynamically import the file and return the default export
    return require(configPath).default;
}

export const defineConfig = (config: Config): Config => config;
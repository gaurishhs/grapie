import { FileSystemRouter, Transpiler, spawnSync } from "bun";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { TemplateOptions } from "./types";

export class GrapieBundler {
    private transpiler: Transpiler;
    constructor() {
        this.transpiler = new Transpiler({
            tsconfig: JSON.stringify({
                "compilerOptions": {
                    "jsx": "react",
                    "jsxFactory": "h",
                    "jsxFragmentFactory": "Fragment",
                },
            }),
        })
    }
    private template(o: TemplateOptions) {
        const pageTemplate = h(
            "html",
            {
                lang: o.lang || "en",
            },
            h(
                "head",
                null,
                h("meta", {
                    charSet: "utf-8",
                }),
                h("meta", {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                }),
            ),
            h(
                "body", 
                {
                    dangerouslySetInnerHTML: {
                        __html: o.body || "",
                    },
                }
            )
        )

        return "<!DOCTYPE html>" + renderToString(pageTemplate);
    } 
    
    private render(path: string) {
        this.template({
            body: renderToString(this.bundle(path)),
        })
    }

    async bundle(path: string) {
        spawnSync(["bun", "build", "--platform=bun", "--outdir=.grapie"])
        this.render(path)
    }
}
import { Transpiler } from "bun";
import render from "preact-render-to-string";

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

    bundle(code: string) {
        const transformedCode = this.transpiler.transformSync(code, "tsx");
    }   
}
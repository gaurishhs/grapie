import { APIRoute } from "@/types";

export const handler: APIRoute = (req, params) => {
    return new Response("Hello World!");
}
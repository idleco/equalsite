import type { Client } from "./types";
declare const client: ({ channel, version }: {
    channel: string;
    version?: string;
}) => Client;
export default client;

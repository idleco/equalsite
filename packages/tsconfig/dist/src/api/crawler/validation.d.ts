export declare function urlIsReachable(url: string, options: {
    headers: Record<string, string>;
}): Promise<boolean>;
export declare function ensureCallbackUrlReachable(callbackUrl: string): Promise<void>;

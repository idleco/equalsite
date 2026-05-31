type AsyncCallback = () => Promise<void>;

const lastExecution = new Map<string, number>();

export async function throttleAsync(
    key: string,
    callback: AsyncCallback,
    delay: number = 1000,
) {
    const now = Date.now();
    const previous = lastExecution.get(key);

    if (previous && now - previous < delay) {
        return;
    }

    lastExecution.set(key, now);

    await callback();
}

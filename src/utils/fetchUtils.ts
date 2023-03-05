export async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 1000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(input, {
        ...init,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

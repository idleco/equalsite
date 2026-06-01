import type { AuditRepository } from "../repositories/auditRepository";

export interface ICreatedAuditAction {
    run: (params: {
        url: string;
        urlCallback: string;
        options: {
            maxPages: number;
        }
    }) => Promise<string>;
}

export const createAuditAction = (
    auditRepository: AuditRepository,
    secretKey: string
): ICreatedAuditAction => ({
    run: async ({
        url,
        urlCallback,
        options
    }) => {
        await validateCallbackUrl(urlCallback, secretKey);
        const audit = await auditRepository.create({
            url,
            urlCallback,
            options
        });
        return audit.id;
    }
})

function assertCallbackIsNotAuditEndpoint(urlCallback: string): void {
    let parsed: URL;

    try {
        parsed = new URL(urlCallback);
    } catch {
        throw new Error(`Invalid callback URL [${urlCallback}].`);
    }

    if (parsed.pathname.endsWith('/audit')) {
        throw new Error(
            `Callback URL [${urlCallback}] must not point to the audit API endpoint.`
        );
    }
}

export async function validateCallbackUrl(
    urlCallback: string,
    secretKey: string
): Promise<void> {
    assertCallbackIsNotAuditEndpoint(urlCallback);

    const response = await fetch(urlCallback, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ probe: true }),
    });

    if (!response.ok) {
        throw new Error(`Callback URL [${urlCallback}] is unreachable.`);
    }
}

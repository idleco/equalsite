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

export async function validateCallbackUrl(
    urlCallback: string,
    secretKey: string
): Promise<void> {
    const response = await fetch(urlCallback, {
        method: 'POST',
        headers: { 'Authorization':  `Bearer ${secretKey}`},
    });
    if (! response.ok) {
        throw new Error(`Callback URL [${urlCallback}] is unreachable.`);
    }
}

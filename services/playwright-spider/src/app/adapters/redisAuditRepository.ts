import AuditEntity from "../../audit/entities/audit";
import { randomUUID } from "node:crypto";
import type { AuditRepository } from "../../audit/repositories/auditRepository";
import Status from "../../audit/value/status";
import { cacheClient } from "../services/redis";
import { RedisCrudStore } from "../support/redisCrudStore";

const store = new RedisCrudStore<AuditEntity>(cacheClient, 'spider-cache:audits', AuditEntity);

export const auditRepository: AuditRepository = ({
    find: async (id) => {
        return await store.findOne(id);
    },

    all: async () => {
        return await store.findAll();
    },

    save: async (audit) => {
        await store.save(audit);
    },

    delete: async (id) => {
        await store.delete(id);
    },

    exists: async (id) => {
        const record = await store.findOne(id);
        return record !== null;
    },

    findOrFail: async (id) => {
        const record = await store.findOne(id);
        if (! record) {
            throw new Error(`Audit record with ID [${id}] not found`);
        }
        return record;
    },

    create: async (attributes) => {
        const created = AuditEntity.make({
            ...attributes,
            id: randomUUID(),
            status: Status.waiting(),
            createdAt: Date.now()
        });

        await store.save(created);

        return created;
    },

    getByStatus: async (status) => {
        return await store.findFiltered((records) => records.status.is(status.value));
    }
})

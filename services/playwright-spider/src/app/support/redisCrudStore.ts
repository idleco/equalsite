import type { Redis } from 'ioredis';

export interface StringableInstance {
    id: string;
    toString: () => string;
}

export interface StringableClass<T> {
    fromString: (value: string) => T;
}

export class RedisCrudStore<T extends StringableInstance> {
    private client: Redis;
    private prefix: string;
    private entityClass: StringableClass<T>;

    constructor(redisClient: Redis, entityPrefix: string, entityClass: StringableClass<T>) {
        this.client = redisClient;
        this.prefix = entityPrefix;
        this.entityClass = entityClass;
    }

    private buildKey(id: string | number): string {
        return `${this.prefix}:${id}`;
    }

    async save(entity: T): Promise<void> {
        const key = this.buildKey(entity.id);
        await this.client.set(key, entity.toString());
    }

    async findOne(id: string): Promise<T | null> {
        const key = this.buildKey(id);
        const data = await this.client.get(key);

        if (! data) { return null; }

        try {
            return this.entityClass.fromString(data) as T;
        } catch (error) {
            console.error(`[RedisCrudStore] Failed to parse entity for key "${key}":`, error);
            return null;
        }
    }

    async update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<T | null> {
        const existing = await this.findOne(id);
        if (! existing) { return null; }

        const updatedEntity: T = { ...existing, ...updates, id: existing.id };

        await this.save(updatedEntity);

        return updatedEntity;
    }

    async delete(id: string): Promise<boolean> {
        const key = this.buildKey(id);
        const result = await this.client.del(key);
        return result === 1;
    }

    async findAll(): Promise<T[]> {
        const matchPattern = `${this.prefix}:*`;
        const allKeys: string[] = [];

        const stream = this.client.scanStream({
            match: matchPattern,
            count: 250,
        });

        for await (const resultKeys of stream) {
            allKeys.push(...resultKeys);
        }

        if (allKeys.length === 0) {return [];}

        const stringifiedValues = await this.client.mget(allKeys);
        const results: T[] = [];

        for (const rawValue of stringifiedValues) {
            if (rawValue) {
            try {
                results.push(this.entityClass.fromString(rawValue));
            } catch {
                continue;
            }
            }
        }

        return results;
    }

    async findFiltered(predicate: (entity: T) => boolean): Promise<T[]> {
        const allRecords = await this.findAll();
        return allRecords.filter(predicate);
    }
}

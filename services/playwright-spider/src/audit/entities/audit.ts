import Status from "../value/status";

type Options = {
    maxPages: number;
}

type Attributes = {
    id: string;
    url: string;
    status: Status;
    urlCallback: string;
    options: Options;
    createdAt: number;
};

class AuditEntity {
    id: string;
    url: string;
    status: Status;
    error?: string;
    urlCallback: string;
    options: Options;
    createdAt: number;

    constructor(attributes: Attributes) {
        this.id = attributes.id;
        this.url = attributes.url;
        this.status = attributes.status;
        this.urlCallback = attributes.urlCallback;
        this.createdAt = attributes.createdAt;
        this.options = attributes.options;
    }

    toString(): string {
        return JSON.stringify({
            id: this.id,
            url: this.url,
            status: this.status,
            urlCallback: this.urlCallback,
            createdAt: this.createdAt,
            options: this.options
        });
    }

    static make(attributes: Attributes): AuditEntity {
        return new AuditEntity(attributes);
    }

    static fromString(value: string): AuditEntity {
        const parsed = JSON.parse(value) as Omit<Attributes, 'status'> & {
            status: Status | { value: Status['value'] };
        };

        const statusValue = typeof parsed.status === 'string'
            ? parsed.status
            : parsed.status instanceof Status
                ? parsed.status.value
                : parsed.status.value;

        return new AuditEntity({
            ...parsed,
            status: Status.make(statusValue),
        });
    }

    markAsCancelled(): this {
        const cancelled = Status.cancelled();

        if (! this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${cancelled.value}' is not allowed.`);
        }

        this.status = cancelled;

        return this;
    }

    markAsCompleted(): this {
        const completed = Status.completed();

        if (! this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${completed.value}' is not allowed.`);
        }

        this.status = completed;

        return this;
    }

    markAsFailed(reason?: string): this {
        const failed = Status.failed();

        if (! this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${failed.value}' is not allowed.`);
        }

        this.status = failed;
        this.error = reason;

        return this;
    }

    markAsActive(): this {
        const active = Status.active();

        if (! this.status.is('waiting')) {
            throw new Error(`Status change from '${this.status.value}' to '${active.value}' is not allowed.`);
        }

        this.status = active;

        return this;
    }
}

export default AuditEntity;

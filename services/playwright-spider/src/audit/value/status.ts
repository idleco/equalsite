type ValueType = 'waiting' | 'active' | 'failed' | 'completed' | 'cancelled';

class Status {
    value: ValueType;

    constructor(value: ValueType) {
        this.value = value;
    }
    static make(value: ValueType): Status { return new Status(value); }
    static waiting(): Status { return new Status('waiting'); }
    static active(): Status { return new Status('active'); }
    static failed(): Status { return new Status('failed'); }
    static completed(): Status { return new Status('completed'); }
    static cancelled(): Status { return new Status('cancelled'); }

    is(value: ValueType): boolean { return value === this.value; }
    isAny(values: ValueType[]): boolean { return values.indexOf(this.value) !== -1; }
}

export default Status;

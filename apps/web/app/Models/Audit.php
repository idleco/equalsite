<?php

namespace App\Models;

use App\Value\Status;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class Audit extends Model
{
    protected $fillable = [
        'url',
        'domain',
        'status', // pending, started, cancelled, failed, completed
        'failure_reason',
        'logs',
        'custom_data',
    ];

    protected $casts = [
        'custom_data' => 'array',
        'logs' => 'array',
        'status' => Status::class,
    ];

    public function getData(string $key, $default = null)
    {
        return Arr::get($this->custom_data ?? [], $key, $default);
    }

    public function setData(string $key, mixed $value): self
    {
        $customData = $this->custom_data ?? [];
        $customData[$key] = $value;

        $this->fill(['custom_data' => $customData])->save();

        return $this;
    }

    public function fail(string $reason): void
    {
        $this->fill([
            'status' => Status::Failed,
            'failure_reason' => $reason
        ]);
    }
}

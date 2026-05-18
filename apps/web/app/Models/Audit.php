<?php

namespace App\Models;

use App\Value\Status;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class Audit extends Model
{
    protected $fillable = [
        'url',
        'domain',
        'status', // queued, started, cancelled, failed, completed
        'failure_reason',
        'crawler_id',
    ];

    protected $casts = [
        'status' => Status::class,
        'custom_data' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $audit) {
            if ($audit->isDirty('status')) {
                $now = now();
                match ($this->status) {
                    Status::Started => $this->forceFill(['started_at' => $this->started_at ?? $now]),
                    Status::Cancelled => $this->forceFill(['cancelled_at' => $this->cancelled_at ?? $now]),
                    Status::Completed => $this->forceFill(['completed_at' => $this->completed_at ?? $now])
                };
            }
        });
    }

    public function getCustomData(string $key, $default = null)
    {
        return Arr::get($this->custom_data ?? [], $key, $default);
    }

    public function setCustomData(string $key, mixed $value): self
    {
        $customData = $this->custom_data ?? [];

        Arr::set($customData, $key, $value);

        $this->forceFill(['custom_data' => $customData]);

        return $this;
    }

    public function patchCustomData(string $key, Closure $callback): self
    {
        return $this->setCustomData($key, $callback($this->getCustomData($key)));
    }

    public function forgetCustomData(string $key): self
    {
        $customData = $this->custom_data ?? [];

        if (isset($customData[$key])) {
            unset($customData[$key]);
        }

        $this->forceFill(['custom_data' => $customData]);

        return $this;
    }

    public function fail(string $reason): void
    {
        $this->fill([
            'status' => Status::Failed,
            'failure_reason' => $reason
        ])->save();
    }
}

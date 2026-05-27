<?php

namespace App\Models;

use App\Support\CrawlerArtifacts;
use App\Value\Status;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Arr;

class Audit extends Model
{
    protected $fillable = [
        'url',
        'domain',
        'status', // queued, started, cancelled, failed, completed
        'failure_reason',
        'crawler_id',
        'cancelled_at',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'status' => Status::class,
        'custom_data' => 'array',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'started_at' => 'datetime'
    ];

    public function isActive(): bool
    {
        return $this->status->queued() || $this->status->started();
    }

    public function artifacts(): CrawlerArtifacts
    {
        return new CrawlerArtifacts($this->crawler_id);
    }

    public function getCustomData(string $key, $default = null)
    {
        return Arr::get($this->custom_data ?? [], $key, $default);
    }

    public function setCustomData(string $key, mixed $value): self
    {
        $customData = $this->custom_data ?? [];

        Arr::set($customData, $key, $value);

        $this->forceFill([
            'custom_data' => $customData
        ])->save();

        return $this;
    }

    /**
     * @param string[] | string $key
     * @param \Closure $callback
     */
    public function patchCustomData($key, Closure $callback): self
    {
        foreach (Arr::wrap($key) as $k) {
            $this->setCustomData($k, $callback($this->getCustomData($k), $k));
        }

        return $this;
    }

    public function forgetCustomData(string $key): self
    {
        $customData = $this->custom_data ?? [];

        if (isset($customData[$key])) {
            unset($customData[$key]);
        }

        $this->forceFill([
            'custom_data' => $customData
        ])->save();

        return $this;
    }

    public function fail(string $reason): void
    {
        $this->fill([
            'status' => Status::Failed,
            'failure_reason' => $reason
        ])->save();
    }

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }
}

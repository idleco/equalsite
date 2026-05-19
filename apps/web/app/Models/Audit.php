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

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Violation extends Model
{
    protected $fillable = [
        'audit_id',
        'rule_id',
        'impact_level',
        'plain_english_summary', // AI plain-english summary of raw axe-core description
        'fix_instruction', // AI generated fix instruction for developers
        'description', // raw axe-core result
        'failure_summary', // raw axe-core result
        'help_url',
        'nodes',
        'affected_pages'
    ];

    protected $casts = [
        'affected_pages' => 'array',
        'nodes' => 'array',
        'impact_level' => 'string',
    ];
}

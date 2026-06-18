<?php

namespace App\Http\Requests\Audit;

use Illuminate\Foundation\Http\FormRequest;

class AuditCreateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'url' => ['required', 'active_url']
        ];
    }
}

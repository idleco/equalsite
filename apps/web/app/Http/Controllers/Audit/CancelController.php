<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CancelAudit;
use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;

class CancelController extends Controller
{
    public function __invoke(Request $request, CancelAudit $action)
    {
        $audit = Audit::query()
            ->where('crawler_id', $request->route('id'))
            ->firstOrFail();

        $action->cancel($audit);

        return back();
    }
}

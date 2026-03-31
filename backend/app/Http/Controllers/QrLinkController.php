<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class QrLinkController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'sourceDocumentNumber' => ['required', 'string', 'max:255'],
        ]);

        $resp = Http::asJson()->post('https://qrupload.dclabs.pl/api/links', $data);

        if ($resp->failed()) {
            return response()->json(
                ['message' => 'Błąd tworzenia linku', 'details' => $resp->json()],
                $resp->status() ?: Response::HTTP_BAD_GATEWAY
            );
        }

        return response()->json($resp->json(), $resp->status());
    }
}

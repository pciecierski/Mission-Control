<?php

namespace App\Http\Controllers;

use App\Models\QueueItem;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class QrLinkController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'sourceDocumentNumber' => ['required', 'string', 'max:255'],
        ]);

        $queueItem = QueueItem::where('numer_awizacji', $data['sourceDocumentNumber'])->first();

        if ($queueItem && ($queueItem->doc_upload_url || $queueItem->qr_code_url)) {
            return response()->json($this->formatLinkPayload($queueItem));
        }

        try {
            $resp = $this->qrUploadClient()->post(config('services.qr_upload.url'), $data);
        } catch (Throwable $e) {
            Log::error('QR link proxy: request failed', [
                'message' => $e->getMessage(),
                'type' => get_class($e),
            ]);

            return response()->json([
                'message' => 'Nie udało się połączyć z serwisem QR.',
                'detail' => config('app.debug') ? $e->getMessage() : null,
            ], Response::HTTP_BAD_GATEWAY);
        }

        if ($resp->failed()) {
            return response()->json(
                ['message' => 'Błąd tworzenia linku', 'details' => $resp->json()],
                $resp->status() ?: Response::HTTP_BAD_GATEWAY
            );
        }

        $payload = $resp->json();
        $uploadUrl = $payload['uploadUrl'] ?? null;
        $qrCodeUrl = $payload['qrCodeUrl'] ?? null;

        if ($queueItem && ($uploadUrl || $qrCodeUrl)) {
            $queueItem->update([
                'doc_upload_url' => $uploadUrl ?? $queueItem->doc_upload_url,
                'qr_code_url' => $qrCodeUrl ?? $queueItem->qr_code_url,
            ]);
        }

        return response()->json($payload, $resp->status());
    }

    /**
     * @return array{uploadUrl: ?string, qrCodeUrl: ?string}
     */
    private function formatLinkPayload(QueueItem $queueItem): array
    {
        return [
            'uploadUrl' => $queueItem->doc_upload_url,
            'qrCodeUrl' => $queueItem->qr_code_url,
        ];
    }

    /**
     * Klient HTTP z obsługą SSL na Windows (brak CA w php.ini) — patrz QR_UPLOAD_VERIFY_SSL w .env.
     */
    private function qrUploadClient(): PendingRequest
    {
        $verify = config('services.qr_upload.verify_ssl');
        $req = Http::asJson()
            ->connectTimeout(8)
            ->timeout(20);

        if ($this->shouldDisableSslVerify($verify)) {
            return $req->withoutVerifying();
        }

        if (is_string($verify) && $verify !== '' && $verify !== '1' && $verify !== 'true' && file_exists($verify)) {
            return $req->withOptions(['verify' => $verify]);
        }

        return $req;
    }

    private function shouldDisableSslVerify(mixed $verify): bool
    {
        if ($verify === false) {
            return true;
        }

        return in_array(strtolower((string) $verify), ['false', '0', 'no', 'off'], true);
    }
}

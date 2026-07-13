<?php

namespace Tests\Feature;

use App\Models\QueueItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class QrLinkPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_proxy_persists_upload_and_qr_urls_on_queue_item(): void
    {
        Http::fake([
            'https://qrupload.dcsandbox.dev/api/links' => Http::response([
                'uploadUrl' => 'https://example.com/upload/aw-100',
                'qrCodeUrl' => 'https://example.com/qr/aw-100.png',
            ], 201),
        ]);

        $item = QueueItem::create([
            'numer_awizacji' => 'AW-100',
            'rodzaj' => 'rozładunek',
            'magazyn' => 'A1',
            'kierowca' => 'Test Driver',
            'numer_pojazdu' => 'WX12345',
            'planowana_data' => '2026-04-30',
            'planowana_godzina' => '10:00:00',
            'godzina_rozpoczecia' => null,
            'ilosc_zamowien' => 0,
            'position' => 1,
            'status' => 'Zakolejkowany',
        ]);

        $response = $this->postJson('/api/links/proxy', [
            'sourceDocumentNumber' => 'AW-100',
        ]);

        $response->assertCreated()
            ->assertJsonPath('uploadUrl', 'https://example.com/upload/aw-100')
            ->assertJsonPath('qrCodeUrl', 'https://example.com/qr/aw-100.png');

        $this->assertDatabaseHas('queue_items', [
            'id' => $item->id,
            'doc_upload_url' => 'https://example.com/upload/aw-100',
            'qr_code_url' => 'https://example.com/qr/aw-100.png',
        ]);
    }

    public function test_proxy_returns_persisted_links_without_calling_external_service(): void
    {
        Http::fake();

        QueueItem::create([
            'numer_awizacji' => 'AW-200',
            'rodzaj' => 'załadunek',
            'magazyn' => 'B2',
            'kierowca' => 'Other Driver',
            'numer_pojazdu' => 'WX99999',
            'planowana_data' => '2026-04-30',
            'planowana_godzina' => '11:00:00',
            'godzina_rozpoczecia' => null,
            'ilosc_zamowien' => 0,
            'position' => 1,
            'status' => 'Zakolejkowany',
            'doc_upload_url' => 'https://example.com/upload/aw-200',
            'qr_code_url' => 'https://example.com/qr/aw-200.png',
        ]);

        $response = $this->postJson('/api/links/proxy', [
            'sourceDocumentNumber' => 'AW-200',
        ]);

        $response->assertOk()
            ->assertJsonPath('uploadUrl', 'https://example.com/upload/aw-200')
            ->assertJsonPath('qrCodeUrl', 'https://example.com/qr/aw-200.png');

        Http::assertNothingSent();
    }

    public function test_queue_index_includes_persisted_document_links(): void
    {
        QueueItem::create([
            'numer_awizacji' => 'AW-300',
            'rodzaj' => 'rozładunek',
            'magazyn' => 'C3',
            'kierowca' => 'Queue Driver',
            'numer_pojazdu' => 'WX30000',
            'planowana_data' => '2026-04-30',
            'planowana_godzina' => '12:00:00',
            'godzina_rozpoczecia' => null,
            'ilosc_zamowien' => 0,
            'position' => 1,
            'status' => 'Zakolejkowany',
            'doc_upload_url' => 'https://example.com/upload/aw-300',
            'qr_code_url' => 'https://example.com/qr/aw-300.png',
        ]);

        $response = $this->getJson('/api/queue');

        $response->assertOk()
            ->assertJsonPath('0.doc_upload_url', 'https://example.com/upload/aw-300')
            ->assertJsonPath('0.qr_code_url', 'https://example.com/qr/aw-300.png');
    }
}

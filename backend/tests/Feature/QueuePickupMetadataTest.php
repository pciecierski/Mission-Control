<?php

namespace Tests\Feature;

use App\Models\QueueItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QueuePickupMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_store_operator_metadata_when_marking_queue_item_as_in_progress(): void
    {
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

        $pickedAt = now()->toIso8601String();

        $response = $this->patchJson("/api/queue/{$item->id}", [
            'status' => 'Realizowane',
            'pobrana_przez_identyfikator' => 'SCAN-500',
            'pobrana_przez_inicjaly' => 'JK',
            'pobrana_at' => $pickedAt,
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'Realizowane')
            ->assertJsonPath('pobrana_przez_identyfikator', 'SCAN-500')
            ->assertJsonPath('pobrana_przez_inicjaly', 'JK');

        $this->assertDatabaseHas('queue_items', [
            'id' => $item->id,
            'status' => 'Realizowane',
            'pobrana_przez_identyfikator' => 'SCAN-500',
            'pobrana_przez_inicjaly' => 'JK',
        ]);
    }
}

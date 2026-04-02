<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Models\QueueItem;
use App\Models\QueueOrder;

class QueueItemController extends Controller
{
    public function index()
    {
        $items = QueueItem::with('orders')->orderBy('position')->orderBy('id')->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $orders = $this->validateOrders($request);

        $item = DB::transaction(function () use ($data, $orders) {
            $maxPosition = QueueItem::max('position') ?? 0;
            $data['position'] = $maxPosition + 1;
            $data['status'] = $data['status'] ?? 'Oczekujący';
            $data['ilosc_zamowien'] = count($orders);

            $queueItem = QueueItem::create($data);
            $this->syncOrders($queueItem, $orders);

            return $queueItem->load('orders');
        });

        return response()->json($item, Response::HTTP_CREATED);
    }

    public function update(Request $request, QueueItem $queueItem)
    {
        $data = $this->validateData($request, partial: true);
        $orders = $this->validateOrders($request, partial: true);

        $queueItem = DB::transaction(function () use ($queueItem, $data, $orders) {
            $queueItem->update($data);
            if ($orders !== null) {
                $this->syncOrders($queueItem, $orders);
                $queueItem->update(['ilosc_zamowien' => count($orders)]);
            }
            return $queueItem->load('orders');
        });

        return response()->json($queueItem);
    }

    public function destroy(QueueItem $queueItem)
    {
        $queueItem->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    // Debug helper: echo method and payload (do not leave long-term in prod)
    public function debugMethod(Request $request)
    {
        return response()->json([
            'method' => $request->method(),
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);
    }

    public function close(Request $request)
    {
        $data = $request->validate([
            'sourceDocumentNumber' => ['required', 'string', 'max:255'],
        ]);

        $queueItem = QueueItem::with('orders')
            ->where('numer_awizacji', $data['sourceDocumentNumber'])
            ->first();

        if (!$queueItem) {
            return response()->json(['message' => 'Obiekt nie znaleziony'], Response::HTTP_NOT_FOUND);
        }

        $queueItem->update(['status' => 'Zakończone']);

        return response()->json($queueItem->fresh('orders'));
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:queue_items,id'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['order'] as $position => $id) {
                QueueItem::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return response()->json(['status' => 'ok']);
    }

    private function validateData(Request $request, bool $partial = false): array
    {
        $rules = [
            'numer_awizacji' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'rodzaj' => [$partial ? 'sometimes' : 'required', 'in:rozładunek,załadunek'],
            'magazyn' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'kierowca' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'numer_pojazdu' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'planowana_data' => [$partial ? 'sometimes' : 'required', 'date'],
            'planowana_godzina' => [$partial ? 'sometimes' : 'nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'godzina_rozpoczecia' => [$partial ? 'sometimes' : 'nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'status' => [$partial ? 'sometimes' : 'nullable', 'in:Oczekujący,Zakolejkowany,Realizowane,Zakończone'],
        ];

        return $request->validate($rules);
    }

    private function validateOrders(Request $request, bool $partial = false): ?array
    {
        if ($partial && !$request->has('orders')) {
            return null;
        }

        $validated = $request->validate([
            'orders' => ['sometimes', 'array'],
            'orders.*.strefa' => ['required_with:orders', 'string', 'max:255'],
            'orders.*.grupa_towarowa' => ['required_with:orders', 'string', 'max:255'],
            'orders.*.dostawca' => ['required_with:orders', 'string', 'max:255'],
            'orders.*.ilosc_nosnikow' => ['required_with:orders', 'integer', 'min:0'],
            'orders.*.ilosc_referencji' => ['required_with:orders', 'integer', 'min:0'],
        ]);

        return $validated['orders'] ?? [];
    }

    private function syncOrders(QueueItem $item, array $orders): void
    {
        $item->orders()->delete();
        $item->orders()->createMany($orders);
    }
}

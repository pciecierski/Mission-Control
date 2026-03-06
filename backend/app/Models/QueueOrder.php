<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueOrder extends Model
{
    protected $fillable = [
        'queue_item_id',
        'strefa',
        'grupa_towarowa',
        'dostawca',
        'ilosc_nosnikow',
        'ilosc_referencji',
    ];

    public function queueItem()
    {
        return $this->belongsTo(QueueItem::class);
    }
}

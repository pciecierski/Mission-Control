<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueItem extends Model
{
    protected $fillable = [
        'numer_awizacji',
        'rodzaj',
        'magazyn',
        'kierowca',
        'numer_pojazdu',
        'planowana_data',
        'planowana_godzina',
        'godzina_rozpoczecia',
        'ilosc_zamowien',
        'position',
        'status',
        'pobrana_przez_identyfikator',
        'pobrana_przez_inicjaly',
        'pobrana_at',
    ];

    protected $casts = [
        'pobrana_at' => 'datetime',
    ];

    public function orders()
    {
        return $this->hasMany(QueueOrder::class);
    }
}

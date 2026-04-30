<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'identifier',
        'first_name',
        'last_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}

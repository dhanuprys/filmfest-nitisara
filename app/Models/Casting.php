<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Casting extends Model
{
    use HasFactory;

    protected $fillable = [
        'film_id',
        'real_name',
        'film_name',
    ];

    public function film()
    {
        return $this->belongsTo(Film::class);
    }
}

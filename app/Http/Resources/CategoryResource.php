<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'is_active' => $this->is_active,
            'event_year_id' => $this->event_year_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'eventYear' => $this->whenLoaded('eventYear', function () {
                return [
                    'id' => $this->eventYear->id,
                    'title' => $this->eventYear->title,
                    'year' => $this->eventYear->year,
                    'show_start' => $this->eventYear->show_start,
                    'show_end' => $this->eventYear->show_end,
                ];
            }),
            'participants' => $this->participants,
            'films' => $this->films,
            'total_films' => $this->total_films,
            'verified_films_count' => $this->verified_films_count,
            'pending_films_count' => $this->pending_films_count,
            'ranked_films_count' => $this->ranked_films_count,
            'total_votes' => $this->total_votes,
        ];
    }
}

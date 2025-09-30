<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

class DateRangeFilter extends Filter
{
    public function __construct(protected string $field) {}

    public function apply(Builder $query): Builder
    {
        return $query->whereBetween($this->field, [
            $value['start'] ?? null,
            $value['end'] ?? null
        ]);
    }
}

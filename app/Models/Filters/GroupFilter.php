<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

class GroupFilter extends Filter
{
    /**
     * Define the filters for Inventory model
     *
     * @param  Builder  $query
     * @return void
     */
    public function apply(Builder $query): Builder
    {
        return $query;
    }
}

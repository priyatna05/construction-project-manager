<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

class InventoryFilter extends Filter
{
    /**
     * Define the filters for Inventory model
     *
     * @param  Builder  $query
     * @return void
     */
    public function apply(Builder $query): Builder
    {
       return $query
            // filter by status (single or multiple)
            ->in('status')

            // filter by type (single or multiple)
            ->in('type')

            // filter by unit
            ->in('unit')

            // filter by project location
            ->in('location_inventory')

            // search by name or code (partial match)
            ->search(['name_inventory', 'code_inventory'])

            // quantity range: min and max
            ->between('quantity_inventory', 'min_quantity', 'max_quantity')

            // cost range: min and max
            ->between('unit_cost', 'min_cost', 'max_cost')

            // date range: created_at from/to
            ->betweenDates('created_at', 'from_date', 'to_date');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $symbol
 * @property int $decimals
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ClientCompany> $clientCompanies
 * @property-read int|null $client_companies_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereDecimals($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereSymbol($value)
 * @mixin \Eloquent
 * @mixin IdeHelperCurrency
 */
class Currency extends Model
{
    public function clientCompanies(): HasMany
    {
        return $this->hasMany(ClientCompany::class);
    }

    public static function dropdownValues($options = []): array
    {
        return self::orderBy('name')
            ->when(isset($options['with']), fn ($query) => $query->with($options['with']))
            ->get()
            ->map(fn ($i) => array_merge([
                'value' => (string) $i->id,
                'label' => "{$i->name} ({$i->symbol})",
            ], isset($options['with']) ? $i->toArray() : []))
            ->toArray();
    }
}

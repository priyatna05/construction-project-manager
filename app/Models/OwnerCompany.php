<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use OwenIt\Auditing\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * @property int $id
 * @property int|null $country_id
 * @property int|null $currency_id
 * @property string $name
 * @property string|null $logo
 * @property string|null $address
 * @property string|null $postal_code
 * @property string|null $city
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $web
 * @property int $tax
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $clients
 * @property-read int|null $clients_count
 * @property-read \App\Models\Country|null $country
 * @property-read \App\Models\Currency|null $currency
 * @method static \Database\Factories\OwnerCompanyFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereCurrencyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OwnerCompany whereWeb($value)
 * @mixin \Eloquent
 * @mixin IdeHelperOwnerCompany
 */
class OwnerCompany extends Model implements AuditableContract
{
    use Auditable, HasFactory;

    protected $table = 'owner_companies';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'logo',
        'address',
        'postal_code',
        'city',
        'country_id',
        'currency_id',
        'email',
        'phone',
        'web',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'client_company_user', 'owner_company_id', 'user_id');
    }
}

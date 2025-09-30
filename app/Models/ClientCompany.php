<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * @property int $id
 * @property int|null $country_id
 * @property int|null $currency_id
 * @property string $name
 * @property string|null $address
 * @property string|null $postal_code
 * @property string|null $city
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $web
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $clients
 * @property-read int|null $clients_count
 * @property-read \App\Models\Country|null $country
 * @property-read \App\Models\Currency|null $currency
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Invoice> $invoices
 * @property-read int|null $invoices_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @method static \Database\Factories\ClientCompanyFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany search(?string $search, ?array $searchable = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany searchByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany sort(?array $sort = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany sortByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereCountryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereCurrencyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ClientCompany whereWeb($value)
 * @mixin \Eloquent
 * @mixin IdeHelperClientCompany
 */
class ClientCompany extends Model implements AuditableContract
{
    use Archivable, Auditable, HasFactory, IsSearchable, IsSortable;

    protected $fillable = [
        'name',
        'address',
        'postal_code',
        'city',
        'country_id',
        'currency_id',
        'email',
        'phone',
        'web',
    ];

    protected $searchable = [
        'name',
        'email',
    ];

    protected $sortable = [
        'name' => 'asc',
        'email',
    ];

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'client_company_user', 'client_company_id', 'user_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public static function dropdownValues($options = []): array
    {
        return self::orderBy('name')
            ->when(in_array('hasProjects', $options), fn ($query) => $query->has('projects'))
            ->get(['id', 'name'])
            ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
            ->toArray();
    }

    /**
     * Generate 3-letter prefix from company name,
     * e.g. "Acme Corporation Ltd" → "ACL"
     */
    public function getCodePrefix(): string
    {
        $parts = preg_split('/\s+/', trim($this->name), -1, PREG_SPLIT_NO_EMPTY);
        $initials = array_map(fn($w) => strtoupper(substr($w, 0, 1)), array_slice($parts, 0, 3));
        // Pad dengan "X" jika kurang dari 3 huruf
        return str_pad(implode('', $initials), 3, 'X');
    }
}

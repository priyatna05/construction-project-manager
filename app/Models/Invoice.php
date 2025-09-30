<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use App\Models\InvoiceItem;

/**
 * @property int $id
 * @property int $client_company_id
 * @property int|null $project_id
 * @property int $created_by_user_id
 * @property string $number
 * @property string $status
 * @property string|null $type
 * @property string|null $note
 * @property string|null $terms
 * @property string $subtotal_amount
 * @property string $tax_amount
 * @property string $total_amount
 * @property string $invoice_date
 * @property string|null $due_date
 * @property string|null $paid_at
 * @property string|null $filename
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property string|null $updated_at
 * @property string|null $deleted_at
 * @property-read \App\Models\ClientCompany $clientCompany
 * @property-read \App\Models\User $createdByUser
 * @property-read \Illuminate\Database\Eloquent\Collection<int, InvoiceItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Label> $labels
 * @property-read int|null $labels_count
 * @property-read \App\Models\Project|null $project
 * @method static \Database\Factories\InvoiceFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice search(?string $search, ?array $searchable = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice searchByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice sort(?array $sort = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice sortByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereClientCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereCreatedByUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereFilename($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereInvoiceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice wherePaidAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereSubtotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereTerms($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereUpdatedAt($value)
 * @mixin \Eloquent
 * @mixin IdeHelperInvoice
 */
class Invoice extends Model
{
    use Archivable, IsSearchable, IsSortable, HasFactory;

    const UPDATED_AT = null;

     protected $fillable = [
        'project_id',
        'client_company_id',
        'created_by_user_id',
        'number',
        'status',
        'type',
        'subtotal_amount',
        'tax_amount',
        'total_amount',
        'due_date',
        'note',
        'terms',
        'filename',
        'paid_at',
    ];

    protected $searchable = [
        'number',
        'status',
    ];

    protected $sortable = [
        'client_company_id',
        'project_id',
        'number',
        'status',
        'type',
        'amount',
        'amount_with_tax',
        'due_date',
        'note',
        'created_at' => 'desc',
    ];

    protected $dates = ['due_date'];

     public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class);
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable', 'labelables');
    }

    public static function getNextNumber(): string
    {
        $number = 0;
        $last = self::latest()->first();

        if ($last?->created_at->isCurrentYear()) {
            $number = (int) Str::substr($last->number, 4);
        }

        return (string) Str::of(++$number)
            ->padLeft(4, '0')
            ->prepend(today()->year);
    }
}

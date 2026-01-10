<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use Overtrue\LaravelFavorite\Traits\Favoriteable;
use OwenIt\Auditing\Auditable;
use Illuminate\Support\Facades\Auth;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use DateTimeInterface;

/**
 * @property int $id
 * @property int $client_company_id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property numeric|null $budget_project_estimate
 * @property string $progress_project
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property string|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \App\Models\ClientCompany $clientCompany
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EvmRecord> $evmRecords
 * @property-read int|null $evm_records_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $favoritedByAuthUser
 * @property-read int|null $favorited_by_auth_user_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $favoriters
 * @property-read int|null $favoriters_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Overtrue\LaravelFavorite\Favorite> $favorites
 * @property-read int|null $favorites_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Inventory> $inventories
 * @property-read int|null $inventories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Label> $labels
 * @property-read int|null $labels_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskGroup> $taskGroups
 * @property-read int|null $task_groups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project byClient($clientCompanyId)
 * @method static \Database\Factories\ProjectFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project filterByDuration($min = null, $max = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project search(?string $search, ?array $searchable = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project searchByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project sort(?array $sort = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project sortByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereBudgetProject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereClientCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereProgressProject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUpdatedAt($value)
 * @mixin \Eloquent
 * @mixin IdeHelperProject
 */
class Project extends Model implements AuditableContract
{
    use Archivable, Auditable, Favoriteable, IsSearchable, IsSortable, HasFactory;

    protected $fillable = [
        'client_company_id',
        'client_user_id',
        'code',
        'name',
        'description',
        'start_date',
        'end_date',
        'direct_cost_plan',
        'direct_cost_actual',
        'overhead_site_rate',
        'administrative_rate',
        'contingency_rate',
        'profit_rate',
        'tax_rate',
        'budget_project_estimate',
        'budget_project_final',
        'budget_project_actual',
        'budget_project_grandtotal',
        // New separate plan and actual cost fields
        'overhead_site_cost_plan',
        'administrative_cost_plan',
        'contingency_cost_plan',
        'profit_cost_plan',
        'tax_cost_plan',
        'budget_project_final_plan',
        'budget_project_grandtotal_plan',
        'overhead_site_cost_actual',
        'administrative_cost_actual',
        'contingency_cost_actual',
        'profit_cost_actual',
        'tax_cost_actual',
        'budget_project_grandtotal_actual',
        'is_completed',
        'completed_at',
    ];

    protected $searchable = ['name'];
    protected $sortable = ['name'];

    protected $observables = ['archived', 'unArchived', 'deleted'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget_project_estimate' => 'decimal:2',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function filters(): array
    {
        return [];
    }

    /**
     * Relasi ke perusahaan klien (ClientCompany)
     */
    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class, 'client_company_id');
    }
    /**
     * Relasi ke user klien (individual)
     */
    public function clientUsers(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    /**
     * Relasi ke pengguna yang memiliki akses ke proyek ini
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user_access');
    }

    /**
     * Relasi ke Task Groups (Kelompok Tugas)
     */
    public function taskGroups(): HasMany
    {
        return $this->hasMany(TaskGroup::class);
    }

    /**
     * Relasi ke Tugas (Tasks) dalam proyek ini
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relasi ke inventory dalam proyek ini
     */
    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * Relasi ke attachments ke dalam proyek ini
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
    /**
     * Mendapatkan semua label yang terhubung dengan proyek ini.
     */
    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }

    public function type()
    {
        return $this->labels()->where('type', Label::TYPE_KONTRAK);
    }

    public function statuses()
    {
        return $this->labels()->where('type', Label::TYPE_PROJECT_TASK_STATUS);
    }
    /**
     * Relasi ke favorit proyek oleh pengguna yang sedang login
     */
    public function favoritedByAuthUser(): BelongsToMany
    {
        return $this->belongsToMany(
            config('auth.providers.users.model'),
            config('favorite.favorites_table'),
            'favoriteable_id',
            config('favorite.user_foreign_key')
        )->withTimestamps()
            ->where('favoriteable_type', $this->getMorphClass())
            ->where('user_id', Auth::id());
    }

    /**
     * Relasi ke log aktivitas proyek
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * Scope untuk filter proyek berdasarkan Client Company ID
     */
    public function scopeByClient($query, $clientCompanyId)
    {
        return $query->where('client_company_id', $clientCompanyId);
    }

    /**
     * Mengembalikan daftar proyek dalam format untuk dropdown
     */
    public static function dropdownValues(): array
    {
        return self::orderBy('name')->pluck('name', 'id')->toArray();
    }

    public function scopeFilterByDuration($query, $min = null, $max = null)
    {
        if ($min !== null) {
            $query->whereRaw('DATEDIFF(end_date, start_date) + 1 >= ?', [$min]);
        }

        if ($max !== null) {
            $query->whereRaw('DATEDIFF(end_date, start_date) + 1 <= ?', [$max]);
        }

        return $query;
    }

    /**
     * Serialize dates as Y-m-d (date-only) to avoid timezone shifts
     * when converting models to arrays/JSON (broadcasts / API responses).
     */
    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d');
    }

    /**
     * record EVM Analisis
     */
    public function evmRecords(): HasMany
    {
        return $this->hasMany(EvmRecord::class);
    }
}

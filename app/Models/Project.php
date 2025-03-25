<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use Overtrue\LaravelFavorite\Traits\Favoriteable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Project extends Model implements AuditableContract
{
    use Archivable, Auditable, Favoriteable, IsSearchable, IsSortable;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'budget',
        'client_company_id',
    ];

    protected $searchable = ['name'];

    protected $observables = ['archived', 'unArchived'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
    ];

    /**
     * Relasi ke perusahaan klien (ClientCompany)
     */
    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class);
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
     * Relasi ke favorit proyek oleh pengguna yang sedang login
     */
    public function favoritedByAuthUser(): BelongsToMany
    {
        return $this->belongsToMany(
            config('auth.providers.users.model'),
            config('favorite.favorites_table'),
            'favoriteable_id',
            config('favorite.user_foreign_key')
        )
            ->where('favoriteable_type', $this->getMorphClass())
            ->where('user_id', auth()->id());
    }

    /**
     * Relasi ke log aktivitas proyek
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activity_capable');
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
}

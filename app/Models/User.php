<?php

namespace App\Models;

use Illuminate\Support\Str;
use OwenIt\Auditing\Auditable;
use Laravel\Sanctum\HasApiTokens;
use LaravelArchivable\Archivable;
use App\Services\PermissionService;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Overtrue\LaravelFavorite\Traits\Favoriter;
use Illuminate\Auth\Passwords\CanResetPassword;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $avatar
 * @property string|null $phone
 * @property string|null $job_title
 * @property string|null $address
 * @property string|null $google_id
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property string|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InventoryTaskAllocation> $allocatedInventories
 * @property-read int|null $allocated_inventories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ClientCompany> $clientCompanies
 * @property-read int|null $client_companies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Overtrue\LaravelFavorite\Favorite> $favorites
 * @property-read int|null $favorites_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $subscribedToTasks
 * @property-read int|null $subscribed_to_tasks_count
 * @property-read int|null $timesheets_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User search(?string $search, ?array $searchable = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User searchByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User sort(?array $sort = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User sortByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDefaultHourlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGoogleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereJobTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 * @mixin \Eloquent
 * @mixin IdeHelperUser
 */
class User extends Authenticatable implements AuditableContract, CanResetPasswordContract, MustVerifyEmail
{
    use Archivable, Auditable, CanResetPassword, Favoriter, HasApiTokens, HasFactory, HasRoles, IsSearchable, IsSortable, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'job_title',
        'avatar',
        'phone',
        'address',
        'google_id',
        'archived_at',
    ];

    protected $searchable = [
        'name',
        'email',
        'job_title',
    ];

    protected $sortable = [
        'name' => 'asc',
        'email',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'archived_at' => 'datetime',
    ];

    public function getFirstName(): string
    {
        return Str::beforeLast($this->name, ' ');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isNotAdmin(): bool
    {
        return ! $this->isAdmin();
    }

    public function clientCompanies(): BelongsToMany
    {
        return $this->belongsToMany(ClientCompany::class, 'client_company_user', 'user_id', 'client_company_id');
    }

    /**
     * Projects that user can access
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user_access');
    }

    public function subscribedToTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_user_subscriptions');
    }

    public function hasProjectAccess(Project $project): bool
    {
        $users = PermissionService::usersWithAccessToProject($project);

        return $users->pluck('id')->contains($this->id);
    }

    public static function userDropdownValues(
        array $excludeRoles = ['client'],
        ?int $excludeUserId = null,
    ): array {
        return self::query()
            ->orderBy('name')
            ->when(
                !empty($excludeRoles),
                fn($q) =>
                $q->withoutRole($excludeRoles)
            )
            ->when(
                $excludeUserId,
                fn($q) =>
                $q->where('id', '!=', $excludeUserId)
            )
            ->get(['id', 'name', 'avatar'])
            ->map(fn($i) => [
                'id' => (int) $i->id,
                'value' => (string) $i->id,
                'label' => $i->name,
                'name' => $i->name,
                'avatar' => $i->avatar,
            ])
            ->toArray();
    }


    public static function clientDropdownValues(): array
    {
        return self::orderBy('name')
            ->role('client')
            ->get(['id', 'name', 'avatar'])
            ->map(fn($i) => [
                'id' => (int) $i->id,
                'value' => (string) $i->id,
                'label' => $i->name,
                'name' => $i->name,
                'avatar' => $i->avatar,
            ])
            ->toArray();
    }

    public function allocatedInventories()
    {
        return $this->hasMany(InventoryTaskAllocation::class);
    }
}

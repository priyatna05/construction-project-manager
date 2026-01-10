<?php

namespace App\Actions\Client;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UpdateClient
{
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Update data dasar user
            $user->name = $data['name'] ?? $user->name;
            $user->phone = $data['phone'] ?? null;
            $user->email = $data['email'] ?? $user->email;
            $user->address = $data['address'] ?? null;

            // Handle password update
            if (isset($data['password']) && !empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            // // === Handle Avatar ===
            // \Log::info('UpdateClient: Avatar data received', [
            //     'has_avatar_key' => array_key_exists('avatar', $data),
            //     'avatar_value' => $data['avatar'] ?? 'NOT_SET',
            //     'avatar_type' => gettype($data['avatar'] ?? null),
            //     'current_user_avatar' => $user->avatar,
            //     'all_data_keys' => array_keys($data)
            // ]);

            // Always check for avatar field, even if it's null
            if (array_key_exists('avatar', $data)) {
                $avatarPath = UserService::storeOrFetchAvatar($user, $data['avatar']);
                $user->avatar = $avatarPath;
                // \Log::info('UpdateClient: Avatar updated', ['new_path' => $avatarPath]);
            } else {
                // \Log::info('UpdateClient: Avatar field not present in request data');
            }

            $user->save();

            // Sync companies relation
            if (isset($data['companies'])) {
                $user->clientCompanies()->sync($data['companies']);
            } else {
                $user->clientCompanies()->sync([]);
            }

            return $user;
        });
    }
}

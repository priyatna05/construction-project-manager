<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class UserService
{
    /**
     * Store avatar if uploaded by user
     * otherwise attempt to fetch it via unavatar.io service
     */
   public static function storeOrFetchAvatar(User $user, $avatar = null): ?string
    {

        if ($avatar instanceof UploadedFile) {
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }

            $filename = $user->id.'.'.$avatar->getClientOriginalExtension();
            $path = $avatar->storePubliclyAs('avatars', $filename, 'public');

            return "/storage/{$path}";
        }
        else if ($avatar === null) {
            if ($user->avatar) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }
            return null;
        }
        else if (!$user->avatar && $user->email) {
            $filepath = storage_path("app/public/avatars/{$user->id}.jpg");

            try {
                $response = Http::timeout(20)
                    ->sink($filepath)
                    ->get("https://unavatar.io/{$user->email}?fallback=false");

                if ($response->successful()) {
                    return "/storage/avatars/{$user->id}.jpg";
                } else {
                    File::delete($filepath);
                    return null;
                }
            } catch (\Exception $e) {
                return null;
            }
        }

        return $user->avatar;
    }
}

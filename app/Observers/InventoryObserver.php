<?php

namespace App\Observers;

use App\Models\Inventory;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use function rand;
use function mt_rand;

class InventoryObserver
{
    public function creating(Inventory $inventory): void
    {
        if (!empty($inventory->code)) {
            return;
        }

        $maxAttempts = 7;
        $attempt = 0;
        $uniqueCodeGenerated = false;

        // Load labels if not loaded
        if (!$inventory->relationLoaded('labels')) {
            $inventory->load('labels');
        }

        // Get type prefix from config
        $typeLabelSlug = strtolower($inventory->type_label?->slug ?? '');
        $prefixMap = config('inventory.prefixes');
        $typePrefix = $prefixMap[$typeLabelSlug] ?? config('inventory.default_prefix');

        // Project code segment
        $projectCodeSegment = 'NPROJ';
        if ($inventory->project_site_location_id) {
            $project = $inventory->relationLoaded('projectSiteLocation')
                ? $inventory->projectSiteLocation
                : Project::find($inventory->project_site_location_id);

            if ($project && filled($project->code)) {
                $projectCodeParts = explode('-', $project->code);
                $projectCodeSegment = strtoupper($projectCodeParts[0]);
            }
        }

        // Attempt to generate unique code
        while (!$uniqueCodeGenerated && $attempt < $maxAttempts) {
            $attempt++;
            $sequence = 1;

            try {
                DB::beginTransaction();

                $lastInventory = Inventory::where('code', 'like', "{$typePrefix}-{$projectCodeSegment}-%")
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(code, "-", -2), "-", 1) AS UNSIGNED) DESC, id DESC')
                    ->first();

                if ($lastInventory && filled($lastInventory->code)) {
                    $parts = explode('-', $lastInventory->code);
                    if (count($parts) >= 3 && is_numeric($parts[count($parts) - 2])) {
                        $sequence = (int)$parts[count($parts) - 2] + 1;
                    }
                }

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error("InventoryObserver: Error generating sequence: {$e->getMessage()}");
                $sequence = time() % 10000 + \rand(0, 999);
            }

            $newCode = $this->generateCode($typePrefix, $projectCodeSegment, $sequence);

            if (!Inventory::where('code', $newCode)->withoutGlobalScopes()->exists()) {
                $inventory->code = $newCode;
                $uniqueCodeGenerated = true;
                Log::info("InventoryObserver: Generated code: {$newCode}");
            } else {
                Log::warning("InventoryObserver: Duplicate code '{$newCode}' on attempt {$attempt}");
                usleep(\rand(75000, 200000));
            }
        }

        // Fallback code
        if (!$uniqueCodeGenerated) {
            $fallbackSuffix = strtoupper(Str::random(5)) . \rand(10, 99);
            $fallbackCode = "{$typePrefix}-{$projectCodeSegment}-{$fallbackSuffix}";

            if (Inventory::where('code', $fallbackCode)->exists()) {
                $fallbackCode = "{$typePrefix}-{$projectCodeSegment}-" . strtoupper(Str::random(8));
            }

            $inventory->code = $fallbackCode;
            Log::error("InventoryObserver: Fallback used after {$maxAttempts} attempts. Final code: {$inventory->code}");
        }
    }

    /**
     * Generate inventory code with padded sequence and random suffix
     */
    protected function generateCode(string $typePrefix, string $projectCodeSegment, int $sequence): string
    {
        $paddedSequence = str_pad($sequence, 4, '0', STR_PAD_LEFT);
        $randomSuffix = str_pad(\mt_rand(0, 99), 2, '0', STR_PAD_LEFT);

        return "{$typePrefix}-{$projectCodeSegment}-{$paddedSequence}-{$randomSuffix}";
    }

}

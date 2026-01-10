<?php

namespace App\Actions\Inventory;

use App\Models\Inventory;
use App\Services\InventoryService;

class CreateInventory
{
    public function __construct(protected InventoryService $service){}

    /**
     * Generate inventory code with padded sequence and random suffix
     */
    protected function generateCode(string $typePrefix, string $unused, int $sequence): string
    {
        $paddedSequence = str_pad($sequence, 4, '0', STR_PAD_LEFT);
        $randomSuffix = str_pad(rand(0, 99), 2, '0', STR_PAD_LEFT);

        return "{$typePrefix}-{$paddedSequence}-{$randomSuffix}";
    }

    public function execute(array $data): Inventory
    {
        $dataForCreate = $data;
        unset($dataForCreate['status'], $dataForCreate['type'], $dataForCreate['unit']);

        $inventory = $this->service->create($dataForCreate);

    if (isset($data['type'])) {
        try {
            $inventory->setTypeLabel($data['type']);
        } catch (\Exception $e) {
        }
    }

    if (isset($data['status'])) {
        try {
            $inventory->setStatusLabel($data['status']);
        } catch (\Exception $e) {
        }
    }

    if (isset($data['unit'])) {
        try {
            $inventory->setUnitLabel($data['unit']);
        } catch (\Exception $e) {
        }
    }

    $inventory->load('labels');

    if ($inventory->type_label) {
        $prefixMap = config('inventory.prefixes');
        $typePrefix = $prefixMap[$inventory->type_label->slug] ?? config('inventory.default_prefix');

        $maxAttempts = 7;
        $attempt = 0;
        $uniqueCodeGenerated = false;

        while (!$uniqueCodeGenerated && $attempt < $maxAttempts) {
            $attempt++;
            $sequence = 1;

            try {
                \Illuminate\Support\Facades\DB::beginTransaction();

                $lastInventory = \App\Models\Inventory::where('code', 'like', "{$typePrefix}-%")
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(code, "-", -2), "-", 1) AS UNSIGNED) DESC, id DESC')
                    ->first();

                if ($lastInventory && filled($lastInventory->code)) {
                    $parts = explode('-', $lastInventory->code);
                    if (count($parts) >= 3 && is_numeric($parts[count($parts) - 2])) {
                        $sequence = (int)$parts[count($parts) - 2] + 1;
                    }
                }

                \Illuminate\Support\Facades\DB::commit();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                // \Illuminate\Support\Facades\Log::error("CreateInventory: Error generating sequence: {$e->getMessage()}");
                $sequence = time() % 10000 + rand(0, 999);
            }

            $newCode = $this->generateCode($typePrefix, '', $sequence);

            if (!\App\Models\Inventory::where('code', $newCode)->withoutGlobalScopes()->exists()) {
                $inventory->code = $newCode;
                $inventory->save();
                $uniqueCodeGenerated = true;
                // \Illuminate\Support\Facades\Log::info("CreateInventory: Generated code: {$newCode}");
            } else {
                // \Illuminate\Support\Facades\Log::warning("CreateInventory: Duplicate code '{$newCode}' on attempt {$attempt}");
                usleep(rand(75000, 200000));
            }
        }

        // Fallback code
        if (!$uniqueCodeGenerated) {
            $fallbackSuffix = strtoupper(\Illuminate\Support\Str::random(5)) . rand(10, 99);
            $fallbackCode = "{$typePrefix}-{$fallbackSuffix}";

            if (\App\Models\Inventory::where('code', $fallbackCode)->exists()) {
                $fallbackCode = "{$typePrefix}-" . strtoupper(\Illuminate\Support\Str::random(8));
            }

            $inventory->code = $fallbackCode;
            $inventory->save();
            \Illuminate\Support\Facades\Log::error("CreateInventory: Fallback used after {$maxAttempts} attempts. Final code: {$inventory->code}");
        }
    }

    return $inventory;
    }
}

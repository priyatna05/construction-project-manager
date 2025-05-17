<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;
use App\Enums\InventoryType;
use App\Enums\InventoryUnit;
use App\Enums\InventoryStatus;

class InventoriesSeeder extends Seeder
{
    public function run(): void
    {
        // MATERIAL Inventories
        $this->createMaterialInventories();

        // EQUIPMENT Inventories
        $this->createEquipmentInventories();

        // LABOR Inventories
        $this->createLaborInventories();

        // Additional Inventories
        $this->createAdditionalInventories();
    }

    private function createMaterialInventories(): void
    {
        $materials = [
            [
                'name_inventory' => 'Semen Portland',
                'code_inventory' => 'MAT001',
                'type' => InventoryType::MATERIAL->value,
                'description_inventory' => 'Semen Portland Tipe I untuk konstruksi umum',
                'unit' => InventoryUnit::KG->value,
                'unit_cost' => 1200.00,
            ],
            [
                'name_inventory' => 'Besi Beton',
                'code_inventory' => 'MAT002',
                'type' => InventoryType::MATERIAL->value,
                'description_inventory' => 'Besi beton untuk konstruksi',
                'unit' => InventoryUnit::KG->value,
                'unit_cost' => 15000.00,
            ],
            [
                'name_inventory' => 'Pasir',
                'code_inventory' => 'MAT003',
                'type' => InventoryType::MATERIAL->value,
                'description_inventory' => 'Pasir konstruksi berkualitas',
                'unit' => InventoryUnit::TON->value,
                'unit_cost' => 250000.00,
            ],
            [
                'name_inventory' => 'Batu Split',
                'code_inventory' => 'MAT004',
                'type' => InventoryType::MATERIAL->value,
                'description_inventory' => 'Batu split untuk campuran beton',
                'unit' => InventoryUnit::TON->value,
                'unit_cost' => 280000.00,
            ]
        ];

        foreach ($materials as $material) {
            Inventory::create(array_merge($material, [
                'status' => InventoryStatus::ACTIVE->value
            ]));
        }
    }

    private function createEquipmentInventories(): void
    {
        $equipment = [
            [
                'name_inventory' => 'Excavator',
                'code_inventory' => 'EQP001',
                'type' => InventoryType::EQUIPMENT->value,
                'description_inventory' => 'Excavator untuk pekerjaan galian',
                'unit' => InventoryUnit::HOUR->value,
                'unit_cost' => 350000.00,
            ],
            [
                'name_inventory' => 'Concrete Mixer',
                'code_inventory' => 'EQP002',
                'type' => InventoryType::EQUIPMENT->value,
                'description_inventory' => 'Mesin pengaduk beton',
                'unit' => InventoryUnit::DAY->value,
                'unit_cost' => 850000.00,
            ],
            [
                'name_inventory' => 'Dump Truck',
                'code_inventory' => 'EQP003',
                'type' => InventoryType::EQUIPMENT->value,
                'description_inventory' => 'Truk pengangkut material',
                'unit' => InventoryUnit::DAY->value,
                'unit_cost' => 1200000.00,
            ],
            [
                'name_inventory' => 'Tower Crane',
                'code_inventory' => 'EQP004',
                'type' => InventoryType::EQUIPMENT->value,
                'description_inventory' => 'Crane untuk konstruksi gedung bertingkat',
                'unit' => InventoryUnit::MONTH->value,
                'unit_cost' => 45000000.00,
            ]
        ];

        foreach ($equipment as $item) {
            Inventory::create(array_merge($item, [
                'status' => InventoryStatus::ACTIVE->value
            ]));
        }
    }

    private function createLaborInventories(): void
    {
        $labor = [
            [
                'name_inventory' => 'Pekerja',
                'code_inventory' => 'LAB001',
                'type' => InventoryType::LABOR->value,
                'description_inventory' => 'Pekerja konstruksi umum',
                'unit' => InventoryUnit::DAY->value,
                'unit_cost' => 150000.00,
            ],
            [
                'name_inventory' => 'Tukang',
                'code_inventory' => 'LAB002',
                'type' => InventoryType::LABOR->value,
                'description_inventory' => 'Tukang ahli konstruksi',
                'unit' => InventoryUnit::DAY->value,
                'unit_cost' => 200000.00,
            ],
            [
                'name_inventory' => 'Mandor',
                'code_inventory' => 'LAB003',
                'type' => InventoryType::LABOR->value,
                'description_inventory' => 'Mandor pengawas pekerjaan',
                'unit' => InventoryUnit::MONTH->value,
                'unit_cost' => 6000000.00,
            ],
            [
                'name_inventory' => 'Site Engineer',
                'code_inventory' => 'LAB004',
                'type' => InventoryType::LABOR->value,
                'description_inventory' => 'Engineer lapangan',
                'unit' => InventoryUnit::MONTH->value,
                'unit_cost' => 8000000.00,
            ]
        ];

        foreach ($labor as $worker) {
            Inventory::create(array_merge($worker, [
                'status' => InventoryStatus::ACTIVE->value
            ]));
        }
    }

    private function createAdditionalInventories(): void
    {
        $inventory = [
            [
                'name_inventory' => 'Senior Developer',
                'code_inventory' => 'DEV-001',
                'description_inventory' => 'Senior level software developer',
                'type' => InventoryType::OTHER->value,
                'unit_cost' => 100000,
                'status' => InventoryStatus::ACTIVE->value,
            ],
            [
                'name_inventory' => 'Project Manager',
                'code_inventory' => 'PM-001',
                'description_inventory' => 'Project management professional',
                'type' => InventoryType::OTHER->value,
                'unit_cost' => 120000,
                'status' => InventoryStatus::ACTIVE->value,
            ],
            [
                'name_inventory' => 'Server Hardware',
                'code_inventory' => 'HW-001',
                'description_inventory' => 'High performance server',
                'type' => InventoryType::EQUIPMENT->value,
                'unit_cost' => 5000000,
                'status' => InventoryStatus::ACTIVE->value,
            ],
            [
                'name_inventory' => 'Development Software License',
                'code_inventory' => 'SW-001',
                'description_inventory' => 'Annual software development license',
                'type' => InventoryType::OTHER->value,
                'unit_cost' => 200000,
                'status' => InventoryStatus::ACTIVE->value,
            ],
        ];

        foreach ($inventory as $item) {
            Inventory::create($item);
        }
    }
}

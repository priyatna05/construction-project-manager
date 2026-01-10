<?php

namespace Database\Seeders;

use App\Models\Label;
use Illuminate\Database\Seeder;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $labels = [
            // project and task status
            ['name' => 'Blocked',           'slug' => 'blocked',           'type' => 'pt_status', 'color' => '#F03E3E', 'icon' => 'IconBug'],
            ['name' => 'Bug',               'slug' => 'bug',               'type' => 'pt_status', 'color' => '#D6336C', 'icon' => 'IconLockX'],
            ['name' => 'Rework',            'slug' => 'rework',            'type' => 'pt_status', 'color' => '#F76707', 'icon' => 'IconBarrierBlock'],
            ['name' => 'On Hold',           'slug' => 'on_hold',           'type' => 'pt_status', 'color' => '#FFA94D', 'icon' => 'IconClockPause'],
            ['name' => 'In Progress',       'slug' => 'in_progress',       'type' => 'pt_status', 'color' => '#228BE6', 'icon' => 'IconRotateClockwise2'],
            ['name' => 'Inspection',        'slug' => 'inspection',        'type' => 'pt_status', 'color' => '#15AABF', 'icon' => 'IconEyeCode'],
            ['name' => 'Completed',         'slug' => 'completed',         'type' => 'pt_status', 'color' => '#12B886', 'icon' => 'IconCircleDashedCheck'],
            ['name' => 'To Do',             'slug' => 'to_do',             'type' => 'pt_status', 'color' => '#fab005', 'icon'  => 'IconListCheck'],
            ['name' => 'Done',              'slug' => 'done',              'type' => 'pt_status',    'color' => '#12B886',    'icon'  => 'IconCircleCheck'],

            // Project and Tasks Status billing on client
            ['name' => 'Confirmed',         'slug' => 'confirmed',         'type' => 'ptb_status', 'color' => '#37B24D', 'icon' => 'IconChecks'],
            ['name' => 'Estimate',          'slug' => 'estimate',          'type' => 'ptb_status', 'color' => '#AE3EC9', 'icon' => 'IconLockDollar'],
            ['name' => 'Pending Approval',  'slug' => 'pending_approval',  'type' => 'ptb_status', 'color' => '#FAB005', 'icon' => 'IconCheck'],

            // Task Relations
            ['name' => 'Blocking',          'slug' => 'blocking',          'type' => 'task_relation', 'color' => '#E03131', 'icon' => 'IconX'],
            ['name' => 'Sequential',        'slug' => 'sequential',        'type' => 'task_relation', 'color' => '#4C6EF5', 'icon' => 'IconArrowDownRight'],
            ['name' => 'Related',           'slug' => 'related',           'type' => 'task_relation', 'color' => '#868E96', 'icon' => 'IconLink'],
            ['name' => 'Finish to Start',   'slug' => 'fs',                'type' => 'task_relation', 'color' => '#0CA678', 'icon' => 'IconArrowRightRhombus'],
            ['name' => 'Start to Finish',   'slug' => 'sf',                'type' => 'task_relation', 'color' => '#F59F00', 'icon' => 'IconCornerUpLeft'],
            ['name' => 'Start to Start',    'slug' => 'ss',                'type' => 'task_relation', 'color' => '#339AF0', 'icon' => 'IconArrowDown'],
            ['name' => 'Finish to Finish',  'slug' => 'ff',                'type' => 'task_relation', 'color' => '#40C057', 'icon' => 'IconArrowUp'],

            // priority task
            ['name' => 'Low',      'slug' => 'low',      'type' => 'task_priority_label', 'color' => '#A3BE8C', 'icon' => 'IconArrowDown'],
            ['name' => 'Medium',   'slug' => 'medium',   'type' => 'task_priority_label', 'color' => '#EBCB8B', 'icon' => 'IconArrowsRightLeft'],
            ['name' => 'High',     'slug' => 'high',     'type' => 'task_priority_label', 'color' => '#D08770', 'icon' => 'IconArrowUp'],
            ['name' => 'Critical', 'slug' => 'critical', 'type' => 'task_priority_label', 'color' => '#BF616A', 'icon' => 'IconAlertCircle'],

            // unit tasks and inventory
            // 📏 PANJANG
            ['name' => 'Millimeter', 'slug' => 'millimeter', 'type' => 'task_inventory_unit_label', 'color' => '#A3BE8C', 'icon' => 'IconRulerMeasure'],
            ['name' => 'Centimeter', 'slug' => 'centimeter', 'type' => 'task_inventory_unit_label', 'color' => '#A3BE8C', 'icon' => 'IconRulerMeasure'],
            ['name' => 'Meter',      'slug' => 'meter',      'type' => 'task_inventory_unit_label', 'color' => '#A3BE8C', 'icon' => 'IconRulerMeasure'],
            ['name' => 'Kilometer',  'slug' => 'kilometer',  'type' => 'task_inventory_unit_label', 'color' => '#A3BE8C', 'icon' => 'IconRulerMeasure'],

            // 📐 LUAS
            ['name' => 'Square Meter', 'slug' => 'square_meter', 'type' => 'task_inventory_unit_label', 'color' => '#88C0D0', 'icon' => 'IconRulerSquare'],
            ['name' => 'Are',          'slug' => 'are',          'type' => 'task_inventory_unit_label', 'color' => '#88C0D0', 'icon' => 'IconRulerSquare'],
            ['name' => 'Hectare',      'slug' => 'hectare',      'type' => 'task_inventory_unit_label', 'color' => '#88C0D0', 'icon' => 'IconRulerSquare'],

            // 🧱 VOLUME
            ['name' => 'Cubic Meter',  'slug' => 'cubic_meter',  'type' => 'task_inventory_unit_label', 'color' => '#81A1C1', 'icon' => 'IconCube'],
            ['name' => 'Liter',        'slug' => 'liter',        'type' => 'task_inventory_unit_label', 'color' => '#81A1C1', 'icon' => 'IconDroplet'],
            ['name' => 'Milliliter',   'slug' => 'milliliter',   'type' => 'task_inventory_unit_label', 'color' => '#81A1C1', 'icon' => 'IconDroplet'],

            // ⏱️ WAKTU
            ['name' => 'Hour',         'slug' => 'hour',         'type' => 'task_inventory_unit_label', 'color' => '#E5E9F0', 'icon' => 'IconClock'],
            ['name' => 'Day',          'slug' => 'day',          'type' => 'task_inventory_unit_label', 'color' => '#E5E9F0', 'icon' => 'IconCalendar'],
            ['name' => 'Week',         'slug' => 'week',         'type' => 'task_inventory_unit_label', 'color' => '#E5E9F0', 'icon' => 'IconCalendarStats'],
            ['name' => 'Month',        'slug' => 'month',        'type' => 'task_inventory_unit_label', 'color' => '#E5E9F0', 'icon' => 'IconCalendarMonth'],

            // ⚙️ BERAT
            ['name' => 'Gram',         'slug' => 'gram',         'type' => 'task_inventory_unit_label', 'color' => '#EBCB8B', 'icon' => 'IconWeight'],
            ['name' => 'Kilogram',     'slug' => 'kilogram',     'type' => 'task_inventory_unit_label', 'color' => '#EBCB8B', 'icon' => 'IconWeight'],
            ['name' => 'Ton',          'slug' => 'ton',          'type' => 'task_inventory_unit_label', 'color' => '#EBCB8B', 'icon' => 'IconWeight'],

            // 🔩 JUMLAH
            ['name' => 'Piece',        'slug' => 'piece',        'type' => 'task_inventory_unit_label', 'color' => '#B48EAD', 'icon' => 'IconPackage'],
            ['name' => 'Unit',         'slug' => 'unit',         'type' => 'task_inventory_unit_label', 'color' => '#B48EAD', 'icon' => 'IconPackage'],
            ['name' => 'Set',          'slug' => 'set',          'type' => 'task_inventory_unit_label', 'color' => '#B48EAD', 'icon' => 'IconPackage'],
            ['name' => 'Lot',          'slug' => 'lot',          'type' => 'task_inventory_unit_label', 'color' => '#B48EAD', 'icon' => 'IconPackage'],

            // 🔌 ENERGI & DAYA
            ['name' => 'Watt',         'slug' => 'watt',         'type' => 'task_inventory_unit_label', 'color' => '#BF616A', 'icon' => 'IconBolt'],
            ['name' => 'Kilowatt',     'slug' => 'kilowatt',     'type' => 'task_inventory_unit_label', 'color' => '#BF616A', 'icon' => 'IconBolt'],
            ['name' => 'Ampere',       'slug' => 'ampere',       'type' => 'task_inventory_unit_label', 'color' => '#BF616A', 'icon' => 'IconCurrent'],
            ['name' => 'Volt',         'slug' => 'volt',         'type' => 'task_inventory_unit_label', 'color' => '#BF616A', 'icon' => 'IconPlug'],
            ['name' => 'Lumen',        'slug' => 'lumen',        'type' => 'task_inventory_unit_label', 'color' => '#BF616A', 'icon' => 'IconBulb'],

            // 🚚 MATERIAL & TRANSPORTASI
            ['name' => 'Truck',        'slug' => 'truck',        'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconTruck'],
            ['name' => 'Trip',         'slug' => 'trip',         'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconTruckDelivery'],
            ['name' => 'Bag',          'slug' => 'bag',          'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconShoppingBag'],
            ['name' => 'Drum',         'slug' => 'drum',         'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconBucket'],
            ['name' => 'Roll',         'slug' => 'roll',         'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconRoller'],
            ['name' => 'Sheet',        'slug' => 'sheet',        'type' => 'task_inventory_unit_label', 'color' => '#D08770', 'icon' => 'IconLayersLinked'],

            // jenis kontrak / sistem pembayaran
            ['name' => 'Fixed Price',        'slug' => 'fixed_price',        'type' => 'kontrak_label', 'color' => '#E07A5F', 'icon' => 'IconCurrencyDollar'],
            ['name' => 'Unit Price',        'slug' => 'unit_price',        'type' => 'kontrak_label', 'color' => '#F2CC8F', 'icon' => 'IconRulerMeasure'],
            ['name' => 'Lump Sum',     'slug' => 'lump_sum',     'type' => 'kontrak_label', 'color' => '#EBCB8B', 'icon' => 'IconReceipt2'],
            ['name' => 'Mix System',   'slug' => 'mix_system',   'type' => 'kontrak_label', 'color' => '#EBCB8B', 'icon' => 'IconScale'],
            ['name' => 'Cost Plus Contract',        'slug' => 'cost_plus_contract',        'type' => 'kontrak_label', 'color' => '#81B29A', 'icon' => 'IconCalculator'],
            ['name' => 'Design and Build',        'slug' => 'design_and_build',        'type' => 'kontrak_label', 'color' => '#3D405B', 'icon' => 'IconBuildingSkyscraper'],
            ['name' => 'Turnkey Project',        'slug' => 'trunkey_project',        'type' => 'kontrak_label', 'color' => '#264653', 'icon' => 'IconKey'],

            // jenis pekerjaan
            ['name' => 'Swakelola',        'slug' => 'swakelola',        'type' => 'task_type_label', 'color' => '#2A9D8F', 'icon' => 'IconUserCog'],
            ['name' => 'Subkontrak',        'slug' => 'subkontrak',        'type' => 'task_type_label', 'color' => '#E9C46A', 'icon' => 'IconUserGroup'],
            ['name'  => 'Joint Operation (KSO)', 'slug'  => 'joint_operation', 'type'  => 'task_type_label',    'color' => '#F4A261', 'icon'  => 'IconHandshake',],
            ['name'  => 'Management Contracting', 'slug'  => 'management_contracting', 'type'  => 'task_type_label',    'color' => '#E76F51', 'icon'  => 'IconBriefcase',],

            //work report status
            ['name' => 'Pending',      'slug' => 'pending_work_report',      'type' => 'work_report_status', 'color' => '#FAB005', 'icon' => 'IconClock'],
            ['name' => 'Approved',     'slug' => 'approved_work_report',     'type' => 'work_report_status', 'color' => '#37B24D', 'icon' => 'IconCheck'],
            ['name' => 'Rejected',     'slug' => 'rejected_work_report',     'type' => 'work_report_status', 'color' => '#F03E3E', 'icon' => 'IconX'],

            // Inventory Status
            ['name' => 'Active',       'slug' => 'active',       'type' => 'inventory_status_label', 'color' => '#228BE6', 'icon' => 'IconMobiledata'],
            ['name' => 'Inactive',     'slug' => 'inactive',     'type' => 'inventory_status_label', 'color' => '#ADB5BD', 'icon' => 'IconMobiledataOff'],
            ['name' => 'Out Stock',      'slug' => 'out_stock',      'type' => 'inventory_status_label', 'color' => '#F03E3E', 'icon' => 'IconZoomQuestion'],
            ['name' => 'Available',      'slug' => 'available',      'type' => 'inventory_status_label', 'color' => '#F03E3E', 'icon' => 'IconListCheck'],
            ['name' => 'Archived',      'slug' => 'archived',      'type' => 'inventory_status_label', 'color' => '#F03E3E', 'icon' => 'IconArchive'],

            // Inventory type
            ['name' => 'Labor',        'slug' => 'labor',        'type' => 'inventory_type_label', 'color' => '#FFD43B', 'icon' => 'IconUser'],
            ['name' => 'Material',     'slug' => 'material',     'type' => 'inventory_type_label', 'color' => '#74C0FC', 'icon' => 'IconPackage'],
            ['name' => 'Equipment',    'slug' => 'equipment',    'type' => 'inventory_type_label', 'color' => '#A9E34B', 'icon' => 'IconTool'],
            ['name' => 'Service',      'slug' => 'service',      'type' => 'inventory_type_label', 'color' => '#D0BFFF', 'icon' => 'IconSettingsHeart'],
            ['name' => 'Other',        'slug' => 'other',        'type' => 'inventory_type_label', 'color' => '#DEE2E6', 'icon' => 'IconDots'],

        ];

        foreach ($labels as $labelData) {
            // Kita akan menggunakan 'slug' dan 'type' sebagai kombinasi unik untuk menghindari duplikasi.
            // Jika label dengan slug dan type yang sama sudah ada, tidak akan dibuat baru.
            // Jika Anda ingin juga memperbarui data lain (seperti color atau icon) jika ada perubahan,
            // Anda bisa menggunakan `updateOrCreate`. Namun, untuk seeder, `firstOrCreate` biasanya cukup.
            Label::firstOrCreate(
                ['slug' => $labelData['slug'], 'type' => $labelData['type']], // Kriteria untuk mencari
                $labelData                                                    // Data yang akan dibuat jika tidak ditemukan
            );
        }
    }
}

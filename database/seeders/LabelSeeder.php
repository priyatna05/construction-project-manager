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
        Label::insert([
            // project and task status
            ['name' => 'Blocked',           'slug' => 'blocked',           'type' => 'pt_status', 'color' => '#F03E3E', 'icon' => 'IconBug'],
            ['name' => 'Bug',               'slug' => 'bug',               'type' => 'pt_status', 'color' => '#D6336C', 'icon' => 'IconLockX'],
            ['name' => 'Rework',            'slug' => 'rework',            'type' => 'pt_status', 'color' => '#F76707', 'icon' => 'IconBarrierBlock'],
            ['name' => 'On Hold',           'slug' => 'on_hold',           'type' => 'pt_status', 'color' => '#FFA94D', 'icon' => 'IconClockPause'],
            ['name' => 'In Progress',       'slug' => 'in_progress',       'type' => 'pt_status', 'color' => '#228BE6', 'icon' => 'IconRotateClockwise2'],
            ['name' => 'Inspection',        'slug' => 'inspection',        'type' => 'pt_status', 'color' => '#15AABF', 'icon' => 'IconEyeCode'],
            ['name' => 'Completed',         'slug' => 'completed',         'type' => 'pt_status', 'color' => '#12B886', 'icon' => 'IconCircleDashedCheck'],
            ['name' => 'Backlog',           'slug' => 'backlog',           'type' => 'pt_status', 'color' => '#adb5bd', 'icon'  => 'IconArchive'],
            ['name' => 'Ready',             'slug' => 'ready',             'type' => 'pt_status',    'color' => '#748ffc', 'icon'  => 'IconPlayerPlay'],
            ['name' => 'Code Review', 'slug' => 'code_review',    'type' => 'pt_status',    'color' => '#339af0', 'icon'  => 'IconCode'],
            ['name' => 'Testing', 'slug' => 'testing', 'type' => 'pt_status',    'color' => '#20c997', 'icon'  => 'IconTestPipe'],
            ['name' => 'To Do', 'slug' => 'to_do', 'type' => 'pt_status', 'color' => '#fab005', 'icon'  => 'IconListCheck'],
            ['name' => 'Done',    'slug' => 'done', 'type' => 'pt_status',    'color' => '#12B886',    'icon'  => 'IconCircleCheck'],

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

            //timesheet status
            ['name' => 'Pending',  'slug' => 'pending',      'type' => 'timesheet_status', 'color' => '#40C057', 'icon' => ''],
            ['name' => 'Approved',  'slug' => 'approved',      'type' => 'timesheet_status', 'color' => '#40C057', 'icon' => ''],
            ['name' => 'Rejected',  'slug' => 'rejected',      'type' => 'timesheet_status', 'color' => '#40C057', 'icon' => ''],
            ['name' => 'Billed',  'slug' => 'billed',      'type' => 'timesheet_status', 'color' => '#40C057', 'icon' => ''],

            // Inventory Status
            ['name' => 'Active',   'slug' => 'active',   'type' => 'inventory_status_label', 'color' => '#228BE6', 'icon' => 'IconMobiledata'],
            ['name' => 'Inactive', 'slug' => 'inactive', 'type' => 'inventory_status_label', 'color' => '#ADB5BD', 'icon' => 'IconMobiledataOff'],
            ['name' => 'Deleted',  'slug' => 'deleted',  'type' => 'inventory_status_label', 'color' => '#F03E3E', 'icon' => 'IconTrash'],

            // Inventory type
            ['name' => 'Labor',     'slug' => 'labor',     'type' => 'inventory_type_label', 'color' => '#FFD43B', 'icon' => 'IconUser'],
            ['name' => 'Material',  'slug' => 'material',  'type' => 'inventory_type_label', 'color' => '#74C0FC', 'icon' => 'IconPackage'],
            ['name' => 'Equipment', 'slug' => 'equipment', 'type' => 'inventory_type_label', 'color' => '#A9E34B', 'icon' => 'IconTool'],
            ['name' => 'Service',   'slug' => 'service',   'type' => 'inventory_type_label', 'color' => '#D0BFFF', 'icon' => 'IconSettingsHeart'],
            ['name' => 'Other',     'slug' => 'other',     'type' => 'inventory_type_label', 'color' => '#DEE2E6', 'icon' => 'IconDots'],

            // Inventory Unit
            ['name'  => 'Unit',     'slug' => 'unit',        'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconPackage'],
            ['name'  => 'Meter',    'slug' => 'meter',       'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconRulerMeasure'],
            ['name'  => 'Liter',    'slug' => 'liter',       'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconRulerMeasure'],
            ['name'  => 'Kg',       'slug' => 'kg',          'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconPackage'],
            ['name'  => 'Ton',      'slug' => 'ton',         'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconPackage'],
            ['name'  => 'Piece',    'slug' => 'piece',       'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconPackage'],
            ['name'  => 'Sak',      'slug' => 'sak',         'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconPackage'],
            ['name'  => 'M2',       'slug' => 'm2',          'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconRulerMeasure'],
            ['name'  => 'M3',       'slug' => 'm3',          'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconRulerMeasure'],
            ['name'  => 'Hour',     'slug' => 'hour',        'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconClockHour4'],
            ['name'  => 'Day',      'slug' => 'day',         'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconCalendar'],
            ['name'  => 'Month',    'slug' => 'month',       'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconCalendar'],
            ['name'  =>  'Year',    'slug' => 'year',        'type'  => 'inventory_unit_label',    'color' => '#ED4DA',    'icon'  => 'IconCalendar'],

            // Invoice Status
            ['name' => 'Sent',          'slug' => 'sent',          'type' => 'invoice_status_label', 'color' => '#74C0FC', 'icon' => 'IconSend'],
            ['name' => 'New',           'slug' => 'new',           'type' => 'invoice_status_label', 'color' => '#228BE6', 'icon' => 'IconFilePlus'],
            ['name' => 'Paid',          'slug' => 'paid',          'type' => 'invoice_status_label', 'color' => '#37B24D', 'icon' => 'IconCircleCheck'],
            ['name' => 'Draft',         'slug' => 'draft',         'type' => 'invoice_status_label', 'color' => '#CED4DA', 'icon' => 'IconEdit'],
            ['name' => 'Overdue',       'slug' => 'overdue',       'type' => 'invoice_status_label', 'color' => '#F03E3E', 'icon' => 'IconClock'],
            ['name' => 'Void',          'slug' => 'void',          'type' => 'invoice_status_label', 'color' => '#ADB5BD', 'icon' => 'IconCircleX'],

            // invoice type
            ['name' => 'Standard',      'slug' => 'standard',      'type' => 'invoice_type',   'color' => '#4C6EF5', 'icon' => 'IconFileText'],
            ['name' => 'Performa',      'slug' => 'performa',      'type' => 'invoice_type',   'color' => '#7950F2', 'icon' => 'IconFileSymlink'],
            ['name' => 'Credit Note',   'slug' => 'credit_note',   'type' => 'invoice_type',   'color' => '#20C997', 'icon' => 'IconFileMinus'],
            ['name' => 'Fixed Amount',  'slug' => 'fixed_amount',  'type' => 'invoice_type',   'color' => '#FAB005', 'icon' => 'IconFileDollar'],
        ]);
    }
}

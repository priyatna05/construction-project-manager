<?php

namespace App\Enums;

enum InventoryType: string
{
    case MATERIAL = 'material';
    case LABOR = 'labor';
    case EQUIPMENT = 'equipment';
    case OTHER = 'other';
}

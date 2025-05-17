<?php

namespace App\Enums;

enum InventoryUnit: string
{
    case METER = 'meter';
    case LITER = 'liter';
    case KG = 'kg';
    case TON = 'ton';
    case PIECE = 'piece';
    case HOUR = 'hour';
    case DAY = 'day';
    case MONTH = 'month';
    case YEAR = 'year';
    case UNIT = 'unit';
}

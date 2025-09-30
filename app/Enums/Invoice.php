<?php

namespace App\Enums;

enum Invoice: string
{
    case STATUS_NEW = 'new';
    case STATUS_SENT = 'sent';
    case STATUS_PAID = 'paid';
    case STATUS_DRAFT = 'draft';
    case STATUS_OVERDUE = 'overdue';
    case STATUS_VOID = 'void';
    case TYPE_STANDARD = 'standard';
    case TYPE_PERFORMA = 'performa';
    case TYPE_CREDIT_NOTE = 'credit_note';
    case TYPE_FIXED_AMOUNT = 'fixed_amount';
}

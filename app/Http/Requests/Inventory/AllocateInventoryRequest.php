<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AllocateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
       return true;
    }

    public function rules(): array
    {
        return [
            'task_id'             => ['required', 'exists:tasks,id'],
            'quantity_allocation' => ['required', 'numeric', 'min:0.01'],
            'allocated_date'      => ['nullable', 'date'],
        ];
    }
}

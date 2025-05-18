<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\InventoryType;
use App\Enums\InventoryStatus;
use App\Enums\InventoryUnit;

class StoreInventoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code_inventory'      => ['nullable','unique:inventories,code_inventory'],
            'name_inventory'      => ['required','string','max:255'],
            'description_inventory'=> ['nullable','string'],
            'status'              => ['required', 'in:' . implode(',', array_map(fn($case) => $case->value, InventoryStatus::cases()))],
            'type'                => ['required', 'in:' . implode(',', array_map(fn($case) => $case->value, InventoryType::cases()))],
            'unit'                => ['nullable','in:' . implode(',', array_map(fn($case) => $case->value, InventoryUnit::cases()))],
            'unit_cost'           => ['required','numeric','min:0'],
            'quantity_inventory'  => ['nullable','numeric','min:0'],
            'location_inventory'  => ['nullable','exists:projects,id'],
        ];
    }
}

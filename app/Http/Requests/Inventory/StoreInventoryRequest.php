<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
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
            'name_inventory' => ['required', 'string', Rule::unique('inventories', 'name_inventory')],
            'code_inventory' => ['required', 'string', Rule::unique('inventories', 'code_inventory')],
            'type' => ['required', new Enum(InventoryType::class)],
            'description_inventory' => 'string|nullable',
            'unit' => ['required', new Enum(InventoryUnit::class)],
            'unit_cost' => 'required|numeric|min:0',
            'sum_cost' => 'numeric|min:0|nullable',
            'status' => ['required', new Enum(InventoryStatus::class)],
        ];
    }
}

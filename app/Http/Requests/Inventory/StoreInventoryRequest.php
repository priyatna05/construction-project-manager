<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Label;

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
            'code'               => ['nullable', 'unique:inventories,code'],
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'status'             => ['required', 'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_STATUS)],
            'type'               => ['required', 'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_TYPE)],
            'unit'               => ['nullable', 'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_UNIT)],
            'unit_cost'          => ['required', 'numeric', 'min:0'],
            'quantity_inventory' => ['nullable', 'numeric', 'min:0'],
            'location_inventory' => ['nullable', 'exists:projects,id'],
        ];
    }
}

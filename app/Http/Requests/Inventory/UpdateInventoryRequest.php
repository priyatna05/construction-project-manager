<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Label;

class UpdateInventoryRequest extends FormRequest
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
            'name' => [
                'sometimes',
                'required',
                'string',
                // Rule::unique('inventories', 'name')->ignore($this->resource)
            ],
            'code' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('inventories', 'code')->ignore($this->resource)
            ],
            'type' => [
                'sometimes',
                'required',
                'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_TYPE)
            ],
            'unit' => [
                'sometimes',
                'required',
                'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_UNIT)
            ],
            'status' => [
                'sometimes',
                'required',
                'in:' . Label::slugsForTypeString(Label::TYPE_INVENTORY_STATUS)
            ],
            'description' => 'nullable|string',
            'quantity_on_hand' => 'nullable|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'sum_cost' => 'nullable|numeric|min:0',
        ];
    }
}

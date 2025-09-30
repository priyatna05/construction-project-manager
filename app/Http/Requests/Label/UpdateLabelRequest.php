<?php

namespace App\Http\Requests\Label;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLabelRequest extends FormRequest
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
        $labelId = $this->route('label');

        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:labels,slug,' . $labelId,
            'type' => 'required|string|max:255',
            'color' => 'required|string|hex_color',
            'icon' => 'nullable|string|max:255',
        ];
    }
}

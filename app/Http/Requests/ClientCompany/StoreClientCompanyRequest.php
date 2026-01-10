<?php

namespace App\Http\Requests\ClientCompany;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientCompanyRequest extends FormRequest
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
            'logo' => 'file|image|mimes:jpeg,png,jpg,gif,svg|max:2048|nullable',
            'name' => 'required|string',
            'address' => 'string|nullable',
            'postal_code' => 'string|nullable',
            'city' => 'string|nullable',
            'country_id' => 'integer|nullable',
            'currency_id' => 'integer|nullable',
            'email' => ['nullable', 'email:rfc,dns', Rule::unique('client_companies')],
            'phone' => 'string|nullable',
            'web' => 'string|nullable',
            'clients' => 'array|nullable',
        ];
    }
}

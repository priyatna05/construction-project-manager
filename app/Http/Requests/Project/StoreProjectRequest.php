<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Label;

class StoreProjectRequest extends FormRequest
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
            'code'          => 'string|nullable',
            'name'          => 'string', Rule::unique('projects', 'name'),
            'description'   => 'string|nullable',
            'client_company_id' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    // Jika ada nilai, validasi
                    if ($value) {
                        // 1️⃣ Jika input diawali 'user_', berarti klien individu
                        if (is_string($value) && str_starts_with($value, 'user_')) {
                            $userId = (int) str_replace('user_', '', $value);
                            if ($userId <= 0 || !\App\Models\User::where('id', $userId)->exists()) {
                                $fail('The selected client user is invalid.');
                            }
                            return;
                        }

                        // 2️⃣ Jika angka, berarti perusahaan
                        if (is_numeric($value)) {
                            if (!\App\Models\ClientCompany::where('id', $value)->exists()) {
                                $fail('The selected client company is invalid.');
                            }
                            return;
                        }

                        // 3️⃣ Selain itu, tidak valid
                        $fail('The selected client value is invalid.');
                    }
                },
            ],
            'client_user_id' => [
                'nullable',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    // Jika client_company_id ada, client_user_id harus null
                    if ($this->input('client_company_id') && $value) {
                        $fail('Cannot select both company and individual user.');
                    }
                    // Jika client_company_id null, client_user_id harus ada
                    if (!$this->input('client_company_id') && !$value) {
                        $fail('Either client company or client user must be selected.');
                    }
                },
            ],
            'start_date'    => 'date',
            'end_date'      => 'date|after_or_equal:start_date',
            'budget_project_estimate'        => 'numeric|min:0|nullable',
            'users' => 'array',
            'users.*' => 'exists:users,id',
            'attachment_files'       => 'nullable|array',
            'attachment_files.*'     => 'file|max:10240',
            'generate_task_groups' => 'string|nullable',
            'type_id' => ['nullable', Rule::exists('labels', 'slug')->where('type', Label::TYPE_KONTRAK)],
            'status_ids' => ['array'],
            'status_ids.*' => ['exists:labels,slug'],
        ];
    }
}

<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'name'          => ['required', 'string', Rule::unique('projects', 'name')],
            'description'   => 'string|nullable',
            'client_company_id'     => 'required|integer|exists:client_companies,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'budget_project'        => 'numeric|min:0|nullable',
            'users' => 'required|array',
            'users.*' => 'exists:users,id',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
            'generate_task_groups' => 'string|nullable',
        ];
    }
}

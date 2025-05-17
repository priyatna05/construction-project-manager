<?php

namespace App\Http\Requests\TaskGroup;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskGroupRequest extends FormRequest
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
            'name_group' => [
                'required',
                'string',
                Rule::unique('task_groups', 'name_group')
                    ->where('project_id', $this->route('project')->id)
                    ->ignore($this->route('taskGroup')->id),
            ],
            'description_group' => 'string|nullable',
            'start_date_group' => 'date',
            'end_date_group' => 'date',
            'budget_group' => 'numeric|min:0',
        ];
    }
}

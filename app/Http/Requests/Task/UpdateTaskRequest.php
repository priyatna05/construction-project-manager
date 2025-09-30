<?php

namespace App\Http\Requests\Task;

use App\Models\Label;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'number' => ['nullable', 'integer'],
            'group_id' => ['sometimes', 'exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'sometimes', 'exists:users,id'],
            'description' => ['nullable', 'sometimes', 'string'],
            'start_date' => ['nullable', 'sometimes', 'date'],
            'end_date' => ['nullable', 'sometimes', 'date', 'after_or_equal:start_date'],
            'budget_task' => ['nullable', 'sometimes', 'numeric'],
            'attachments.*' => ['file', 'max:10240'],
            'subscribed_users' => 'sometimes|array',
            'subscribed_users.*' => 'integer|exists:users,id',
            'labels' => ['nullable', 'array'],
            'labels.*' => ['integer', 'exists:labels,id'],
            'dependencies' => ['nullable', 'array'],
            'dependencies.*.id' => [
                'required_with:dependencies',
                'integer',
                'exists:tasks,id'
            ],
            'dependencies.*.relation_type_id' => [
                'bail',
                'required_with:dependencies',
                'integer',
                Rule::exists('labels', 'id')->where('type', Label::TYPE_TASK_RELATION),
            ],
        ];
    }
}

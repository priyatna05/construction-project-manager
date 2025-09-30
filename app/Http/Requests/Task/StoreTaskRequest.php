<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Label;

class StoreTaskRequest extends FormRequest
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
            'name' => ['required', 'string:255'],
            'number' => ['required', 'integer'],
            'group_id' => ['required', 'exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'budget_task' => ['nullable', 'numeric', 'min:0'],
            'depends_on_task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'relation_type_id'   => [
                'nullable',
                'integer',
                Rule::exists('labels', 'id')->where('type', Label::TYPE_TASK_RELATION),
            ],
            'subscribed_users' => ['array'],
            'labels' => ['array'],
            'attachments' => ['array'],
        ];
    }
}

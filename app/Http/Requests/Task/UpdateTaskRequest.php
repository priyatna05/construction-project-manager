<?php

namespace App\Http\Requests\Task;

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
            'name_task' => ['string:255'],
            'number' => ['integer'],
            'group_id' => ['exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
            'description_task' => ['nullable'],
            'start_date_task' => ['nullable'],
            'end_date_task' => ['nullable'],
            'budget_task' => ['nullable', 'numeric'],
            'attachments' => ['array'],
            'subscribed_users' => ['array'],
            'labels' => ['array'],
        ];
    }
}

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
            'budget_task_plan' => ['nullable', 'sometimes', 'numeric'],
            'budget_task_actual' => ['nullable', 'sometimes', 'numeric'],
            'volume' => ['nullable', 'sometimes', 'numeric'],
            'unit_cost_task' => ['nullable', 'sometimes', 'numeric', 'min:0'],
            'unit' => [
                'nullable',
                'sometimes',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_TASK_INVENTORY_UNIT),
            ],
            'type' => [
                'nullable',
                'sometimes',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_TASK),
            ],
            'priority' => [
                'nullable',
                'sometimes',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_PRIORITY),
            ],
            'attachment_files'       => 'nullable|array', // Mengubah 'attachments' menjadi 'attachment_files'
            'attachment_files.*'     => 'file|max:10240', // Validasi untuk setiap file, max 10MB

            // 'existing_attachments' tidak perlu divalidasi di request karena
            // Anda hanya mengirimnya untuk membantu frontend dalam logika.
            // Backend hanya perlu ID attachment yang dihapus dan file baru.
            // Jika Anda mengirim array ID 'existing_attachments' untuk validasi di backend,
            // itu akan jadi field yang tidak terpakai di controller.

            'deleted_attachments_ids'   => 'nullable|array', // Mengubah 'deleted_attachments' menjadi 'deleted_attachments_ids'
            'deleted_attachments_ids.*' => 'integer|exists:attachments,id',
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
            'relation' => [
                'nullable',
                'integer',
                Rule::exists('labels', 'id')->where('type', Label::TYPE_TASK_RELATION),
            ],
            'inventories' => ['nullable', 'array'],
            'inventories.*.inventory_id' => ['required_with:inventories', 'integer', 'exists:inventories,id'],
            'inventories.*.quantity' => ['required_with:inventories', 'numeric', 'min:0'],
            'inventories.*.note' => ['nullable', 'string', 'max:255'],
        ];
    }
}

<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Label;
use Illuminate\Support\Facades\Log;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Log::info('🔐 [TASK REQUEST] Authorization check');
        return true;
    }

    protected function prepareForValidation()
    {
        // Log::info('🔧 [TASK REQUEST] Preparing for validation', [
        //     'all_keys' => array_keys($this->all()),
        //     'inventories_exists' => $this->has('inventories'),
        //     'inventories_count' => is_array($this->inventories) ? count($this->inventories) : 0,
        //     'raw_start_date' => $this->start_date,
        //     'raw_end_date' => $this->end_date
        // ]);

        // Transform inventories to ensure inventory_id is present
        if ($this->has('inventories') && is_array($this->inventories)) {
            $inventories = $this->inventories;
            foreach ($inventories as &$inv) {
                if (isset($inv['id']) && !isset($inv['inventory_id'])) {
                    $inv['inventory_id'] = $inv['id'];
                    unset($inv['id']);
                }
            }
            $this->merge(['inventories' => $inventories]);
        }

        // FIX: Ensure dates are properly parsed and formatted for database storage
        // Laravel's date validation expects Y-m-d format, but we need to handle timezone issues
        if ($this->has('start_date') && !empty($this->start_date)) {
            // Clean date strings to remove extra timezone info that causes parsing errors
            $cleanStartDate = preg_replace('/\s*\([^)]*\)$/', '', $this->start_date);
            $startDate = \Carbon\Carbon::parse($cleanStartDate)->setTimezone('Asia/Jakarta')->format('Y-m-d');
            // Log::info('📅 [DATE FIX] Start date transformed', [
            //     'original' => $this->start_date,
            //     'transformed' => $startDate
            // ]);
            $this->merge(['start_date' => $startDate]);
        }

        if ($this->has('end_date') && !empty($this->end_date)) {
            // Clean date strings to remove extra timezone info that causes parsing errors
            $cleanEndDate = preg_replace('/\s*\([^)]*\)$/', '', $this->end_date);
            $endDate = \Carbon\Carbon::parse($cleanEndDate)->setTimezone('Asia/Jakarta')->format('Y-m-d');
            // Log::info('📅 [DATE FIX] End date transformed', [
            //     'original' => $this->end_date,
            //     'transformed' => $endDate
            // ]);
            $this->merge(['end_date' => $endDate]);
        }

        // FIX: Parse numeric fields from Indonesian number format (e.g., '10.462.000' -> 10462000)
        $numericFields = ['budget_task_plan', 'budget_task_actual', 'weight_task', 'volume', 'unit_cost_task'];
        foreach ($numericFields as $field) {
            if ($this->has($field) && is_string($this->$field)) {
                $value = $this->$field;
                $value = str_replace('.', '', $value); // Remove thousand separators
                $value = str_replace(',', '.', $value); // Replace decimal separator
                $parsedValue = (float) $value;
                // Log::info("🔢 [NUMERIC FIX] {$field} transformed", [
                //     'original' => $this->$field,
                //     'parsed' => $parsedValue
                // ]);
                $this->merge([$field => $parsedValue]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'group_id' => ['required', 'exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'budget_task_plan' => ['nullable', 'numeric', 'min:0'],
            'budget_task_actual' => ['nullable', 'numeric', 'min:0'],
            'weight_task' => ['nullable', 'numeric', 'min:0'],
            'volume' => ['nullable', 'numeric', 'min:0'],
            'unit_cost_task' => ['nullable', 'numeric', 'min:0'],
            'unit' => [
                'nullable',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_TASK_INVENTORY_UNIT),
            ],
            'type' => [
                'nullable',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_TASK),
            ],
            'priority' => [
                'nullable',
                'string',
                Rule::exists('labels', 'slug')->where('type', Label::TYPE_PRIORITY),
            ],
            'depends_on_task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'relation_type_id' => [
                'nullable',
                'integer',
                'required_with:depends_on_task_id',
                Rule::exists('labels', 'id')->where('type', Label::TYPE_TASK_RELATION),
            ],
            'subscribed_users' => ['nullable', 'array'],
            'subscribed_users.*' => ['integer', 'exists:users,id'],
            'labels' => ['nullable', 'array'],
            'labels.*' => ['integer', 'exists:labels,id'],
            'attachment_files' => ['nullable', 'array'],
            'attachment_files.*' => ['file', 'max:10240'], // 10MB
            'inventories' => ['nullable', 'array'],
            'inventories.*.inventory_id' => ['required_with:inventories', 'integer', 'exists:inventories,id'],
            'inventories.*.quantity' => ['required_with:inventories', 'numeric', 'min:0.01'],
            'inventories.*.note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Task name is required',
            'group_id.required' => 'Task group is required',
            'end_date.after_or_equal' => 'End date must be after or equal to start date',
            'relation_type_id.required_with' => 'Relation type is required when task dependency is set',
        ];
    }
}

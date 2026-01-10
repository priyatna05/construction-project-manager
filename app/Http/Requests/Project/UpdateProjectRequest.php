<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Label;

class UpdateProjectRequest extends FormRequest
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
        // Mengambil ID proyek dari route.
        $projectId = $this->route('project') ? $this->route('project')->id : null;

        return [
            'code'              => 'string|nullable',
            'name'              => [
                'sometimes', // Hanya validasi jika dikirim
                'required',
                'string',
                Rule::unique('projects', 'name')->ignore($projectId),
            ],
            'description'       => 'string|nullable',

            'start_date'        => 'sometimes|required|date',
            'end_date'          => 'sometimes|required|date|after_or_equal:start_date',

            'budget_project_estimate'    => 'numeric|min:0|nullable',

            // Budget rates
            'overhead_site_rate' => 'numeric|min:0|max:100|nullable',
            'administrative_rate' => 'numeric|min:0|max:100|nullable',
            'contingency_rate' => 'numeric|min:0|max:100|nullable',
            'profit_rate' => 'numeric|min:0|max:100|nullable',
            'tax_rate' => 'numeric|min:0|max:100|nullable',

            'users'             => 'nullable|array',
            'users.*'           => 'integer|exists:users,id',

            // --- PERBAIKAN PENTING UNTUK ATTACHMENTS DI SINI ---
            // Di frontend Anda menggunakan 'attachment_files' untuk file baru
            // dan 'deleted_attachments_ids' untuk ID yang dihapus.
            // Validasi harus sesuai dengan nama field yang dikirim dari frontend.

            'attachment_files'       => 'nullable|array', // Mengubah 'attachments' menjadi 'attachment_files'
            'attachment_files.*'     => 'file|max:10240', // Validasi untuk setiap file, max 10MB

            'existing_attachments' => 'nullable|array',
            'existing_attachments.*.id' => 'required|integer|exists:attachments,id',
            'existing_attachments.*.is_main' => 'boolean',

            'deleted_attachments_ids'   => 'nullable|array', // Mengubah 'deleted_attachments' menjadi 'deleted_attachments_ids'
            'deleted_attachments_ids.*' => 'integer|exists:attachments,id',
            // --- AKHIR PERBAIKAN PENTING ---

            // Field-field lain dari frontend
            'type_id' => ['nullable', Rule::exists('labels', 'slug')->where('type', Label::TYPE_KONTRAK)], // 'nullable' jika tipe proyek tidak wajib
            'status_ids' => ['nullable','array'], // 'nullable' jika status proyek tidak wajib
            'status_ids.*' => ['exists:labels,slug'], // Memastikan status adalah slug yang ada di tabel label

            'is_completed' => 'boolean|nullable',
            'completed_at' => 'nullable|date',
            // 'generate_task_groups' => 'string|nullable', // Ini tidak terlihat di form frontend Anda, jadi mungkin tidak perlu.
        ];
    }
}

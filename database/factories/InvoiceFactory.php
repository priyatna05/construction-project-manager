<?php

namespace Database\Factories;

use App\Models\ClientCompany;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use App\Models\User;
use App\Models\Label;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    // ... (properti static dan method initializeLabels() tetap sama) ...
    private static $invoiceStatuses;
    private static $invoiceTypes;
    private function initializeLabels(): void
    {
        if (is_null(self::$invoiceStatuses)) {
            self::$invoiceStatuses = Label::where('type', 'invoice_status')->pluck('slug');
            self::$invoiceTypes = Label::where('type', 'invoice_type')->pluck('slug');
        }
    }


    public function definition(): array
    {
        $this->initializeLabels();

        // ... (semua logika di dalam definition() tetap sama, TAPI kita set finansial ke 0) ...
        $clientCompany = ClientCompany::inRandomOrder()->first() ?? ClientCompany::factory()->create();
        $project = Project::where('client_company_id', $clientCompany->id)->inRandomOrder()->first() ?? Project::factory()->create(['client_company_id' => $clientCompany->id]);
        $projectStart = Carbon::parse($project->start_date);
        $projectEnd = Carbon::parse($project->end_date);
        $invoiceDate = Carbon::instance($this->faker->dateTimeBetween(
            $projectStart->copy()->addDays($projectStart->diffInDays($projectEnd) / 2),
            $projectEnd->copy()->addMonths(2)
        ));
        $dueDate = $invoiceDate->copy()->addDays($this->faker->numberBetween(7, 30));
        $status = self::$invoiceStatuses->isNotEmpty() ? $this->faker->randomElement(self::$invoiceStatuses) : 'draft';
        $type = self::$invoiceTypes->isNotEmpty() ? $this->faker->randomElement(self::$invoiceTypes) : 'standard';

        return [
            'client_company_id'     => $clientCompany->id,
            'project_id'            => $project->id,
            'created_by_user_id'    => User::role('admin')->inRandomOrder()->first()?->id ?? User::factory()->create()->assignRole('admin'),
            'number'                => 'INV-' . $invoiceDate->format('Ym') . '-' . fake()->unique()->numerify('#####'),
            'status'                => $status,
            'type'                  => $type,
            'note'                  => $this->faker->optional()->sentence,
            'terms'                 => $this->faker->optional()->paragraph(1),

            // Set semua nilai finansial ke 0 pada awalnya.
            // Nilai ini akan dihitung ulang di hook afterCreating.
            'subtotal_amount'       => 0,
            'tax_amount'            => 0,
            'total_amount'          => 0,

            'invoice_date'          => $invoiceDate->toDateString(),
            'due_date'              => $dueDate->toDateString(),
            'paid_at'               => null,
            'filename'              => null,
            'archived_at'           => null,
        ];
    }

    /**
     * Konfigurasi state setelah model dibuat.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Invoice $invoice) {

            // --- LANGKAH 1: Buat Invoice Items terlebih dahulu ---
            InvoiceItem::factory($this->faker->numberBetween(2, 5))
                ->create(['invoice_id' => $invoice->id]);

            // --- LANGKAH 2: Muat ulang invoice dan hitung ulang total ---
            $invoice->refresh(); // Muat ulang untuk mendapatkan relasi 'items'

            $subtotal = $invoice->items->sum('total_price');
            $taxRate = 0.11; // Contoh PPN 11%
            $taxAmount = $subtotal * $taxRate;

            // Update nilai finansial invoice berdasarkan item-itemnya
            $invoice->subtotal_amount = $subtotal;
            $invoice->tax_amount = $taxAmount;
            $invoice->total_amount = $subtotal + $taxAmount;

            // --- LANGKAH 3: Atur status dan tanggal khusus SETELAH total dihitung ---
            if ($invoice->status === 'paid') {
                $invoice->paid_at = $this->faker->dateTimeBetween($invoice->invoice_date, $invoice->due_date);
            }
            if ($invoice->status === 'overdue' && Carbon::parse($invoice->due_date)->isFuture()) {
                $invoice->due_date = now()->subDays($this->faker->numberBetween(5, 20));
            }

            // --- LANGKAH 4: Simpan semua perubahan dalam satu kali query ---
            $invoice->save();
        });
    }
}

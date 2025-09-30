<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Label;
use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    /**
     * Mendefinisikan atribut dasar untuk model Inventory.
     * Perhatikan bahwa kita TIDAK mendefinisikan status, tipe, atau unit di sini.
     */
    public function definition(): array
    {
        $constructionItems = [
            'Besi Beton', 'Semen Portland', 'Pasir Cor', 'Kerikil Split', 'Batu Bata Merah', 'Kayu Balok 5/10',
            'Triplek 9mm', 'Cat Tembok Interior', 'Paku Beton', 'Kawat Bendrat', 'Pipa PVC 4 inch',
            'Keramik Lantai 40x40', 'Genteng Metal', 'Kabel Listrik NYM 3x2.5', 'Plafon Gypsum',
            'Lem Konstruksi', 'Baut dan Mur M12', 'Tangga Aluminium 3m', 'Safety Helmet Proyek', 'Sarung Tangan Kulit'
        ];

        return [
            'created_by_user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'code' => null, // Biarkan Observer yang menangani ini
            'name' => $this->faker->randomElement($constructionItems) . ' ' . $this->faker->bothify('##??'),
            'description' => $this->faker->optional()->sentence(),
            'unit_cost' => $this->faker->numberBetween(10000, 5000000), // Dalam satuan terkecil
            'quantity_on_hand' => $this->faker->randomFloat(2, 10, 500),
            'project_site_location_id' => Project::inRandomOrder()->first()?->id,
            'archived_at' => null,
        ];
    }

    /**
     * Hook yang berjalan SETELAH inventory dibuat.
     * Di sinilah kita akan melampirkan label.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Inventory $inventory) {

            // Gunakan cache statis agar query ke tabel labels hanya berjalan sekali
            static $labelCache = [];
            if (empty($labelCache)) {
                $labelCache['statuses'] = Label::ofType(Label::TYPE_INVENTORY_STATUS)->pluck('id');
                $labelCache['types'] = Label::ofType(Label::TYPE_INVENTORY_TYPE)->pluck('id');
                $labelCache['units'] = Label::ofType(Label::TYPE_INVENTORY_UNIT)->pluck('id');
            }

            $labelsToAttach = [];

            // Pilih satu label dari setiap kategori secara acak
            if ($labelCache['statuses']->isNotEmpty()) {
                $labelsToAttach[] = $labelCache['statuses']->random();
            }
            if ($labelCache['types']->isNotEmpty()) {
                $labelsToAttach[] = $labelCache['types']->random();
            }
            if ($labelCache['units']->isNotEmpty()) {
                $labelsToAttach[] = $labelCache['units']->random();
            }

            // Lampirkan semua label yang terpilih ke inventory menggunakan tabel pivot
            if (!empty($labelsToAttach)) {
                $inventory->labels()->sync($labelsToAttach);
            }
        });
    }
}

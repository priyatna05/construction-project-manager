<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Inventory Code Prefixes
    |--------------------------------------------------------------------------
    |
    | Ini adalah daftar slug label tipe inventory dan prefix yang akan digunakan
    | untuk membuat kode unik inventory (contoh: MAT-NPROJ-0001-01).
    |
    | Anda bisa menambah jenis tipe inventaris baru dengan menambahkan
    | pasangan 'slug' => 'PREFIX' pada array berikut.
    |
    */

    'prefixes' => [
        'material'   => 'MAT',
        'equipment'  => 'EQP',
        'tool'       => 'TOL',
        'supply'     => 'SUP',
        'consumable' => 'CON',
        'asset'      => 'AST',
        'vehicle'    => 'VEH',
        'chemical'   => 'CHM',
        'service'    => 'SVC',
        // Tambah di sini jika ada label slug baru
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Prefix
    |--------------------------------------------------------------------------
    |
    | Jika label slug tidak ditemukan pada daftar prefixes di atas,
    | maka prefix default ini akan digunakan.
    |
    */

    'default_prefix' => 'INV',
];

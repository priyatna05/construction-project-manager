<?php

return [
    'cpi_threshold' => env('EVM_CPI_THRESHOLD', 0.9),
    'spi_threshold' => env('EVM_SPI_THRESHOLD', 0.9),
    'notify_enabled' => env('EVM_NOTIFY_ENABLED', true),
    'email_enabled' => env('EVM_NOTIFY_EMAIL', false),
];

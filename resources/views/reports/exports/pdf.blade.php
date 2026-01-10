<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $export->name }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h1 { font-size: 18px; margin: 0 0 6px; }
        h2 { font-size: 14px; margin: 16px 0 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f5f5f5; }
        .meta { margin-bottom: 12px; }
        .meta div { margin-bottom: 2px; }
        .muted { color: #666; }
    </style>
</head>
<body>
    <h1>{{ $export->name }}</h1>
    <div class="meta">
        <div><strong>Type:</strong> {{ strtoupper($export->report_type) }}</div>
        <div><strong>Format:</strong> {{ strtoupper($export->format) }}</div>
        <div><strong>Generated:</strong> {{ $payload['generated_at'] ?? '' }}</div>
        <div><strong>Period:</strong> {{ $payload['period'] ?? '' }}</div>
        <div><strong>Range:</strong> {{ $payload['range']['start'] ?? '' }} to {{ $payload['range']['end'] ?? '' }}</div>
    </div>

    @if (($payload['type'] ?? '') === 'evm')
        <h2>Project Metrics</h2>
        <table>
            <thead>
                <tr>
                    <th>Project</th>
                    <th>PV</th>
                    <th>EV</th>
                    <th>AC</th>
                    <th>BAC</th>
                    <th>CPI</th>
                    <th>SPI</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payload['project_metrics'] ?? [] as $metric)
                    <tr>
                        <td>{{ $metric['name'] ?? '' }}</td>
                        <td>{{ $metric['pv'] ?? '' }}</td>
                        <td>{{ $metric['ev'] ?? '' }}</td>
                        <td>{{ $metric['ac'] ?? '' }}</td>
                        <td>{{ $metric['bac'] ?? '' }}</td>
                        <td>{{ $metric['cpi'] ?? '' }}</td>
                        <td>{{ $metric['spi'] ?? '' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="muted">No project metrics.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <h2>EVM Trend</h2>
        <table>
            <thead>
                <tr>
                    <th>Period</th>
                    <th>PV</th>
                    <th>EV</th>
                    <th>AC</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payload['evm_trend'] ?? [] as $row)
                    <tr>
                        <td>{{ $row['period'] ?? '' }}</td>
                        <td>{{ $row['pv'] ?? '' }}</td>
                        <td>{{ $row['ev'] ?? '' }}</td>
                        <td>{{ $row['ac'] ?? '' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="muted">No trend data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @elseif (($payload['type'] ?? '') === 'resource_usage')
        <h2>Resource Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Resource</th>
                    <th>Total Cost</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payload['resource_breakdown'] ?? [] as $row)
                    <tr>
                        <td>{{ $row['name'] ?? '' }}</td>
                        <td>{{ $row['value'] ?? '' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="2" class="muted">No resource data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @elseif (($payload['type'] ?? '') === 'task_status')
        <h2>Overdue Trend</h2>
        <table>
            <thead>
                <tr>
                    <th>Period</th>
                    <th>Overdue</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payload['overdue_trend'] ?? [] as $row)
                    <tr>
                        <td>{{ $row['period'] ?? '' }}</td>
                        <td>{{ $row['overdue'] ?? '' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="2" class="muted">No overdue data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @elseif (($payload['type'] ?? '') === 'inventory_movement')
        <h2>Inventory Movements</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Inventory</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($payload['allocations'] ?? [] as $row)
                    <tr>
                        <td>{{ $row['created_at'] ?? '' }}</td>
                        <td>{{ $row['project'] ?? '' }}</td>
                        <td>{{ $row['task'] ?? '' }}</td>
                        <td>{{ ($row['inventory_code'] ?? '') . ' ' . ($row['inventory_name'] ?? '') }}</td>
                        <td>{{ $row['quantity'] ?? '' }}</td>
                        <td>{{ $row['cost'] ?? '' }}</td>
                        <td>{{ $row['notes'] ?? '' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="muted">No inventory movement data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @else
        <p class="muted">No data available for this report type.</p>
    @endif
</body>
</html>

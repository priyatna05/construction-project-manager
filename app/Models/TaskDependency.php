<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;


class TaskDependency extends Pivot
{
    protected $table = 'task_dependencies';

    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function dependsOn()
    {
        return $this->belongsTo(Task::class, 'depends_on_task_id');
    }

     public function relationType()
    {
        return $this->belongsTo(Label::class, 'relation_type_id');
    }
}

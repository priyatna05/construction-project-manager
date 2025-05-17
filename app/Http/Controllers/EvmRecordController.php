<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Project;
use App\Models\Tasks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvmRecordController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    public function index(){
        return Interia::render('EvmRecord/Index',[

        ]);
    }


    }

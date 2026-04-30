<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(Employee::orderBy('last_name')->orderBy('first_name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'identifier' => ['required', 'string', 'max:255', 'unique:employees,identifier'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
        ]);

        $employee = Employee::create([
            ...$data,
            'is_active' => true,
        ]);

        return response()->json($employee, Response::HTTP_CREATED);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'identifier' => ['sometimes', 'string', 'max:255', 'unique:employees,identifier,' . $employee->id],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $employee->update($data);

        return response()->json($employee->fresh());
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_employee(): void
    {
        $response = $this->postJson('/api/employees', [
            'identifier' => 'SCAN-100',
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
        ]);

        $response->assertCreated()
            ->assertJsonPath('identifier', 'SCAN-100')
            ->assertJsonPath('is_active', true);

        $this->assertDatabaseHas('employees', [
            'identifier' => 'SCAN-100',
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
            'is_active' => 1,
        ]);
    }

    public function test_can_deactivate_employee(): void
    {
        $employee = Employee::create([
            'identifier' => 'SCAN-200',
            'first_name' => 'Anna',
            'last_name' => 'Nowak',
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/employees/{$employee->id}", [
            'is_active' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('is_active', false);

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'is_active' => 0,
        ]);
    }
}

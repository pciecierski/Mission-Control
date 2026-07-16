<?php

namespace Tests\Feature;

use Tests\TestCase;

class OpenApiDocsTest extends TestCase
{
    public function test_openapi_ui_is_available(): void
    {
        $this->get('/OpenAPI')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('swagger-ui', false)
            ->assertSee('openapi.yaml', false);
    }

    public function test_openapi_yaml_specs_are_available(): void
    {
        foreach (['openapi.yaml', 'queue.yaml', 'employees.yaml', 'links.yaml'] as $file) {
            $this->get('/OpenAPI/' . $file)
                ->assertOk()
                ->assertHeader('Content-Type', 'application/yaml; charset=UTF-8')
                ->assertSee('openapi:', false);
        }
    }

    public function test_openapi_rejects_path_traversal(): void
    {
        $this->get('/OpenAPI/../index.php')->assertNotFound();
    }
}

<?php

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect('/');
})->skip('Dashboard is a phase-2 feature — no dashboard route yet.');

test('authenticated users can visit the dashboard', function () {
    // Dashboard page does not exist in the MVP; revisit in phase 2.
})->skip('Dashboard is a phase-2 feature — no dashboard route yet.');

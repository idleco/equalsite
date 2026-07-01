<?php

test('home page returns a successful response', function () {
    $response = $this->get(route('audit.create'));

    $response->assertOk();
});

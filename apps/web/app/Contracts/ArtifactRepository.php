<?php

namespace App\Contracts;

interface ArtifactRepository
{
    /** @return \App\Value\AxeResult[] */
    public function getAxeResults(string $id): array;

    public function getPath(string $id): string;
}

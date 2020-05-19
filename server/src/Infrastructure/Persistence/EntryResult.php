<?php

namespace App\Infrastructure\Persistence;

class EntryResult {
    public $time;
    public $duration;

    public function populate($row) {
        $this->time     = $row['time'];
        $this->duration = $row['duration'];
    }
}
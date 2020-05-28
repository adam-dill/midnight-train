<?php

namespace App\Infrastructure\Persistence;

class StatusResult {
    public $key;
    public $value;

    public function populate($row) {
        $this->key = $row['key'];
        $this->value = $row['value'];
    }
}
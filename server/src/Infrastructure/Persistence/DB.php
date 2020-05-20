<?php
declare(strict_types=1);

namespace App\Infrastructure\Persistence;

class DB
{
    protected $pdo;

    /**
     * DB constructor.
     */
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getEntries($offset=0, $limit=PHP_INT_MAX) {
        $query = 'SELECT * FROM entries ORDER BY time DESC LIMIT '.$offset.', '.$limit.';';
        $stm = $this->pdo->prepare($query);
        $stm->execute();
        $returnValue = array();
        while($row = $stm->fetch()) {
            $entry = new EntryResult();
            $entry->populate($row);
            array_push($returnValue, $entry);
        }

        return $returnValue;
    }

    public function postEntry($data) {
        $query = "INSERT INTO entries (time, duration) VALUES (:time, :duration)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':time', $data->time);
        $stmt->bindParam(':duration', $data->duration);
        $stmt->execute();
    }
}

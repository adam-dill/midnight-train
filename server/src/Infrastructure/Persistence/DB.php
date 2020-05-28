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

    public function getNumOfEntries() {
        $query = 'SELECT COUNT(*) FROM entries';
        $stm = $this->pdo->prepare($query);
        $stm->execute();

        return $stm->fetchColumn();
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
        $this->setLastUpdateTime();
        $query = "INSERT INTO entries (time, duration) VALUES (:time, :duration)";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':time', $data->time);
        $stmt->bindParam(':duration', $data->duration);
        $stmt->execute();
    }

    public function postTemperature($data) {
        $this->setLastUpdateTime();
        $query = "UPDATE `status` SET `value`=:temperature WHERE `key`='temperature'";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':temperature', $data->temperature);
        $stmt->execute();
    }

    public function getStatus() {
        $query = 'SELECT * FROM `status`';
        $stm = $this->pdo->prepare($query);
        $stm->execute();
        $returnValue = array();
        while($row = $stm->fetch()) {
            $entry = new StatusResult();
            $entry->populate($row);
            array_push($returnValue, $entry);
        }
        
        $query = 'SELECT CURRENT_TIMESTAMP';
        $stm = $this->pdo->prepare($query);
        $stm->execute();
        $row = $stm->fetch();
        $obj = new StatusResult();
        $obj->key = "CURRENT_TIMESTAMP";
        $obj->value = $row["CURRENT_TIMESTAMP"];
        array_push($returnValue, $obj);

        return $returnValue;
    }

    private function setLastUpdateTime() {
        $query = "UPDATE `status` SET `value`=CURRENT_TIMESTAMP WHERE `key`='lastUpdate'";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute();
    }
}

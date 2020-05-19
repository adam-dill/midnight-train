<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use App\Application\Actions\Action;
use Psr\Log\LoggerInterface;
use App\Infrastructure\Persistence\DB;

abstract class EntryAction extends Action
{
    /**
     * @var DB
     */
    protected $db;



    /**
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger, DB $db)
    {
        parent::__construct($logger, $db);
        $this->db = $db;
    }
}

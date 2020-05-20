<?php
declare(strict_types=1);

namespace App\Application\Actions\Entry;

use Psr\Http\Message\ResponseInterface as Response;

class GetNumOfEntryAction extends EntryAction
{
    /**
     * {@inheritdoc}
     */
    protected function action(): Response
    {
        $result = $this->db->getNumOfEntries();
        $this->logger->info("Getting the number of entries.");
        
        return $this->respondWithData($result);
    }
}
